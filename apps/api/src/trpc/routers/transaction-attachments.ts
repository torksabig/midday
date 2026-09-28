import {
  createAttachmentsSchema,
  deleteAttachmentSchema,
  processTransactionAttachmentSchema,
} from "@api/schemas/transaction-attachments";
import {
  assertLegacyIdentityFallbackAllowed,
  tryDelegateAttachmentsCreateMany,
  tryDelegateAttachmentDelete,
} from "@api/services/replacement-delegation";
import { createTRPCRouter, protectedProcedure } from "@api/trpc/init";
import { createAttachments, deleteAttachment } from "@midday/db/queries";
import { allowedMimeTypes } from "@midday/documents/utils";
import { triggerJob } from "@midday/job-client";
import { shouldDelegateToReplacementBackend } from "@midday/replacement-backend";

export const transactionAttachmentsRouter = createTRPCRouter({
  createMany: protectedProcedure
    .input(createAttachmentsSchema)
    .mutation(async ({ input, ctx: { db, teamId, session, accessToken } }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateAttachmentsCreateMany(
          input.map((a) => ({
            type: a.type,
            name: a.name,
            size: a.size,
            path: a.path,
            transactionId: a.transactionId,
          })),
          accessToken,
        );
        if (delegated.delegated) {
          return delegated.attachments;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return createAttachments(db, {
        teamId: teamId!,
        userId: session.user.id,
        attachments: input,
      });
    }),

  delete: protectedProcedure
    .input(deleteAttachmentSchema)
    .mutation(async ({ input, ctx: { db, teamId, accessToken } }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateAttachmentDelete(
          input.id,
          accessToken,
        );
        if (delegated.delegated) {
          return delegated.result;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return deleteAttachment(db, {
        id: input.id,
        teamId: teamId!,
      });
    }),

  processAttachment: protectedProcedure
    .input(processTransactionAttachmentSchema)
    .mutation(async ({ input, ctx: { teamId } }) => {
      const allowedAttachments = input.filter((item) =>
        allowedMimeTypes.includes(item.mimetype),
      );

      if (allowedAttachments.length === 0) {
        return;
      }

      // Trigger BullMQ jobs for each attachment
      const jobResults = await Promise.all(
        allowedAttachments.map((item) =>
          triggerJob(
            "process-transaction-attachment",
            {
              filePath: item.filePath,
              mimetype: item.mimetype,
              teamId: teamId!,
              transactionId: item.transactionId,
            },
            "transactions",
          ),
        ),
      );

      return {
        jobs: jobResults.map((result) => ({ id: result.id })),
      };
    }),
});

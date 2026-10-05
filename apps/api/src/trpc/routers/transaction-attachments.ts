import {
  createAttachmentsSchema,
  deleteAttachmentSchema,
  enqueueProcessTransactionAttachmentsSchema,
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
import type { z } from "zod";

type ProcessTransactionAttachmentsInput = z.infer<
  typeof processTransactionAttachmentSchema
>;

async function enqueueTransactionAttachmentJobs(
  teamId: string,
  input: ProcessTransactionAttachmentsInput,
) {
  const allowedAttachments = input.filter((item) =>
    allowedMimeTypes.includes(item.mimetype),
  );

  if (allowedAttachments.length === 0) {
    return;
  }

  const jobResults = await Promise.all(
    allowedAttachments.map((item) =>
      triggerJob(
        "process-transaction-attachment",
        {
          filePath: item.filePath,
          mimetype: item.mimetype,
          teamId,
          transactionId: item.transactionId,
        },
        "transactions",
      ),
    ),
  );

  return {
    jobs: jobResults.map((result) => ({ id: result.id })),
  };
}

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

  /** Job-only half after dashboard Rust `POST /api/v1/transaction-attachments`. */
  enqueueProcessTransactionAttachments: protectedProcedure
    .input(enqueueProcessTransactionAttachmentsSchema)
    .mutation(async ({ input, ctx: { teamId } }) => {
      return enqueueTransactionAttachmentJobs(teamId!, input);
    }),

  /** Non-dashboard callers; dashboard uses Rust createMany + `enqueueProcessTransactionAttachments`. */
  processAttachment: protectedProcedure
    .input(processTransactionAttachmentSchema)
    .mutation(async ({ input, ctx: { teamId } }) => {
      return enqueueTransactionAttachmentJobs(teamId!, input);
    }),
});

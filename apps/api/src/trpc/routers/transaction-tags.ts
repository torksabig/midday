import {
  createTransactionTagSchema,
  deleteTransactionTagSchema,
} from "@api/schemas/transaction-tags";
import {
  assertLegacyIdentityFallbackAllowed,
  tryDelegateTransactionTagCreate,
  tryDelegateTransactionTagDelete,
} from "@api/services/replacement-delegation";
import { createTRPCRouter, protectedProcedure } from "@api/trpc/init";
import { shouldDelegateToReplacementBackend } from "@midday/replacement-backend";
import { createTransactionTag, deleteTransactionTag } from "@midday/db/queries";

export const transactionTagsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createTransactionTagSchema)
    .mutation(async ({ ctx: { db, teamId, accessToken }, input }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateTransactionTagCreate(
          input.transactionId,
          input.tagId,
          accessToken,
        );
        if (delegated.delegated) {
          return delegated.rows;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return createTransactionTag(db, {
        teamId: teamId!,
        transactionId: input.transactionId,
        tagId: input.tagId,
      });
    }),

  delete: protectedProcedure
    .input(deleteTransactionTagSchema)
    .mutation(async ({ ctx: { db, teamId, accessToken }, input }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateTransactionTagDelete(
          input.transactionId,
          input.tagId,
          accessToken,
        );
        if (delegated.delegated) {
          return delegated.result;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return deleteTransactionTag(db, {
        transactionId: input.transactionId,
        tagId: input.tagId,
        teamId: teamId!,
      });
    }),
});

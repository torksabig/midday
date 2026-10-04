import {
  createTransactionTagSchema,
  deleteTransactionTagSchema,
} from "@api/schemas/transaction-tags";
import {
  assertNoLegacyFallback,
  tryDelegateTransactionTagCreate,
  tryDelegateTransactionTagDelete,
} from "@api/services/replacement-delegation";
import { createTRPCRouter, protectedProcedure } from "@api/trpc/init";

/** Stage 4: dashboard uses Rust directly; keep AppRouter for queryKey/RouterOutputs only. */
export const transactionTagsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createTransactionTagSchema)
    .mutation(async ({ ctx: { accessToken }, input }) => {
      const delegated = await tryDelegateTransactionTagCreate(
        input.transactionId,
        input.tagId,
        accessToken,
      );
      if (delegated.delegated) {
        return delegated.rows;
      }
      return assertNoLegacyFallback("transactionTags.create");
    }),

  delete: protectedProcedure
    .input(deleteTransactionTagSchema)
    .mutation(async ({ ctx: { accessToken }, input }) => {
      const delegated = await tryDelegateTransactionTagDelete(
        input.transactionId,
        input.tagId,
        accessToken,
      );
      if (delegated.delegated) {
        return delegated.result;
      }
      return assertNoLegacyFallback("transactionTags.delete");
    }),
});

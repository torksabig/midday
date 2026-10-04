import {
  createTransactionCategorySchema,
  deleteTransactionCategorySchema,
  getCategoriesSchema,
  getCategoryByIdSchema,
  updateTransactionCategorySchema,
} from "@api/schemas/transaction-categories";
import {
  assertNoLegacyFallback,
  tryDelegateTransactionCategoriesGet,
  tryDelegateTransactionCategoriesGetById,
  tryDelegateTransactionCategoryCreate,
  tryDelegateTransactionCategoryUpdate,
  tryDelegateTransactionCategoryDelete,
} from "@api/services/replacement-delegation";
import { createTRPCRouter, protectedProcedure } from "@api/trpc/init";

/** Stage 4: dashboard uses Rust directly; keep AppRouter for queryKey/RouterOutputs only. */
export const transactionCategoriesRouter = createTRPCRouter({
  get: protectedProcedure
    .input(getCategoriesSchema)
    .query(async ({ ctx: { accessToken }, input }) => {
      const delegated = await tryDelegateTransactionCategoriesGet(accessToken);
      if (delegated) {
        if (input?.limit != null && delegated.length > input.limit) {
          return delegated.slice(0, input.limit);
        }
        return delegated;
      }
      return assertNoLegacyFallback("transactionCategories.get");
    }),

  getById: protectedProcedure
    .input(getCategoryByIdSchema)
    .query(async ({ input, ctx: { accessToken } }) => {
      const delegated = await tryDelegateTransactionCategoriesGetById(
        input.id,
        accessToken,
      );
      if (delegated.delegated) {
        return delegated.category ?? null;
      }
      return assertNoLegacyFallback("transactionCategories.getById");
    }),

  create: protectedProcedure
    .input(createTransactionCategorySchema)
    .mutation(async ({ input, ctx: { accessToken } }) => {
      const delegated = await tryDelegateTransactionCategoryCreate(
        input,
        accessToken,
      );
      if (delegated.delegated) {
        return delegated.category;
      }
      return assertNoLegacyFallback("transactionCategories.create");
    }),

  update: protectedProcedure
    .input(updateTransactionCategorySchema)
    .mutation(async ({ input, ctx: { accessToken } }) => {
      const { id, ...rest } = input;
      const delegated = await tryDelegateTransactionCategoryUpdate(
        id,
        {
          ...rest,
          clearParent: rest.parentId === null,
        },
        accessToken,
      );
      if (delegated.delegated) {
        return delegated.category;
      }
      return assertNoLegacyFallback("transactionCategories.update");
    }),

  delete: protectedProcedure
    .input(deleteTransactionCategorySchema)
    .mutation(async ({ input, ctx: { accessToken } }) => {
      const delegated = await tryDelegateTransactionCategoryDelete(
        input.id,
        accessToken,
      );
      if (delegated.delegated) {
        return delegated.category;
      }
      return assertNoLegacyFallback("transactionCategories.delete");
    }),
});

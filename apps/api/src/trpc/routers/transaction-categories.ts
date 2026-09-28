import {
  createTransactionCategorySchema,
  deleteTransactionCategorySchema,
  getCategoriesSchema,
  getCategoryByIdSchema,
  updateTransactionCategorySchema,
} from "@api/schemas/transaction-categories";
import {
  assertLegacyIdentityFallbackAllowed,
  tryDelegateTransactionCategoriesGet,
  tryDelegateTransactionCategoriesGetById,
} from "@api/services/replacement-delegation";
import { createTRPCRouter, protectedProcedure } from "@api/trpc/init";
import { shouldDelegateToReplacementBackend } from "@midday/replacement-backend";
import {
  createTransactionCategory,
  deleteTransactionCategory,
  getCategories,
  getCategoryById,
  updateTransactionCategory,
} from "@midday/db/queries";

export const transactionCategoriesRouter = createTRPCRouter({
  get: protectedProcedure
    .input(getCategoriesSchema)
    .query(async ({ ctx: { db, teamId, accessToken }, input }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateTransactionCategoriesGet(
          accessToken,
        );
        if (delegated) {
          if (input?.limit != null && delegated.length > input.limit) {
            return delegated.slice(0, input.limit);
          }
          return delegated;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      const data = await getCategories(db, {
        teamId: teamId!,
        limit: input?.limit,
      });

      return data;
    }),

  getById: protectedProcedure
    .input(getCategoryByIdSchema)
    .query(async ({ input, ctx: { db, teamId, accessToken } }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateTransactionCategoriesGetById(
          input.id,
          accessToken,
        );
        if (delegated.delegated) {
          return delegated.category ?? null;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return getCategoryById(db, { id: input.id, teamId: teamId! });
    }),

  create: protectedProcedure
    .input(createTransactionCategorySchema)
    .mutation(async ({ input, ctx: { db, teamId, session } }) => {
      return createTransactionCategory(db, {
        teamId: teamId!,
        userId: session.user.id,
        ...input,
      });
    }),

  update: protectedProcedure
    .input(updateTransactionCategorySchema)
    .mutation(async ({ input, ctx: { db, teamId } }) => {
      return updateTransactionCategory(db, {
        ...input,
        teamId: teamId!,
      });
    }),

  delete: protectedProcedure
    .input(deleteTransactionCategorySchema)
    .mutation(async ({ input, ctx: { db, teamId } }) => {
      return deleteTransactionCategory(db, {
        id: input.id,
        teamId: teamId!,
      });
    }),
});

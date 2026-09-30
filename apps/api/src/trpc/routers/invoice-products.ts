import {
  createInvoiceProductSchema,
  deleteInvoiceProductSchema,
  getInvoiceProductSchema,
  getInvoiceProductsSchema,
  saveLineItemAsProductSchema,
  updateInvoiceProductSchema,
  upsertInvoiceProductSchema,
} from "@api/schemas/invoice";
import {
  assertLegacyIdentityFallbackAllowed,
  tryDelegateInvoiceProductsGet,
  tryDelegateInvoiceProductGetById,
  tryDelegateInvoiceProductDelete,
  tryDelegateInvoiceProductIncrementUsage,
  tryDelegateInvoiceProductCreate,
  tryDelegateInvoiceProductUpsert,
  tryDelegateInvoiceProductUpdate,
  tryDelegateInvoiceProductSaveLineItem,
} from "@api/services/replacement-delegation";
import { createTRPCRouter, protectedProcedure } from "@api/trpc/init";
import {
  createInvoiceProduct,
  deleteInvoiceProduct,
  getInvoiceProductById,
  getInvoiceProducts,
  incrementProductUsage,
  saveLineItemAsProduct,
  updateInvoiceProduct,
  upsertInvoiceProduct,
} from "@midday/db/queries";
import { shouldDelegateToReplacementBackend } from "@midday/replacement-backend";
import { TRPCError } from "@trpc/server";

export const invoiceProductsRouter = createTRPCRouter({
  get: protectedProcedure
    .input(getInvoiceProductsSchema)
    .query(async ({ input, ctx: { db, teamId, accessToken } }) => {
      const {
        sortBy = "popular",
        limit = 50,
        includeInactive = false,
        currency,
      } = input || {};

      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateInvoiceProductsGet(
          { sortBy, limit, includeInactive, currency: currency ?? undefined },
          accessToken,
        );
        if (delegated) {
          return delegated;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return getInvoiceProducts(db, teamId!, {
        sortBy,
        limit,
        includeInactive,
        currency,
      });
    }),

  getById: protectedProcedure
    .input(getInvoiceProductSchema)
    .query(async ({ input, ctx: { db, teamId, accessToken } }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateInvoiceProductGetById(
          input.id,
          accessToken,
        );
        if (delegated.delegated) {
          return delegated.product;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return getInvoiceProductById(db, input.id, teamId!);
    }),

  create: protectedProcedure
    .input(createInvoiceProductSchema)
    .mutation(async ({ input, ctx: { db, teamId, session, accessToken } }) => {
      if (shouldDelegateToReplacementBackend()) {
        try {
          const delegated = await tryDelegateInvoiceProductCreate(
            input,
            accessToken,
          );
          if (delegated.delegated) {
            return delegated.product;
          }
          assertLegacyIdentityFallbackAllowed();
        } catch (error) {
          if (
            error instanceof TRPCError &&
            error.code === "INTERNAL_SERVER_ERROR"
          ) {
            throw error;
          }
          throw new TRPCError({ code: "CONFLICT" });
        }
      }

      try {
        return await createInvoiceProduct(db, {
          ...input,
          teamId: teamId!,
          createdBy: session.user.id,
        });
      } catch (_error) {
        throw new TRPCError({
          code: "CONFLICT",
        });
      }
    }),

  upsert: protectedProcedure
    .input(upsertInvoiceProductSchema)
    .mutation(async ({ input, ctx: { db, teamId, session, accessToken } }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateInvoiceProductUpsert(
          input,
          accessToken,
        );
        if (delegated.delegated) {
          return delegated.product;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return upsertInvoiceProduct(db, {
        ...input,
        teamId: teamId!,
        createdBy: session.user.id,
      });
    }),

  updateProduct: protectedProcedure
    .input(updateInvoiceProductSchema)
    .mutation(async ({ input, ctx: { db, teamId, accessToken } }) => {
      const { id, ...updateData } = input;

      if (shouldDelegateToReplacementBackend()) {
        try {
          const delegated = await tryDelegateInvoiceProductUpdate(
            id,
            updateData,
            accessToken,
          );
          if (delegated.delegated) {
            return delegated.product;
          }
          assertLegacyIdentityFallbackAllowed();
        } catch (error) {
          if (
            error instanceof TRPCError &&
            error.code === "INTERNAL_SERVER_ERROR"
          ) {
            throw error;
          }
          throw new TRPCError({ code: "CONFLICT" });
        }
      }

      try {
        return await updateInvoiceProduct(db, {
          ...input,
          teamId: teamId!,
        });
      } catch (_error: any) {
        throw new TRPCError({
          code: "CONFLICT",
        });
      }
    }),

  delete: protectedProcedure
    .input(deleteInvoiceProductSchema)
    .mutation(async ({ input, ctx: { db, teamId, accessToken } }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateInvoiceProductDelete(
          input.id,
          accessToken,
        );
        if (delegated.delegated) {
          return delegated.deleted;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return deleteInvoiceProduct(db, input.id, teamId!);
    }),

  incrementUsage: protectedProcedure
    .input(getInvoiceProductSchema)
    .mutation(async ({ input, ctx: { db, teamId, accessToken } }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateInvoiceProductIncrementUsage(
          input.id,
          accessToken,
        );
        if (delegated.delegated) {
          return delegated.result;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      await incrementProductUsage(db, input.id, teamId!);
      return { success: true };
    }),

  saveLineItemAsProduct: protectedProcedure
    .input(saveLineItemAsProductSchema)
    .mutation(async ({ input, ctx: { db, teamId, session, accessToken } }) => {
      // Convert input to LineItem format
      const lineItem = {
        name: input.name,
        price: input.price || undefined,
        unit: input.unit || undefined,
        productId: input.productId,
      };

      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateInvoiceProductSaveLineItem(
          {
            name: input.name,
            price: input.price,
            unit: input.unit,
            productId: input.productId,
            currency: input.currency,
          },
          accessToken,
        );
        if (delegated.delegated) {
          return {
            product: delegated.result.product,
            shouldClearProductId: delegated.result.shouldClearProductId,
          };
        }
        assertLegacyIdentityFallbackAllowed();
      }

      const result = await saveLineItemAsProduct(
        db,
        teamId!,
        session.user.id,
        lineItem,
        input.currency || undefined,
      );

      return {
        product: result.product,
        shouldClearProductId: result.shouldClearProductId,
      };
    }),
});

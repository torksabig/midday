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
  assertNoLegacyFallback,
  tryDelegateInvoiceProductCreate,
  tryDelegateInvoiceProductDelete,
  tryDelegateInvoiceProductGetById,
  tryDelegateInvoiceProductIncrementUsage,
  tryDelegateInvoiceProductSaveLineItem,
  tryDelegateInvoiceProductUpdate,
  tryDelegateInvoiceProductUpsert,
  tryDelegateInvoiceProductsGet,
} from "@api/services/replacement-delegation";
import { createTRPCRouter, protectedProcedure } from "@api/trpc/init";
import { TRPCError } from "@trpc/server";

/** Stage 4: dashboard uses Rust directly; keep AppRouter for queryKey/RouterOutputs only. */
export const invoiceProductsRouter = createTRPCRouter({
  get: protectedProcedure
    .input(getInvoiceProductsSchema)
    .query(async ({ input, ctx: { accessToken } }) => {
      const {
        sortBy = "popular",
        limit = 50,
        includeInactive = false,
        currency,
      } = input || {};

      const delegated = await tryDelegateInvoiceProductsGet(
        { sortBy, limit, includeInactive, currency: currency ?? undefined },
        accessToken,
      );
      if (delegated) {
        return delegated;
      }
      return assertNoLegacyFallback("invoiceProducts.get");
    }),

  getById: protectedProcedure
    .input(getInvoiceProductSchema)
    .query(async ({ input, ctx: { accessToken } }) => {
      const delegated = await tryDelegateInvoiceProductGetById(
        input.id,
        accessToken,
      );
      if (delegated.delegated) {
        return delegated.product;
      }
      return assertNoLegacyFallback("invoiceProducts.getById");
    }),

  create: protectedProcedure
    .input(createInvoiceProductSchema)
    .mutation(async ({ input, ctx: { accessToken } }) => {
      try {
        const delegated = await tryDelegateInvoiceProductCreate(
          input,
          accessToken,
        );
        if (delegated.delegated) {
          return delegated.product;
        }
        return assertNoLegacyFallback("invoiceProducts.create");
      } catch (error) {
        if (
          error instanceof TRPCError &&
          error.code === "INTERNAL_SERVER_ERROR"
        ) {
          throw error;
        }
        throw new TRPCError({ code: "CONFLICT" });
      }
    }),

  upsert: protectedProcedure
    .input(upsertInvoiceProductSchema)
    .mutation(async ({ input, ctx: { accessToken } }) => {
      const delegated = await tryDelegateInvoiceProductUpsert(
        input,
        accessToken,
      );
      if (delegated.delegated) {
        return delegated.product;
      }
      return assertNoLegacyFallback("invoiceProducts.upsert");
    }),

  updateProduct: protectedProcedure
    .input(updateInvoiceProductSchema)
    .mutation(async ({ input, ctx: { accessToken } }) => {
      const { id, ...updateData } = input;

      try {
        const delegated = await tryDelegateInvoiceProductUpdate(
          id,
          updateData,
          accessToken,
        );
        if (delegated.delegated) {
          return delegated.product;
        }
        return assertNoLegacyFallback("invoiceProducts.updateProduct");
      } catch (error) {
        if (
          error instanceof TRPCError &&
          error.code === "INTERNAL_SERVER_ERROR"
        ) {
          throw error;
        }
        throw new TRPCError({ code: "CONFLICT" });
      }
    }),

  delete: protectedProcedure
    .input(deleteInvoiceProductSchema)
    .mutation(async ({ input, ctx: { accessToken } }) => {
      const delegated = await tryDelegateInvoiceProductDelete(
        input.id,
        accessToken,
      );
      if (delegated.delegated) {
        return delegated.deleted;
      }
      return assertNoLegacyFallback("invoiceProducts.delete");
    }),

  incrementUsage: protectedProcedure
    .input(getInvoiceProductSchema)
    .mutation(async ({ input, ctx: { accessToken } }) => {
      const delegated = await tryDelegateInvoiceProductIncrementUsage(
        input.id,
        accessToken,
      );
      if (delegated.delegated) {
        return delegated.result;
      }
      return assertNoLegacyFallback("invoiceProducts.incrementUsage");
    }),

  saveLineItemAsProduct: protectedProcedure
    .input(saveLineItemAsProductSchema)
    .mutation(async ({ input, ctx: { accessToken } }) => {
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
      return assertNoLegacyFallback("invoiceProducts.saveLineItemAsProduct");
    }),
});

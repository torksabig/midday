import { upsertInvoiceTemplateSchema } from "@api/schemas/invoice";
import {
  assertNoLegacyFallback,
  tryDelegateInvoiceTemplateCount,
  tryDelegateInvoiceTemplateCreate,
  tryDelegateInvoiceTemplateDelete,
  tryDelegateInvoiceTemplateGet,
  tryDelegateInvoiceTemplateSetDefault,
  tryDelegateInvoiceTemplateUpsert,
  tryDelegateInvoiceTemplatesList,
} from "@api/services/replacement-delegation";
import { createTRPCRouter, protectedProcedure } from "@api/trpc/init";
import { parseInputValue } from "@api/utils/parse";
import { z } from "zod";

/** Stage 4: dashboard uses Rust directly; keep AppRouter for queryKey/RouterOutputs only. */
export const invoiceTemplateRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx: { accessToken } }) => {
    const delegated = await tryDelegateInvoiceTemplatesList(accessToken);
    if (delegated) {
      return delegated;
    }
    return assertNoLegacyFallback("invoiceTemplate.list");
  }),

  get: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx: { accessToken }, input }) => {
      const delegated = await tryDelegateInvoiceTemplateGet(
        input.id,
        accessToken,
      );
      if (delegated.delegated) {
        return delegated.template;
      }
      return assertNoLegacyFallback("invoiceTemplate.get");
    }),

  create: protectedProcedure
    .input(
      upsertInvoiceTemplateSchema.extend({
        name: z.string().min(1, "Template name is required"),
        isDefault: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx: { accessToken }, input }) => {
      const payload = {
        ...input,
        fromDetails: parseInputValue(input.fromDetails),
        paymentDetails: parseInputValue(input.paymentDetails),
        noteDetails: parseInputValue(input.noteDetails),
      };

      const delegated = await tryDelegateInvoiceTemplateCreate(
        payload as Record<string, unknown>,
        accessToken,
      );
      if (delegated.delegated) {
        return delegated.template;
      }
      return assertNoLegacyFallback("invoiceTemplate.create");
    }),

  upsert: protectedProcedure
    .input(
      upsertInvoiceTemplateSchema.extend({
        id: z.string().uuid().optional(),
        name: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx: { accessToken }, input }) => {
      const payload = {
        ...input,
        fromDetails: parseInputValue(input.fromDetails),
        paymentDetails: parseInputValue(input.paymentDetails),
        noteDetails: parseInputValue(input.noteDetails),
      };

      const delegated = await tryDelegateInvoiceTemplateUpsert(
        payload as Record<string, unknown>,
        accessToken,
      );
      if (delegated.delegated) {
        return delegated.template;
      }
      return assertNoLegacyFallback("invoiceTemplate.upsert");
    }),

  setDefault: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx: { accessToken }, input }) => {
      const delegated = await tryDelegateInvoiceTemplateSetDefault(
        input.id,
        accessToken,
      );
      if (delegated.delegated) {
        if (!delegated.template) {
          throw new Error("Template not found");
        }
        return delegated.template;
      }
      return assertNoLegacyFallback("invoiceTemplate.setDefault");
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx: { accessToken }, input }) => {
      const delegated = await tryDelegateInvoiceTemplateDelete(
        input.id,
        accessToken,
      );
      if (delegated.delegated) {
        return delegated.result;
      }
      return assertNoLegacyFallback("invoiceTemplate.delete");
    }),

  count: protectedProcedure.query(async ({ ctx: { accessToken } }) => {
    const delegated = await tryDelegateInvoiceTemplateCount(accessToken);
    if (delegated != null) {
      return delegated;
    }
    return assertNoLegacyFallback("invoiceTemplate.count");
  }),
});

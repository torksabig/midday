import { z } from "zod";

/**
 * Provider ID enum
 */
export const accountingProviderIdSchema = z.enum([
  "xero",
  "quickbooks",
  "fortnox",
]);

/**
 * Schema for exporting transactions to accounting
 * Always includes attachments - receipts are a core part of the export
 */
export const exportToAccountingSchema = z.object({
  transactionIds: z.array(z.string().uuid()),
  providerId: accountingProviderIdSchema,
});

/** Dashboard hybrid: Rust GET `/api/v1/apps/{app_id}` already verified config; Node only BullMQ. */
export const enqueueExportToAccountingSchema = exportToAccountingSchema;

/**
 * Schema for getting sync status
 */
export const getSyncStatusSchema = z.object({
  transactionIds: z.array(z.string().uuid()).optional(),
  providerId: accountingProviderIdSchema.optional(),
});

/**
 * Schema for disconnecting a provider
 */
export const disconnectProviderSchema = z.object({
  providerId: accountingProviderIdSchema,
});

/**
 * Schema for getting provider accounts
 */
export const getAccountsSchema = z.object({
  providerId: accountingProviderIdSchema,
});

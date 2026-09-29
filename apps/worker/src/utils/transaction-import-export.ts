import type { Database } from "@midday/db/client";
import {
  createShortLink,
  getTransactionsByIds,
  markTransactionsAsExported,
  type UpsertTransactionData,
  upsertTransactions,
} from "@midday/db/queries";
import type { createLoggerWithContext } from "@midday/logger";
import {
  postExportTransactions,
  postImportTransactions,
  postProcessExport,
  transactionImportExportDelegationTarget,
  type ImportTransactionRow,
} from "@jobs/utils/transaction-import-export-delegate";

type Logger = ReturnType<typeof createLoggerWithContext>;

/**
 * Import upsert — Rust when MIDDAY_BACKEND_MODE is dual/replacement.
 * Dual falls back to Drizzle on Rust failure; replacement is fail-closed.
 * CSV download/parse stays on Node.
 */
export async function upsertImportTransactions(
  db: Database,
  params: { transactions: UpsertTransactionData[]; teamId: string },
  logger?: Logger,
): Promise<Array<{ id: string }>> {
  const target = transactionImportExportDelegationTarget("import-transactions");
  if (target) {
    const rows: ImportTransactionRow[] = params.transactions.map((t) => ({
      name: t.name,
      date: t.date,
      method: t.method,
      amount: t.amount,
      currency: t.currency,
      teamId: t.teamId,
      bankAccountId: t.bankAccountId,
      internalId: t.internalId,
      status: t.status,
      manual: t.manual,
      categorySlug: t.categorySlug,
      description: t.description,
      balance: t.balance,
      note: t.note,
      counterpartyName: t.counterpartyName,
      merchantName: t.merchantName,
      assignedId: t.assignedId,
      internal: t.internal,
      notified: t.notified,
      baseAmount: t.baseAmount,
      baseCurrency: t.baseCurrency,
      taxAmount: t.taxAmount,
      taxRate: t.taxRate,
      taxType: t.taxType,
      recurring: t.recurring,
      frequency: t.frequency,
      enrichmentCompleted: t.enrichmentCompleted,
    }));

    try {
      const body = await postImportTransactions(
        { teamId: params.teamId, transactions: rows },
        target,
      );
      return body.transactions.map((row) => ({ id: row.id }));
    } catch (error) {
      if (target.mode === "replacement") {
        throw error;
      }
      logger?.warn(
        "import-transactions rust failed; falling back to drizzle",
        {
          error: error instanceof Error ? error.message : "unknown",
        },
      );
    }
  }

  return upsertTransactions(db, params);
}

/**
 * Export row select — Rust when dual/replacement.
 * Attachment vault downloads and CSV/XLSX formatting stay on Node.
 */
export async function getExportTransactionsByIds(
  db: Database,
  params: { ids: string[]; teamId: string },
  logger?: Logger,
): Promise<Awaited<ReturnType<typeof getTransactionsByIds>>> {
  const target = transactionImportExportDelegationTarget("process-export");
  if (target) {
    try {
      const body = await postProcessExport(
        { teamId: params.teamId, ids: params.ids },
        target,
      );
      return body.transactions as Awaited<
        ReturnType<typeof getTransactionsByIds>
      >;
    } catch (error) {
      if (target.mode === "replacement") {
        throw error;
      }
      logger?.warn("process-export rust failed; falling back to drizzle", {
        error: error instanceof Error ? error.message : "unknown",
      });
    }
  }

  return getTransactionsByIds(db, params);
}

/**
 * Mark exported (+ optional short_link insert) — Rust when dual/replacement.
 * Signed URL creation stays on Node; Node posts the signed URL into shortLink.
 */
export async function finalizeExportTransactions(
  db: Database,
  params: {
    teamId: string;
    transactionIds: string[];
    shortLink?: {
      url: string;
      userId: string;
      type?: string;
      fileName?: string;
      mimeType?: string;
      size?: number;
      expiresAt: string;
    };
  },
  logger?: Logger,
): Promise<{
  shortLink: Awaited<ReturnType<typeof createShortLink>> | null;
}> {
  const target = transactionImportExportDelegationTarget("export-transactions");
  if (target) {
    try {
      const body = await postExportTransactions(
        {
          teamId: params.teamId,
          transactionIds: params.transactionIds,
          ...(params.shortLink ? { shortLink: params.shortLink } : {}),
        },
        target,
      );
      if (!params.shortLink) {
        return { shortLink: null };
      }
      if (!body.shortLink) {
        return { shortLink: null };
      }
      return {
        shortLink: {
          id: body.shortLink.id,
          shortId: body.shortLink.shortId,
          url: body.shortLink.url,
          type: body.shortLink.type ?? params.shortLink.type ?? null,
          fileName: body.shortLink.fileName ?? params.shortLink.fileName ?? null,
          mimeType: body.shortLink.mimeType ?? params.shortLink.mimeType ?? null,
          size: body.shortLink.size ?? params.shortLink.size ?? null,
          createdAt: body.shortLink.createdAt ?? null,
          expiresAt:
            body.shortLink.expiresAt ?? params.shortLink.expiresAt ?? null,
        } as Awaited<ReturnType<typeof createShortLink>>,
      };
    } catch (error) {
      if (target.mode === "replacement") {
        throw error;
      }
      logger?.warn(
        "export-transactions rust failed; falling back to drizzle",
        {
          error: error instanceof Error ? error.message : "unknown",
        },
      );
    }
  }

  await markTransactionsAsExported(
    db,
    params.transactionIds,
    params.teamId,
  );

  if (!params.shortLink) {
    return { shortLink: null };
  }

  const shortLink = await createShortLink(db, {
    url: params.shortLink.url,
    teamId: params.teamId,
    userId: params.shortLink.userId,
    type: params.shortLink.type === "redirect" ? "redirect" : "download",
    fileName: params.shortLink.fileName,
    mimeType: params.shortLink.mimeType,
    size: params.shortLink.size,
    expiresAt: params.shortLink.expiresAt,
  });

  return { shortLink };
}

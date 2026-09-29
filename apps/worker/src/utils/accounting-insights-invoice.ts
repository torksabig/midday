import type { Database } from "@midday/db/client";
import {
  type CreateAccountingSyncRecordParams,
  type UpdateInsightParams,
  type UpdateSyncedAttachmentMappingParams,
  updateInsight,
  updateInvoice,
  updateSyncedAttachmentMapping,
  upsertAccountingSyncRecord,
} from "@midday/db/queries";
import type { createLoggerWithContext } from "@midday/logger";
import {
  accountingInsightsInvoiceDelegationTarget,
  postPersistTeamInsight,
  postUpdateAccountingAttachmentMapping,
  postUpdateInvoiceFile,
  postUpdateInvoiceSent,
  postUpsertAccountingSync,
} from "./accounting-insights-invoice-delegate";

type Logger = ReturnType<typeof createLoggerWithContext>;

/**
 * Upsert accounting sync record(s) — Rust when dual/replacement.
 * Provider HTTP stays on Node; dual falls back to Drizzle.
 */
export async function upsertAccountingSyncRecordDelegated(
  db: Database,
  params: CreateAccountingSyncRecordParams,
  logger?: Logger,
): Promise<Awaited<ReturnType<typeof upsertAccountingSyncRecord>>> {
  const target = accountingInsightsInvoiceDelegationTarget(
    "upsert-accounting-sync",
  );
  if (target) {
    try {
      await postUpsertAccountingSync(
        {
          teamId: params.teamId,
          records: [
            {
              transactionId: params.transactionId,
              provider: params.provider,
              providerTenantId: params.providerTenantId,
              providerTransactionId: params.providerTransactionId,
              syncType: params.syncType,
              status: params.status,
              errorMessage: params.errorMessage,
              errorCode: params.errorCode,
              providerEntityType: params.providerEntityType,
              syncedAttachmentMapping: params.syncedAttachmentMapping,
            },
          ],
        },
        target,
      );
      // Match Drizzle return shape loosely — callers rarely use the row.
      return {
        id: "",
        transactionId: params.transactionId,
        teamId: params.teamId,
        provider: params.provider,
        providerTenantId: params.providerTenantId,
        providerTransactionId: params.providerTransactionId ?? null,
        syncedAttachmentMapping: params.syncedAttachmentMapping ?? {},
        syncedAt: new Date().toISOString(),
        syncType: params.syncType ?? null,
        status: params.status ?? "synced",
        errorMessage:
          params.status === "synced" ? null : (params.errorMessage ?? null),
        errorCode:
          params.status === "synced" ? null : (params.errorCode ?? null),
        providerEntityType: params.providerEntityType ?? null,
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      if (target.mode === "replacement") {
        throw error;
      }
      logger?.warn(
        "upsert-accounting-sync rust failed; falling back to drizzle",
        {
          error: error instanceof Error ? error.message : "unknown",
        },
      );
    }
  }

  return upsertAccountingSyncRecord(db, params);
}

/**
 * Update attachment mapping on sync record — Rust when dual/replacement.
 */
export async function updateSyncedAttachmentMappingDelegated(
  db: Database,
  params: UpdateSyncedAttachmentMappingParams & { teamId: string },
  logger?: Logger,
): Promise<Awaited<ReturnType<typeof updateSyncedAttachmentMapping>>> {
  const target = accountingInsightsInvoiceDelegationTarget(
    "update-accounting-attachment-mapping",
  );
  if (target) {
    try {
      await postUpdateAccountingAttachmentMapping(
        {
          syncRecordId: params.syncRecordId,
          teamId: params.teamId,
          syncedAttachmentMapping: params.syncedAttachmentMapping,
          status: params.status,
          errorMessage: params.errorMessage,
          errorCode: params.errorCode,
        },
        target,
      );
      return {
        id: params.syncRecordId,
        transactionId: "",
        teamId: params.teamId,
        provider: "xero",
        providerTenantId: "",
        providerTransactionId: null,
        syncedAttachmentMapping: params.syncedAttachmentMapping,
        syncedAt: new Date().toISOString(),
        syncType: null,
        status: params.status ?? "synced",
        errorMessage: params.errorMessage ?? null,
        errorCode: params.errorCode ?? null,
        providerEntityType: null,
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      if (target.mode === "replacement") {
        throw error;
      }
      logger?.warn(
        "update-accounting-attachment-mapping rust failed; falling back to drizzle",
        {
          error: error instanceof Error ? error.message : "unknown",
        },
      );
    }
  }

  return updateSyncedAttachmentMapping(db, params);
}

/**
 * Persist already-generated insight content — Rust when dual/replacement.
 * LLM generation stays on Node.
 */
export async function persistTeamInsightDelegated(
  db: Database,
  params: UpdateInsightParams,
  logger?: Logger,
): Promise<void> {
  const target = accountingInsightsInvoiceDelegationTarget(
    "persist-team-insight",
  );
  if (target && params.status) {
    try {
      await postPersistTeamInsight(
        {
          insightId: params.id,
          teamId: params.teamId,
          status: params.status,
          title: params.title,
          selectedMetrics: params.selectedMetrics,
          allMetrics: params.allMetrics,
          anomalies: params.anomalies,
          expenseAnomalies: params.expenseAnomalies,
          activity: params.activity,
          content: params.content,
          predictions: params.predictions,
          generatedAt: params.generatedAt?.toISOString(),
        },
        target,
      );
      return;
    } catch (error) {
      if (target.mode === "replacement") {
        throw error;
      }
      logger?.warn(
        "persist-team-insight rust failed; falling back to drizzle",
        {
          error: error instanceof Error ? error.message : "unknown",
        },
      );
    }
  }

  await updateInsight(db, params);
}

/**
 * Update invoice file path/size after PDF upload — Rust when dual/replacement.
 */
export async function updateInvoiceFileDelegated(
  db: Database,
  params: {
    id: string;
    teamId: string;
    filePath: string[];
    fileSize: number;
  },
  logger?: Logger,
): Promise<Awaited<ReturnType<typeof updateInvoice>>> {
  const target = accountingInsightsInvoiceDelegationTarget(
    "update-invoice-file",
  );
  if (target) {
    try {
      const body = await postUpdateInvoiceFile(
        {
          invoiceId: params.id,
          teamId: params.teamId,
          filePath: params.filePath,
          fileSize: params.fileSize,
        },
        target,
      );
      if (!body.updated) {
        return undefined;
      }
      return { id: params.id } as Awaited<ReturnType<typeof updateInvoice>>;
    } catch (error) {
      if (target.mode === "replacement") {
        throw error;
      }
      logger?.warn("update-invoice-file rust failed; falling back to drizzle", {
        error: error instanceof Error ? error.message : "unknown",
      });
    }
  }

  return updateInvoice(db, {
    id: params.id,
    teamId: params.teamId,
    filePath: params.filePath,
    fileSize: params.fileSize,
  });
}

/**
 * Update invoice sent status after email — Rust when dual/replacement.
 * Resend stays on Node.
 */
export async function updateInvoiceSentDelegated(
  db: Database,
  params: {
    id: string;
    teamId: string;
    status: "unpaid";
    sentTo: string;
    sentAt: string;
  },
  logger?: Logger,
): Promise<Awaited<ReturnType<typeof updateInvoice>>> {
  const target = accountingInsightsInvoiceDelegationTarget(
    "update-invoice-sent",
  );
  if (target) {
    try {
      const body = await postUpdateInvoiceSent(
        {
          invoiceId: params.id,
          teamId: params.teamId,
          status: params.status,
          sentTo: params.sentTo,
          sentAt: params.sentAt,
        },
        target,
      );
      if (!body.updated) {
        return undefined;
      }
      return { id: params.id } as Awaited<ReturnType<typeof updateInvoice>>;
    } catch (error) {
      if (target.mode === "replacement") {
        throw error;
      }
      logger?.warn("update-invoice-sent rust failed; falling back to drizzle", {
        error: error instanceof Error ? error.message : "unknown",
      });
    }
  }

  return updateInvoice(db, {
    id: params.id,
    teamId: params.teamId,
    status: params.status,
    sentTo: params.sentTo,
    sentAt: params.sentAt,
  });
}

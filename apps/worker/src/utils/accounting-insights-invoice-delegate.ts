import type { DelegationFetch } from "./delegation-fetch";

/**
 * AP-WORKER-10 — accounting export / insights / invoice PDF+email SQL delegation.
 *
 * Node keeps provider HTTP, PDF bytes, Resend, and LLM generation; posts SQL
 * results to Rust when MIDDAY_BACKEND_MODE is dual/replacement.
 */

export type AccountingInsightsInvoiceJob =
  | "upsert-accounting-sync"
  | "update-accounting-attachment-mapping"
  | "persist-team-insight"
  | "update-invoice-file"
  | "update-invoice-sent";

export function accountingInsightsInvoiceDelegationTarget(
  job: AccountingInsightsInvoiceJob,
  env: NodeJS.ProcessEnv = process.env,
): { mode: "dual" | "replacement"; url: string; token: string } | null {
  const mode = env.MIDDAY_BACKEND_MODE?.trim();
  const base = env.REPLACEMENT_API_URL?.trim().replace(/\/$/, "");
  const token = (
    env.MIDDAY_WORKER_TOKEN ||
    env.REPLACEMENT_DELEGATION_TOKEN ||
    ""
  ).trim();
  if ((mode !== "dual" && mode !== "replacement") || !base || !token) {
    return null;
  }
  return {
    mode,
    url: `${base}/api/v1/workers/${job}`,
    token,
  };
}

async function postWorkerJson<T>(
  job: AccountingInsightsInvoiceJob,
  payload: unknown,
  target: { url: string; token: string },
  fetchImpl: DelegationFetch = fetch,
): Promise<T> {
  const response = await fetchImpl(target.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${target.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`${job} rust failed: ${response.status}`);
  }
  return (await response.json()) as T;
}

export type AccountingSyncRecordPayload = {
  transactionId: string;
  provider: "xero" | "quickbooks" | "fortnox";
  providerTenantId: string;
  providerTransactionId?: string;
  syncType?: "manual";
  status?: "synced" | "partial" | "failed" | "pending";
  errorMessage?: string;
  errorCode?: string;
  providerEntityType?: string;
  syncedAttachmentMapping?: Record<string, string | null>;
};

export type UpsertAccountingSyncRustBody = {
  executed: boolean;
  upsertedCount: number;
};

export async function postUpsertAccountingSync(
  payload: { teamId: string; records: AccountingSyncRecordPayload[] },
  target: { url: string; token: string },
  fetchImpl: DelegationFetch = fetch,
): Promise<UpsertAccountingSyncRustBody> {
  return postWorkerJson(
    "upsert-accounting-sync",
    payload,
    target,
    fetchImpl,
  );
}

export type UpdateAccountingAttachmentMappingRustBody = {
  executed: boolean;
  updated: boolean;
};

export async function postUpdateAccountingAttachmentMapping(
  payload: {
    syncRecordId: string;
    teamId: string;
    syncedAttachmentMapping: Record<string, string | null>;
    status?: "synced" | "partial" | "failed";
    errorMessage?: string | null;
    errorCode?: string | null;
  },
  target: { url: string; token: string },
  fetchImpl: DelegationFetch = fetch,
): Promise<UpdateAccountingAttachmentMappingRustBody> {
  return postWorkerJson(
    "update-accounting-attachment-mapping",
    payload,
    target,
    fetchImpl,
  );
}

export type PersistTeamInsightRustBody = {
  executed: boolean;
  updated: boolean;
  insightId: string;
};

export async function postPersistTeamInsight(
  payload: {
    insightId: string;
    teamId: string;
    status: "pending" | "generating" | "completed" | "failed";
    title?: string;
    selectedMetrics?: unknown;
    allMetrics?: unknown;
    anomalies?: unknown;
    expenseAnomalies?: unknown;
    activity?: unknown;
    content?: unknown;
    predictions?: unknown;
    generatedAt?: string;
  },
  target: { url: string; token: string },
  fetchImpl: DelegationFetch = fetch,
): Promise<PersistTeamInsightRustBody> {
  return postWorkerJson("persist-team-insight", payload, target, fetchImpl);
}

export type UpdateInvoiceFileRustBody = {
  executed: boolean;
  updated: boolean;
};

export async function postUpdateInvoiceFile(
  payload: {
    invoiceId: string;
    teamId: string;
    filePath: string[];
    fileSize: number;
  },
  target: { url: string; token: string },
  fetchImpl: DelegationFetch = fetch,
): Promise<UpdateInvoiceFileRustBody> {
  return postWorkerJson("update-invoice-file", payload, target, fetchImpl);
}

export type UpdateInvoiceSentRustBody = {
  executed: boolean;
  updated: boolean;
};

export async function postUpdateInvoiceSent(
  payload: {
    invoiceId: string;
    teamId: string;
    status: string;
    sentTo: string;
    sentAt: string;
  },
  target: { url: string; token: string },
  fetchImpl: DelegationFetch = fetch,
): Promise<UpdateInvoiceSentRustBody> {
  return postWorkerJson("update-invoice-sent", payload, target, fetchImpl);
}

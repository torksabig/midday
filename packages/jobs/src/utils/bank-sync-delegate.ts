import type { DelegationFetch } from "./delegation-fetch";
export type BankUpsertTransactionRow = {
  name: string;
  date: string;
  amount: number;
  currency: string;
  teamId: string;
  bankAccountId: string;
  internalId: string;
  method?: string | null;
  status?: "pending" | "completed" | "archived" | "posted" | "excluded";
  categorySlug?: string | null;
  description?: string | null;
  balance?: number | null;
  counterpartyName?: string | null;
  merchantName?: string | null;
  notified?: boolean;
};

export type UpsertTransactionsRustBody = {
  executed: boolean;
  upsertedCount: number;
  transactions: Array<{ id: string }>;
};

export type SyncConnectionStatusRustBody = {
  executed: boolean;
  connectionId: string;
  status?: string | null;
  updated: boolean;
  disconnectedByRetries: boolean;
};

export type UpdateBankAccountSyncRustBody = {
  executed: boolean;
  accountId: string;
  updated: boolean;
};

export type RemapBankAccountIdsRustBody = {
  executed: boolean;
  matched: number;
  errors: number;
};

export type BankSyncJob =
  | "upsert-transactions"
  | "sync-connection-status"
  | "update-bank-account-sync"
  | "remap-bank-account-ids";

export function bankSyncDelegationTarget(
  job: BankSyncJob,
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
  job: BankSyncJob,
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

export async function postUpsertTransactions(
  payload: {
    teamId: string;
    bankAccountId: string;
    transactions: BankUpsertTransactionRow[];
  },
  target: { url: string; token: string },
  fetchImpl: DelegationFetch = fetch,
): Promise<UpsertTransactionsRustBody> {
  return postWorkerJson("upsert-transactions", payload, target, fetchImpl);
}

export async function postSyncConnectionStatus(
  payload: {
    connectionId: string;
    teamId: string;
    status?: "connected" | "disconnected";
    lastAccessed?: string;
    referenceId?: string;
    markDisconnectedIfAllRetries?: boolean;
  },
  target: { url: string; token: string },
  fetchImpl: DelegationFetch = fetch,
): Promise<SyncConnectionStatusRustBody> {
  return postWorkerJson("sync-connection-status", payload, target, fetchImpl);
}

export async function postUpdateBankAccountSync(
  payload: {
    accountId: string;
    teamId: string;
    balance?: number | null;
    availableBalance?: number | null;
    creditLimit?: number | null;
    currency?: string;
    errorDetails?: string | null;
    errorRetries?: number | null;
    clearErrors?: boolean;
    setBalance?: boolean;
  },
  target: { url: string; token: string },
  fetchImpl: DelegationFetch = fetch,
): Promise<UpdateBankAccountSyncRustBody> {
  return postWorkerJson("update-bank-account-sync", payload, target, fetchImpl);
}

export async function postRemapBankAccountIds(
  payload: {
    connectionId: string;
    teamId: string;
    updates: Array<{
      id: string;
      accountId: string;
      accountReference?: string | null;
      iban?: string | null;
    }>;
  },
  target: { url: string; token: string },
  fetchImpl: DelegationFetch = fetch,
): Promise<RemapBankAccountIdsRustBody> {
  return postWorkerJson("remap-bank-account-ids", payload, target, fetchImpl);
}

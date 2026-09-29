export type ImportTransactionRow = {
  name: string;
  date: string;
  method: "other" | "card_purchase" | "transfer";
  amount: number;
  currency: string;
  teamId: string;
  bankAccountId?: string | null;
  internalId: string;
  status?: "pending" | "completed" | "archived" | "posted" | "excluded";
  manual?: boolean;
  categorySlug?: string | null;
  description?: string | null;
  balance?: number | null;
  note?: string | null;
  counterpartyName?: string | null;
  merchantName?: string | null;
  assignedId?: string | null;
  internal?: boolean;
  notified?: boolean;
  baseAmount?: number | null;
  baseCurrency?: string | null;
  taxAmount?: number | null;
  taxRate?: number | null;
  taxType?: string | null;
  recurring?: boolean;
  frequency?: string | null;
  enrichmentCompleted?: boolean;
};

export type ImportTransactionsRustBody = {
  executed: boolean;
  importedCount: number;
  transactions: Array<{ id: string }>;
};

export type ProcessExportRustBody = {
  executed: boolean;
  transactions: Array<Record<string, unknown>>;
};

export type ExportTransactionsRustBody = {
  executed: boolean;
  markedExported: number;
  shortLink?: {
    id: string;
    shortId: string;
    url: string;
    type?: string | null;
    fileName?: string | null;
    mimeType?: string | null;
    size?: number | null;
    createdAt?: string | null;
    expiresAt?: string | null;
  } | null;
};

export type TransactionImportExportJob =
  | "import-transactions"
  | "process-export"
  | "export-transactions";

export function transactionImportExportDelegationTarget(
  job: TransactionImportExportJob,
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
  job: TransactionImportExportJob,
  payload: unknown,
  target: { url: string; token: string },
  fetchImpl: typeof fetch = fetch,
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

export async function postImportTransactions(
  payload: { teamId: string; transactions: ImportTransactionRow[] },
  target: { url: string; token: string },
  fetchImpl: typeof fetch = fetch,
): Promise<ImportTransactionsRustBody> {
  return postWorkerJson("import-transactions", payload, target, fetchImpl);
}

export async function postProcessExport(
  payload: { teamId: string; ids: string[] },
  target: { url: string; token: string },
  fetchImpl: typeof fetch = fetch,
): Promise<ProcessExportRustBody> {
  return postWorkerJson("process-export", payload, target, fetchImpl);
}

export async function postExportTransactions(
  payload: {
    teamId: string;
    transactionIds?: string[];
    shortLink?: {
      url: string;
      userId: string;
      type?: string;
      fileName?: string;
      mimeType?: string;
      size?: number;
      expiresAt?: string;
    };
  },
  target: { url: string; token: string },
  fetchImpl: typeof fetch = fetch,
): Promise<ExportTransactionsRustBody> {
  return postWorkerJson("export-transactions", payload, target, fetchImpl);
}

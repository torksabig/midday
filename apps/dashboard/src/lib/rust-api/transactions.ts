import type { components } from "./openapi.generated";
import { RustApiError } from "./overview";

type RawTxListResponse = components["schemas"]["TxListResponse"];
type RawTxListItem = components["schemas"]["TxListItem"];
type RawTxDetailItem = components["schemas"]["TxDetailItem"];
type RawTxAssigned = components["schemas"]["TxListAssigned"];
type RawTxCategory = components["schemas"]["TxListCategory"];
type RawTxAccount = components["schemas"]["TxListAccount"];
type RawTxSuggestion = components["schemas"]["TxDetailSuggestion"];

export type TransactionsListParams = {
  cursor?: string | null;
  pageSize?: number;
  q?: string | null;
  sort?: string[] | null;
  statuses?: string[] | null;
  start?: string | null;
  end?: string | null;
  categories?: string[] | null;
  accounts?: string[] | null;
  tags?: string[] | null;
  exported?: boolean | null;
  fulfilled?: boolean | null;
  assignees?: string[] | null;
  attachments?: string | null;
  recurring?: string[] | null;
  amountRange?: number[] | null;
  amount?: string[] | null;
  type?: string | null;
  manual?: string | null;
};

export type TransactionAttachment = {
  id: string;
  filename: string | null;
  path: string | null;
  type: string;
  size: number;
};

export type TransactionTag = {
  id: string;
  name: string | null;
};

export type TransactionListItem = {
  id: string;
  date: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  note: string | null;
  manual: boolean;
  internal: boolean;
  recurring: boolean | null;
  counterpartyName: string | null;
  frequency: string | null;
  name: string;
  description: string | null;
  createdAt: string;
  taxRate: number | null;
  taxType: string | null;
  taxAmount: number | null;
  baseAmount: number | null;
  baseCurrency: string | null;
  enrichmentCompleted: boolean;
  isFulfilled: boolean;
  hasPendingSuggestion: boolean;
  isExported: boolean;
  hasExportError: boolean;
  exportProvider: string | null;
  exportedAt: string | null;
  exportErrorCode: string | null;
  attachments: TransactionAttachment[];
  tags: TransactionTag[];
  assigned: {
    id: string;
    fullName: string | null;
    avatarUrl: string | null;
  } | null;
  category: {
    id: string;
    name: string;
    color: string | null;
    slug: string;
    taxRate: number | null;
    taxType: string | null;
  } | null;
  account: {
    id: string;
    name: string;
    currency: string;
    connection: {
      id: string;
      name: string | null;
      logoUrl: string | null;
    } | null;
  } | null;
};

export type TransactionsList = {
  meta: {
    cursor?: string;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
  data: TransactionListItem[];
};

export type TransactionDetail = TransactionListItem & {
  suggestion: {
    suggestionId: string | null;
    inboxId: string | null;
    documentName: string | null;
    documentAmount: number | null;
    documentCurrency: string | null;
    documentPath: string | null;
    confidenceScore: number | null;
  };
};

function appendAll(
  search: URLSearchParams,
  key: string,
  values: Array<string | number> | null | undefined,
) {
  if (!values) return;
  for (const value of values) {
    if (value != null && value !== "") search.append(key, String(value));
  }
}

export function buildTransactionsListQuery(
  params: TransactionsListParams,
): string {
  const search = new URLSearchParams();

  if (params.cursor) search.set("cursor", params.cursor);
  if (params.pageSize != null) search.set("pageSize", String(params.pageSize));
  if (params.q) search.set("q", params.q);
  if (params.start) search.set("start", params.start);
  if (params.end) search.set("end", params.end);
  appendAll(search, "sort", params.sort);
  appendAll(search, "statuses", params.statuses);
  appendAll(search, "categories", params.categories);
  appendAll(search, "accounts", params.accounts);
  appendAll(search, "tags", params.tags);
  if (params.exported != null) search.set("exported", String(params.exported));
  if (params.fulfilled != null) {
    search.set("fulfilled", String(params.fulfilled));
  }
  appendAll(search, "assignees", params.assignees);
  if (params.attachments) search.set("attachments", params.attachments);
  appendAll(search, "recurring", params.recurring);
  appendAll(search, "amountRange", params.amountRange);
  appendAll(search, "amount", params.amount);
  if (params.type) search.set("type", params.type);
  if (params.manual) search.set("manual", params.manual);

  const query = search.toString();
  return query ? `?${query}` : "";
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

function normalizeAttachments(raw: unknown): TransactionAttachment[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((entry) => {
    const row = asRecord(entry) ?? {};
    return {
      id: String(row.id ?? ""),
      filename: (row.filename as string | null | undefined) ?? null,
      path: (row.path as string | null | undefined) ?? null,
      type: String(row.type ?? ""),
      size: Number(row.size ?? 0),
    };
  });
}

function normalizeTags(raw: unknown): TransactionTag[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((entry) => {
    const row = asRecord(entry) ?? {};
    return {
      id: String(row.id ?? ""),
      name: (row.name as string | null | undefined) ?? null,
    };
  });
}

function normalizeAssigned(assigned: RawTxAssigned | null | undefined) {
  if (!assigned) return null;
  return {
    id: assigned.id,
    fullName: assigned.full_name ?? null,
    avatarUrl: assigned.avatar_url ?? null,
  };
}

function normalizeCategory(category: RawTxCategory | null | undefined) {
  if (!category) return null;
  return {
    id: category.id,
    name: category.name,
    color: category.color ?? null,
    slug: category.slug,
    taxRate: category.tax_rate ?? null,
    taxType: category.tax_type ?? null,
  };
}

function normalizeAccount(account: RawTxAccount | null | undefined) {
  if (!account) return null;
  return {
    id: account.id,
    name: account.name,
    currency: account.currency,
    connection: account.connection
      ? {
          id: account.connection.id,
          name: account.connection.name ?? null,
          logoUrl: account.connection.logo_url ?? null,
        }
      : null,
  };
}

export function normalizeTransactionListItem(
  row: RawTxListItem,
): TransactionListItem {
  return {
    id: row.id,
    date: row.date,
    amount: row.amount,
    currency: row.currency,
    method: row.method,
    status: row.status,
    note: row.note ?? null,
    manual: row.manual,
    internal: row.internal,
    recurring: row.recurring ?? null,
    counterpartyName: row.counterparty_name ?? null,
    frequency: row.frequency ?? null,
    name: row.name,
    description: row.description ?? null,
    createdAt: row.created_at,
    taxRate: row.tax_rate ?? null,
    taxType: row.tax_type ?? null,
    taxAmount: row.tax_amount ?? null,
    baseAmount: row.base_amount ?? null,
    baseCurrency: row.base_currency ?? null,
    enrichmentCompleted: row.enrichment_completed,
    isFulfilled: row.is_fulfilled,
    hasPendingSuggestion: row.has_pending_suggestion,
    isExported: row.is_exported,
    hasExportError: row.has_export_error,
    exportProvider: row.export_provider ?? null,
    exportedAt: row.exported_at ?? null,
    exportErrorCode: row.export_error_code ?? null,
    attachments: normalizeAttachments(row.attachments),
    tags: normalizeTags(row.tags),
    assigned: normalizeAssigned(row.assigned),
    category: normalizeCategory(row.category),
    account: normalizeAccount(row.account),
  };
}

function normalizeSuggestion(suggestion: RawTxSuggestion | null | undefined) {
  if (!suggestion) {
    return {
      suggestionId: null,
      inboxId: null,
      documentName: null,
      documentAmount: null,
      documentCurrency: null,
      documentPath: null,
      confidenceScore: null,
    };
  }

  return {
    suggestionId: suggestion.suggestion_id ?? null,
    inboxId: suggestion.inbox_id ?? null,
    documentName: suggestion.document_name ?? null,
    documentAmount: suggestion.document_amount ?? null,
    documentCurrency: suggestion.document_currency ?? null,
    documentPath: suggestion.document_path ?? null,
    confidenceScore: suggestion.confidence_score ?? null,
  };
}

export function normalizeTransactionsList(
  payload: RawTxListResponse,
): TransactionsList {
  return {
    meta: {
      cursor: payload.meta.cursor ?? undefined,
      hasPreviousPage: payload.meta.has_previous_page,
      hasNextPage: payload.meta.has_next_page,
    },
    data: payload.data.map(normalizeTransactionListItem),
  };
}

export function normalizeTransactionDetail(
  payload: RawTxDetailItem,
): TransactionDetail {
  const { suggestion, ...itemFields } = payload;
  return {
    ...normalizeTransactionListItem(itemFields),
    suggestion: normalizeSuggestion(suggestion),
  };
}

export async function fetchTransactionsList(
  baseUrl: string,
  accessToken: string | null,
  params: TransactionsListParams = {},
): Promise<TransactionsList> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(
    `${baseUrl}/api/v1/transactions${buildTransactionsListQuery(params)}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(15_000),
    },
  );

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return normalizeTransactionsList(
    (await response.json()) as RawTxListResponse,
  );
}

export async function fetchTransactionById(
  baseUrl: string,
  accessToken: string | null,
  id: string,
): Promise<TransactionDetail> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(
    `${baseUrl}/api/v1/transactions/${encodeURIComponent(id)}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(8_000),
    },
  );

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return normalizeTransactionDetail(
    (await response.json()) as RawTxDetailItem,
  );
}

export async function fetchTransactionsReviewCount(
  baseUrl: string,
  accessToken: string | null,
): Promise<number> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(
    `${baseUrl}/api/v1/transactions/review-count`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(8_000),
    },
  );

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  const count = (await response.json()) as number;
  return typeof count === "number" && Number.isFinite(count) ? count : 0;
}

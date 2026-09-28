import { getBackendMode, getReplacementApiUrl, shouldDelegateToReplacementBackend } from "./config";
import {
  type ReplacementAuthMePayload,
  type ReplacementTeamCurrentPayload,
  mapReplacementToTeamCurrent,
  mapReplacementToBankAccountsGet,
  mapReplacementToInboxById,
  mapReplacementToInboxByStatus,
  mapReplacementToInboxCheckAttachments,
  mapReplacementToInboxGet,
  mapReplacementToInboxSearch,
  mapReplacementToOverviewSummary,
  mapReplacementToTransactionById,
  mapReplacementToTransactionCategoriesGet,
  mapReplacementToTransactionsGet,
  mapReplacementToUserMe,
  mapReplacementToCustomersGet,
  mapReplacementToCustomerById,
  mapReplacementToDocumentsGet,
  mapReplacementToDocumentById,
  mapReplacementToInvoicesGet,
  mapReplacementToInvoiceById,
  mapReplacementToPaymentStatus,
  mapReplacementToInvoiceSummary,
  mapReplacementToGlobalSearch,
  type MiddayBankAccountsGetShape,
  type MiddayCustomersGetShape,
  type MiddayDocumentsGetShape,
  type MiddayInvoicesGetShape,
  type MiddayInboxByIdShape,
  type MiddayInboxByStatusItemShape,
  type MiddayInboxCheckAttachmentsShape,
  type MiddayInboxGetShape,
  type MiddayInboxSearchItemShape,
  type MiddayOverviewSummaryShape,
  type MiddayTransactionByIdShape,
  type MiddayTransactionCategoriesGetShape,
  type MiddayTransactionsGetShape,
  type MiddayPaymentStatusShape,
  type MiddayInvoiceSummaryShape,
  type MiddayGlobalSearchRowShape,
} from "./mappers";

export {
  mapReplacementToBankAccountsGet,
  mapReplacementToCustomerById,
  mapReplacementToCustomersGet,
  mapReplacementToDocumentById,
  mapReplacementToDocumentsGet,
  mapReplacementToGlobalSearch,
  mapReplacementToInboxById,
  mapReplacementToInboxByStatus,
  mapReplacementToInboxCheckAttachments,
  mapReplacementToInboxGet,
  mapReplacementToInboxSearch,
  mapReplacementToInvoiceById,
  mapReplacementToInvoiceSummary,
  mapReplacementToInvoicesGet,
  mapReplacementToOverviewSummary,
  mapReplacementToPaymentStatus,
  mapReplacementToTeamCurrent,
  mapReplacementToTransactionById,
  mapReplacementToTransactionCategoriesGet,
  mapReplacementToTransactionsGet,
  mapReplacementToUserMe,
  type MiddayBankAccountsGetShape,
  type MiddayCustomersGetShape,
  type MiddayDocumentsGetShape,
  type MiddayGlobalSearchRowShape,
  type MiddayInvoiceSummaryShape,
  type MiddayInvoicesGetShape,
  type MiddayInboxByIdShape,
  type MiddayInboxByStatusItemShape,
  type MiddayInboxCheckAttachmentsShape,
  type MiddayInboxGetShape,
  type MiddayInboxSearchItemShape,
  type MiddayOverviewSummaryShape,
  type MiddayPaymentStatusShape,
  type MiddayTransactionByIdShape,
  type MiddayTransactionCategoriesGetShape,
  type MiddayTransactionsGetShape,
  type ReplacementAuthMePayload,
  type ReplacementTeamCurrentPayload,
};

const DEFAULT_TIMEOUT_MS = 5_000;

function trimBase(baseUrl: string): string {
  return baseUrl.replace(/\/$/, "");
}

async function replacementFetch<T>(
  url: string,
  token: string,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<T> {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!res.ok) {
    throw new Error(`replacement API ${url} HTTP ${res.status}`);
  }

  return (await res.json()) as T;
}

/** Bearer for delegation: session JWT, explicit env, or demo login when enabled. */
export async function resolveReplacementBearerToken(
  baseUrl = getReplacementApiUrl(),
  sessionAccessToken?: string | null,
): Promise<string | null> {
  const fromSession = sessionAccessToken?.trim();
  if (fromSession) {
    return fromSession;
  }

  const fromEnv = process.env.REPLACEMENT_DELEGATION_TOKEN?.trim();
  if (fromEnv) {
    return fromEnv;
  }

  const useDemo =
    process.env.REPLACEMENT_DELEGATION_USE_DEMO === "1" ||
    process.env.REPLACEMENT_DELEGATION_USE_DEMO === "true";
  if (!useDemo) {
    return null;
  }

  const root = trimBase(baseUrl);
  const loginRes = await fetch(`${root}/api/v1/auth/demo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
  });

  if (!loginRes.ok) {
    return null;
  }

  const body = (await loginRes.json()) as { token?: string };
  return body.token ?? null;
}

export async function fetchReplacementAuthMePayload(
  baseUrl: string,
  token: string,
): Promise<ReplacementAuthMePayload> {
  const root = trimBase(baseUrl);
  const me = await replacementFetch<{ user: ReplacementAuthMePayload["user"]; team: ReplacementAuthMePayload["team"] }>(
    `${root}/api/v1/auth/me`,
    token,
  );

  let settings: ReplacementAuthMePayload["settings"];
  try {
    settings = await replacementFetch<{ currency: string; locale: string }>(
      `${root}/api/v1/settings`,
      token,
    );
  } catch {
    settings = undefined;
  }

  return { ...me, settings };
}

export async function fetchReplacementTeamCurrent(
  baseUrl: string,
  token: string,
): Promise<ReplacementTeamCurrentPayload> {
  const root = trimBase(baseUrl);
  return replacementFetch<ReplacementTeamCurrentPayload>(
    `${root}/api/v1/team/current`,
    token,
  );
}

export type ReplacementTransactionsListQuery = {
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
  attachments?: "include" | "exclude" | null;
  recurring?: string[] | null;
  amountRange?: number[] | null;
  amount?: string[] | null;
  type?: "income" | "expense" | null;
  manual?: "include" | "exclude" | null;
};

export type ReplacementBankAccountsListQuery = {
  enabled?: boolean;
  manual?: boolean;
};

export type ReplacementInboxListQuery = {
  cursor?: string | null;
  order?: string | null;
  sort?: string | null;
  pageSize?: number;
  q?: string | null;
  status?: string | null;
  tab?: string | null;
};

export type ReplacementInboxSearchQuery = {
  q?: string | null;
  transactionId?: string | null;
  limit?: number;
};

export type ReplacementInboxByStatusQuery = {
  status?: string | null;
};

export function buildInboxListQuery(params: ReplacementInboxListQuery): string {
  const search = new URLSearchParams();
  if (params.cursor) {
    search.set("cursor", params.cursor);
  }
  if (params.pageSize != null) {
    search.set("pageSize", String(params.pageSize));
  }
  if (params.order) {
    search.set("order", params.order);
  }
  if (params.sort) {
    search.set("sort", params.sort);
  }
  if (params.q) {
    search.set("q", params.q);
  }
  if (params.status) {
    search.set("status", params.status);
  }
  if (params.tab) {
    search.set("tab", params.tab);
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

/** Encodes list query params for GET /api/v1/transactions (exported for tests). */
export function buildTransactionsListQuery(
  params: ReplacementTransactionsListQuery,
): string {
  const search = new URLSearchParams();
  if (params.cursor) {
    search.set("cursor", params.cursor);
  }
  if (params.pageSize != null) {
    search.set("pageSize", String(params.pageSize));
  }
  if (params.q) {
    search.set("q", params.q);
  }
  if (params.start) {
    search.set("start", params.start);
  }
  if (params.end) {
    search.set("end", params.end);
  }
  for (const part of params.sort ?? []) {
    if (part) {
      search.append("sort", part);
    }
  }
  for (const status of params.statuses ?? []) {
    if (status) {
      search.append("statuses", status);
    }
  }
  for (const category of params.categories ?? []) {
    if (category) {
      search.append("categories", category);
    }
  }
  for (const account of params.accounts ?? []) {
    if (account) {
      search.append("accounts", account);
    }
  }
  for (const tag of params.tags ?? []) {
    if (tag) {
      search.append("tags", tag);
    }
  }
  if (params.exported != null) {
    search.set("exported", String(params.exported));
  }
  if (params.fulfilled != null) {
    search.set("fulfilled", String(params.fulfilled));
  }
  for (const assignee of params.assignees ?? []) {
    if (assignee) {
      search.append("assignees", assignee);
    }
  }
  if (params.attachments) {
    search.set("attachments", params.attachments);
  }
  for (const freq of params.recurring ?? []) {
    if (freq) {
      search.append("recurring", freq);
    }
  }
  for (const part of params.amountRange ?? []) {
    if (part != null && !Number.isNaN(part)) {
      search.append("amountRange", String(part));
    }
  }
  for (const part of params.amount ?? []) {
    if (part) {
      search.append("amount", part);
    }
  }
  if (params.type) {
    search.set("type", params.type);
  }
  if (params.manual) {
    search.set("manual", params.manual);
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchReplacementTransactionsReviewCount(
  baseUrl: string,
  token: string,
): Promise<number> {
  const root = trimBase(baseUrl);
  const count = await replacementFetch<number>(
    `${root}/api/v1/transactions/review-count`,
    token,
  );
  return typeof count === "number" && Number.isFinite(count) ? count : 0;
}

export function buildBankAccountsListQuery(
  params: ReplacementBankAccountsListQuery,
): string {
  const search = new URLSearchParams();
  if (params.enabled != null) {
    search.set("enabled", String(params.enabled));
  }
  if (params.manual != null) {
    search.set("manual", String(params.manual));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchReplacementTransactionsList(
  baseUrl: string,
  token: string,
  params: ReplacementTransactionsListQuery,
): Promise<MiddayTransactionsGetShape> {
  const root = trimBase(baseUrl);
  const query = buildTransactionsListQuery(params);
  const payload = await replacementFetch<unknown>(
    `${root}/api/v1/transactions${query}`,
    token,
  );
  return mapReplacementToTransactionsGet(payload);
}

export async function fetchReplacementTransactionCategories(
  baseUrl: string,
  token: string,
): Promise<MiddayTransactionCategoriesGetShape> {
  const root = trimBase(baseUrl);
  const payload = await replacementFetch<unknown>(
    `${root}/api/v1/categories`,
    token,
  );
  return mapReplacementToTransactionCategoriesGet(payload);
}

export async function fetchReplacementBankAccounts(
  baseUrl: string,
  token: string,
  params: ReplacementBankAccountsListQuery = {},
): Promise<MiddayBankAccountsGetShape> {
  const root = trimBase(baseUrl);
  const query = buildBankAccountsListQuery(params);
  const payload = await replacementFetch<unknown>(
    `${root}/api/v1/bank-accounts${query}`,
    token,
  );
  return mapReplacementToBankAccountsGet(payload);
}

export async function fetchReplacementInboxList(
  baseUrl: string,
  token: string,
  params: ReplacementInboxListQuery,
): Promise<MiddayInboxGetShape> {
  const root = trimBase(baseUrl);
  const query = buildInboxListQuery(params);
  const payload = await replacementFetch<unknown>(
    `${root}/api/v1/inbox${query}`,
    token,
  );
  return mapReplacementToInboxGet(payload);
}

export function buildInboxSearchQuery(
  params: ReplacementInboxSearchQuery,
): string {
  const search = new URLSearchParams();
  if (params.q) {
    search.set("q", params.q);
  }
  if (params.transactionId) {
    search.set("transactionId", params.transactionId);
  }
  if (params.limit != null) {
    search.set("limit", String(params.limit));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export function buildInboxByStatusQuery(
  params: ReplacementInboxByStatusQuery,
): string {
  const search = new URLSearchParams();
  if (params.status) {
    search.set("status", params.status);
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchReplacementInboxSearch(
  baseUrl: string,
  token: string,
  params: ReplacementInboxSearchQuery,
): Promise<MiddayInboxSearchItemShape[]> {
  const root = trimBase(baseUrl);
  const query = buildInboxSearchQuery(params);
  const payload = await replacementFetch<unknown>(
    `${root}/api/v1/inbox/search${query}`,
    token,
  );
  return mapReplacementToInboxSearch(payload);
}

export async function fetchReplacementInboxByStatus(
  baseUrl: string,
  token: string,
  params: ReplacementInboxByStatusQuery,
): Promise<MiddayInboxByStatusItemShape[]> {
  const root = trimBase(baseUrl);
  const query = buildInboxByStatusQuery(params);
  const payload = await replacementFetch<unknown>(
    `${root}/api/v1/inbox/by-status${query}`,
    token,
  );
  return mapReplacementToInboxByStatus(payload);
}

export async function fetchReplacementInboxCheckAttachments(
  baseUrl: string,
  token: string,
  id: string,
): Promise<MiddayInboxCheckAttachmentsShape> {
  const root = trimBase(baseUrl);
  const payload = await replacementFetch<unknown>(
    `${root}/api/v1/inbox/${encodeURIComponent(id)}/check-attachments`,
    token,
  );
  return mapReplacementToInboxCheckAttachments(payload);
}

export async function fetchReplacementOverviewSummary(
  baseUrl: string,
  token: string,
): Promise<MiddayOverviewSummaryShape> {
  const root = trimBase(baseUrl);
  const payload = await replacementFetch<unknown>(
    `${root}/api/v1/overview/summary`,
    token,
  );
  return mapReplacementToOverviewSummary(payload);
}

export async function fetchReplacementInboxById(
  baseUrl: string,
  token: string,
  id: string,
): Promise<MiddayInboxByIdShape | null> {
  const root = trimBase(baseUrl);
  const url = `${root}/api/v1/inbox/${encodeURIComponent(id)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`replacement API ${url} HTTP ${res.status}`);
  }

  const payload = (await res.json()) as unknown;
  return mapReplacementToInboxById(payload);
}

export async function fetchReplacementTransactionById(
  baseUrl: string,
  token: string,
  id: string,
): Promise<MiddayTransactionByIdShape | null> {
  const root = trimBase(baseUrl);
  const url = `${root}/api/v1/transactions/${encodeURIComponent(id)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`replacement API ${url} HTTP ${res.status}`);
  }

  const payload = (await res.json()) as unknown;
  return mapReplacementToTransactionById(payload);
}

export type ReplacementDocumentsListQuery = {
  cursor?: string | null;
  pageSize?: number;
  q?: string | null;
  tags?: string[] | null;
  start?: string | null;
  end?: string | null;
};

export function buildDocumentsListQuery(
  params: ReplacementDocumentsListQuery,
): string {
  const search = new URLSearchParams();
  if (params.cursor) search.set("cursor", params.cursor);
  if (params.pageSize != null) search.set("pageSize", String(params.pageSize));
  if (params.q) search.set("q", params.q);
  if (params.start) search.set("start", params.start);
  if (params.end) search.set("end", params.end);
  for (const tag of params.tags ?? []) {
    search.append("tags", tag);
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchReplacementDocumentsList(
  baseUrl: string,
  token: string,
  params: ReplacementDocumentsListQuery,
): Promise<MiddayDocumentsGetShape> {
  const root = trimBase(baseUrl);
  const query = buildDocumentsListQuery(params);
  const payload = await replacementFetch<unknown>(
    `${root}/api/v1/documents${query}`,
    token,
  );
  return mapReplacementToDocumentsGet(payload);
}

export async function fetchReplacementDocumentById(
  baseUrl: string,
  token: string,
  id: string,
  filePath?: string | null,
): Promise<unknown | null> {
  const root = trimBase(baseUrl);
  const search = new URLSearchParams();
  if (filePath) search.set("filePath", filePath);
  const qs = search.toString();
  const url = `${root}/api/v1/documents/${encodeURIComponent(id)}${qs ? `?${qs}` : ""}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`replacement API ${url} HTTP ${res.status}`);
  return mapReplacementToDocumentById(await res.json());
}

export type ReplacementCustomersListQuery = {
  cursor?: string | null;
  pageSize?: number;
  q?: string | null;
  sort?: string[] | null;
};

export function buildCustomersListQuery(
  params: ReplacementCustomersListQuery,
): string {
  const search = new URLSearchParams();
  if (params.cursor) search.set("cursor", params.cursor);
  if (params.pageSize != null) search.set("pageSize", String(params.pageSize));
  if (params.q) search.set("q", params.q);
  for (const part of params.sort ?? []) {
    search.append("sort", part);
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchReplacementCustomersList(
  baseUrl: string,
  token: string,
  params: ReplacementCustomersListQuery,
): Promise<MiddayCustomersGetShape> {
  const root = trimBase(baseUrl);
  const query = buildCustomersListQuery(params);
  const payload = await replacementFetch<unknown>(
    `${root}/api/v1/customers${query}`,
    token,
  );
  return mapReplacementToCustomersGet(payload);
}

export async function fetchReplacementCustomerById(
  baseUrl: string,
  token: string,
  id: string,
): Promise<unknown | null> {
  const root = trimBase(baseUrl);
  const url = `${root}/api/v1/customers/${encodeURIComponent(id)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`replacement API ${url} HTTP ${res.status}`);
  return mapReplacementToCustomerById(await res.json());
}

export type ReplacementInvoicesListQuery = {
  cursor?: string | null;
  pageSize?: number;
  q?: string | null;
  statuses?: string[] | null;
  customers?: string[] | null;
  start?: string | null;
  end?: string | null;
  sort?: string[] | null;
  ids?: string[] | null;
  recurringIds?: string[] | null;
  recurring?: boolean | null;
};

export function buildInvoicesListQuery(
  params: ReplacementInvoicesListQuery,
): string {
  const search = new URLSearchParams();
  if (params.cursor) search.set("cursor", params.cursor);
  if (params.pageSize != null) search.set("pageSize", String(params.pageSize));
  if (params.q) search.set("q", params.q);
  if (params.start) search.set("start", params.start);
  if (params.end) search.set("end", params.end);
  if (params.recurring != null) search.set("recurring", String(params.recurring));
  for (const v of params.statuses ?? []) search.append("statuses", v);
  for (const v of params.customers ?? []) search.append("customers", v);
  for (const v of params.sort ?? []) search.append("sort", v);
  for (const v of params.ids ?? []) search.append("ids", v);
  for (const v of params.recurringIds ?? []) search.append("recurringIds", v);
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchReplacementInvoicesList(
  baseUrl: string,
  token: string,
  params: ReplacementInvoicesListQuery,
): Promise<MiddayInvoicesGetShape> {
  const root = trimBase(baseUrl);
  const query = buildInvoicesListQuery(params);
  const payload = await replacementFetch<unknown>(
    `${root}/api/v1/invoices${query}`,
    token,
  );
  return mapReplacementToInvoicesGet(payload);
}

export async function fetchReplacementInvoiceById(
  baseUrl: string,
  token: string,
  id: string,
): Promise<unknown | null> {
  const root = trimBase(baseUrl);
  const url = `${root}/api/v1/invoices/${encodeURIComponent(id)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`replacement API ${url} HTTP ${res.status}`);
  return mapReplacementToInvoiceById(await res.json());
}

export async function fetchReplacementInvoicePaymentStatus(
  baseUrl: string,
  token: string,
): Promise<MiddayPaymentStatusShape> {
  const root = trimBase(baseUrl);
  const payload = await replacementFetch<unknown>(
    `${root}/api/v1/invoices/payment-status`,
    token,
  );
  return mapReplacementToPaymentStatus(payload);
}

export type ReplacementInvoiceSummaryQuery = {
  statuses?: string[] | null;
};

export function buildInvoiceSummaryQuery(
  params: ReplacementInvoiceSummaryQuery,
): string {
  const search = new URLSearchParams();
  for (const v of params.statuses ?? []) search.append("statuses", v);
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchReplacementInvoiceSummary(
  baseUrl: string,
  token: string,
  params: ReplacementInvoiceSummaryQuery,
): Promise<MiddayInvoiceSummaryShape> {
  const root = trimBase(baseUrl);
  const query = buildInvoiceSummaryQuery(params);
  const payload = await replacementFetch<unknown>(
    `${root}/api/v1/invoices/summary${query}`,
    token,
  );
  return mapReplacementToInvoiceSummary(payload);
}

export type ReplacementGlobalSearchQuery = {
  searchTerm?: string | null;
  language?: string | null;
  limit?: number;
  itemsPerTableLimit?: number;
  relevanceThreshold?: number | null;
};

export function buildGlobalSearchQuery(
  params: ReplacementGlobalSearchQuery,
): string {
  const search = new URLSearchParams();
  if (params.searchTerm) search.set("searchTerm", params.searchTerm);
  if (params.language) search.set("language", params.language);
  if (params.limit != null) search.set("limit", String(params.limit));
  if (params.itemsPerTableLimit != null) {
    search.set("itemsPerTableLimit", String(params.itemsPerTableLimit));
  }
  if (params.relevanceThreshold != null) {
    search.set("relevanceThreshold", String(params.relevanceThreshold));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchReplacementSearchGlobal(
  baseUrl: string,
  token: string,
  params: ReplacementGlobalSearchQuery,
): Promise<MiddayGlobalSearchRowShape[]> {
  const root = trimBase(baseUrl);
  const query = buildGlobalSearchQuery(params);
  const payload = await replacementFetch<unknown>(
    `${root}/api/v1/search/global${query}`,
    token,
  );
  return mapReplacementToGlobalSearch(payload);
}

export { shouldDelegateToReplacementBackend };

/** When false (dual), callers may fall back to legacy on delegation errors. */
export function replacementDelegationRequiresSuccess(): boolean {
  return getBackendMode() === "replacement";
}

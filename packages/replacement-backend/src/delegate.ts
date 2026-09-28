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
  type MiddayBankAccountsGetShape,
  type MiddayInboxByIdShape,
  type MiddayInboxByStatusItemShape,
  type MiddayInboxCheckAttachmentsShape,
  type MiddayInboxGetShape,
  type MiddayInboxSearchItemShape,
  type MiddayOverviewSummaryShape,
  type MiddayTransactionByIdShape,
  type MiddayTransactionCategoriesGetShape,
  type MiddayTransactionsGetShape,
} from "./mappers";

export {
  mapReplacementToBankAccountsGet,
  mapReplacementToInboxById,
  mapReplacementToInboxGet,
  mapReplacementToTeamCurrent,
  mapReplacementToTransactionById,
  mapReplacementToTransactionCategoriesGet,
  mapReplacementToTransactionsGet,
  mapReplacementToUserMe,
  type MiddayBankAccountsGetShape,
  type MiddayInboxByIdShape,
  type MiddayInboxByStatusItemShape,
  type MiddayInboxCheckAttachmentsShape,
  type MiddayInboxGetShape,
  type MiddayInboxSearchItemShape,
  type MiddayOverviewSummaryShape,
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

export { shouldDelegateToReplacementBackend };

/** When false (dual), callers may fall back to legacy on delegation errors. */
export function replacementDelegationRequiresSuccess(): boolean {
  return getBackendMode() === "replacement";
}

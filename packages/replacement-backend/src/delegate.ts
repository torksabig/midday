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
  mapReplacementToTrackerProjectsGet,
  mapReplacementToTrackerEntriesByRange,
  mapReplacementToTrackerBillableHours,
  mapReplacementToTrackerEntriesByDate,
  mapReplacementToTrackerProjectById,
  mapReplacementToTrackerCurrentTimer,
  mapReplacementToTrackerTimerStatus,
  mapReplacementToTrackerEntriesUpsert,
  mapReplacementToIdOnly,
  mapReplacementToInvoiceProducts,
  mapReplacementToInvoiceProduct,
  mapReplacementToSaveLineItemAsProduct,
  mapReplacementToAppMutation,
  mapReplacementToInboxBlocklist,
  mapReplacementToInboxBlocklistItem,
  mapReplacementToReportCreate,
  mapReplacementToTeamInviteMutation,
  mapReplacementToShortLink,
  mapReplacementToInvoiceRecurringList,
  mapReplacementToInvoiceRecurring,
  mapReplacementToInvoiceRecurringMutation,
  mapReplacementToInvoiceRecurringUpcoming,
  mapReplacementToBankAccountMutation,
  mapReplacementToInstitutions,
  mapReplacementToInstitution,
  mapReplacementToInstitutionUpdateUsage,
  mapReplacementToOAuthAuthorized,
  mapReplacementToAttachments,
  mapReplacementToAttachment,
  mapReplacementToBankConnectionReconnect,
  mapReplacementToInboxConfirmMatch,
  mapReplacementToInboxDeclineMatch,
  mapReplacementToInboxUnmatch,
  mapReplacementToCustomerInvoiceSummary,
  mapReplacementToCustomerEnrichmentAction,
  mapReplacementToMoveToReview,
  mapReplacementToSimilarTransactions,
  mapReplacementToTogglePortal,
  mapReplacementToApplicationInfo,
  mapReplacementToPortalCustomer,
  mapReplacementToPortalInvoices,
  mapReplacementToAvailablePlans,
  mapReplacementToInvoiceTemplates,
  mapReplacementToInvoiceTemplate,
  mapReplacementToInvoiceTemplateDelete,
  deepCamelCaseKeys,
  mapReplacementToAccountingConnections,
  mapReplacementToAccountingSyncStatus,
  mapReplacementToBankConnectionsGet,
  mapReplacementToPaymentStatus,
  mapReplacementToInvoiceSummary,
  mapReplacementToGlobalSearch,
  mapReplacementToRelatedDocuments,
  mapReplacementToReportJson,
  mapReplacementToUserInvites,
  mapReplacementToBankAccountsBalances,
  mapReplacementToBankAccountsCurrencies,
  mapReplacementToDocumentTagsGet,
  mapReplacementToTagsGet,
  mapReplacementToBankAccountTransactionCount,
  buildReplacementTransactionUpdateBody,
  mapReplacementToMostActiveClient,
  mapReplacementToCountMetric,
  mapReplacementToAverageInvoiceSize,
  mapReplacementToTopRevenueClient,
  mapReplacementToNotificationsList,
  mapReplacementToNotification,
  mapReplacementToNotificationsUpdateAll,
  mapReplacementToUserUpdate,
  buildReplacementUserUpdateBody,
  mapReplacementToTeamUpdate,
  buildReplacementTeamUpdateBody,
  mapReplacementToTagMutation,
  mapReplacementToDocumentTagCreate,
  mapReplacementToDocumentTagDelete,
  mapReplacementToDocumentTagAssignment,
  mapReplacementToTransactionTagCreate,
  mapReplacementToTransactionTagDelete,
  mapReplacementToCategoryById,
  mapReplacementToTransactionsUpdateMany,
  mapReplacementToAppsGet,
  mapReplacementToOAuthApplicationsList,
  mapReplacementToOAuthApplication,
  mapReplacementToOAuthApplicationDelete,
  mapReplacementToInboxAccountsGet,
  type MiddayAccountingConnectionShape,
  type MiddayNotificationsListShape,
  type MiddayNotificationShape,
  type MiddayUserUpdateShape,
  type MiddayTeamUpdateShape,
  type MiddayTagMutationShape,
  type MiddayDocumentTagMutationShape,
  type MiddayDocumentTagDeleteShape,
  type MiddayDocumentTagAssignmentShape,
  type MiddayTransactionTagCreateShape,
  type MiddayBankAccountsGetShape,
  type MiddayRelatedDocumentShape,
  type MiddayCustomersGetShape,
  type MiddayDocumentsGetShape,
  type MiddayInvoicesGetShape,
  type MiddayTrackerProjectsGetShape,
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
  mapReplacementToRelatedDocuments,
  mapReplacementToReportJson,
  mapReplacementToInboxById,
  mapReplacementToInboxByStatus,
  mapReplacementToInboxCheckAttachments,
  mapReplacementToInboxGet,
  mapReplacementToInboxSearch,
  mapReplacementToInvoiceById,
  mapReplacementToInvoiceSummary,
  mapReplacementToInvoicesGet,
  mapReplacementToTrackerProjectsGet,
  mapReplacementToTrackerEntriesByRange,
  mapReplacementToTrackerBillableHours,
  mapReplacementToTrackerEntriesByDate,
  mapReplacementToTrackerProjectById,
  mapReplacementToTrackerCurrentTimer,
  mapReplacementToTrackerTimerStatus,
  mapReplacementToTrackerEntriesUpsert,
  mapReplacementToIdOnly,
  mapReplacementToInvoiceProducts,
  mapReplacementToInvoiceProduct,
  mapReplacementToSaveLineItemAsProduct,
  mapReplacementToAppMutation,
  mapReplacementToInboxBlocklist,
  mapReplacementToInboxBlocklistItem,
  mapReplacementToReportCreate,
  mapReplacementToTeamInviteMutation,
  mapReplacementToShortLink,
  mapReplacementToInvoiceRecurringList,
  mapReplacementToInvoiceRecurring,
  mapReplacementToInvoiceRecurringMutation,
  mapReplacementToInvoiceRecurringUpcoming,
  mapReplacementToBankAccountMutation,
  mapReplacementToInstitutions,
  mapReplacementToInstitution,
  mapReplacementToInstitutionUpdateUsage,
  mapReplacementToOAuthAuthorized,
  mapReplacementToAttachments,
  mapReplacementToAttachment,
  mapReplacementToBankConnectionReconnect,
  mapReplacementToInboxConfirmMatch,
  mapReplacementToInboxDeclineMatch,
  mapReplacementToInboxUnmatch,
  mapReplacementToCustomerInvoiceSummary,
  mapReplacementToCustomerEnrichmentAction,
  mapReplacementToMoveToReview,
  mapReplacementToSimilarTransactions,
  mapReplacementToTogglePortal,
  mapReplacementToApplicationInfo,
  mapReplacementToPortalCustomer,
  mapReplacementToPortalInvoices,
  mapReplacementToAvailablePlans,
  mapReplacementToInvoiceTemplates,
  mapReplacementToInvoiceTemplate,
  mapReplacementToInvoiceTemplateDelete,
  deepCamelCaseKeys,
  mapReplacementToAccountingConnections,
  mapReplacementToAccountingSyncStatus,
  mapReplacementToBankConnectionsGet,
  mapReplacementToOverviewSummary,
  mapReplacementToPaymentStatus,
  mapReplacementToTeamCurrent,
  mapReplacementToTransactionById,
  mapReplacementToTransactionCategoriesGet,
  mapReplacementToTransactionsGet,
  mapReplacementToUserMe,
  mapReplacementToUserInvites,
  mapReplacementToBankAccountsBalances,
  mapReplacementToBankAccountsCurrencies,
  mapReplacementToDocumentTagsGet,
  mapReplacementToTagsGet,
  mapReplacementToBankAccountTransactionCount,
  buildReplacementTransactionUpdateBody,
  mapReplacementToMostActiveClient,
  mapReplacementToCountMetric,
  mapReplacementToAverageInvoiceSize,
  mapReplacementToTopRevenueClient,
  mapReplacementToNotificationsList,
  mapReplacementToNotification,
  mapReplacementToNotificationsUpdateAll,
  mapReplacementToUserUpdate,
  buildReplacementUserUpdateBody,
  mapReplacementToTeamUpdate,
  buildReplacementTeamUpdateBody,
  mapReplacementToTagMutation,
  mapReplacementToDocumentTagCreate,
  mapReplacementToDocumentTagDelete,
  mapReplacementToDocumentTagAssignment,
  mapReplacementToTransactionsUpdateMany,
  mapReplacementToAppsGet,
  mapReplacementToOAuthApplicationsList,
  mapReplacementToOAuthApplication,
  mapReplacementToOAuthApplicationDelete,
  mapReplacementToInboxAccountsGet,
  type MiddayBankAccountsGetShape,
  type MiddayNotificationsListShape,
  type MiddayNotificationShape,
  type MiddayUserUpdateShape,
  type MiddayTeamUpdateShape,
  type MiddayTagMutationShape,
  type MiddayDocumentTagMutationShape,
  type MiddayDocumentTagDeleteShape,
  type MiddayDocumentTagAssignmentShape,
  type MiddayCustomersGetShape,
  type MiddayDocumentsGetShape,
  type MiddayGlobalSearchRowShape,
  type MiddayRelatedDocumentShape,
  type MiddayInvoiceSummaryShape,
  type MiddayInvoicesGetShape,
  type MiddayTrackerProjectsGetShape,
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
  type ReplacementTrackerProjectsListQuery,
  type ReplacementTrackerEntriesByRangeQuery,
  type ReplacementTrackerBillableHoursQuery,
  type ReplacementBankConnectionsListQuery,
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

async function replacementPost<T>(
  url: string,
  token: string,
  body: unknown,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!res.ok) {
    throw new Error(`replacement API ${url} HTTP ${res.status}`);
  }

  return (await res.json()) as T;
}

async function replacementPut<T>(
  url: string,
  token: string,
  body: unknown,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<T | null> {
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`replacement API ${url} HTTP ${res.status}`);
  }

  return (await res.json()) as T;
}

async function replacementDelete<T>(
  url: string,
  token: string,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<T | null> {
  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`replacement API ${url} HTTP ${res.status}`);
  }

  return (await res.json()) as T;
}

async function replacementDeleteWithBody<T>(
  url: string,
  token: string,
  body: unknown,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<T | null> {
  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`replacement API ${url} HTTP ${res.status}`);
  }

  return (await res.json()) as T;
}

/** Public report share routes (no bearer). */
export class ReplacementPublicFetchError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ReplacementPublicFetchError";
    this.status = status;
  }
}

async function replacementFetchPublic<T>(
  url: string,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<T> {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!res.ok) {
    throw new ReplacementPublicFetchError(
      `replacement API ${url} HTTP ${res.status}`,
      res.status,
    );
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

export async function fetchReplacementRelatedDocuments(
  baseUrl: string,
  token: string,
  id: string,
  pageSize: number,
): Promise<MiddayRelatedDocumentShape[]> {
  const root = trimBase(baseUrl);
  const search = new URLSearchParams({ pageSize: String(pageSize) });
  const payload = await replacementFetch<unknown>(
    `${root}/api/v1/documents/${encodeURIComponent(id)}/related?${search}`,
    token,
  );
  return mapReplacementToRelatedDocuments(payload);
}

export type ReplacementReportDateRangeQuery = {
  from: string;
  to: string;
  currency?: string | null;
  revenueType?: "gross" | "net" | null;
};

function buildReportDateRangeQuery(params: ReplacementReportDateRangeQuery): string {
  const search = new URLSearchParams({ from: params.from, to: params.to });
  if (params.currency) search.set("currency", params.currency);
  if (params.revenueType) search.set("revenueType", params.revenueType);
  return `?${search.toString()}`;
}

async function fetchReplacementReportPath(
  baseUrl: string,
  token: string,
  path: string,
  query: string,
): Promise<unknown> {
  const root = trimBase(baseUrl);
  const payload = await replacementFetch<unknown>(
    `${root}/api/v1/reports/${path}${query}`,
    token,
  );
  return mapReplacementToReportJson(payload);
}

export async function fetchReplacementReportsRevenue(
  baseUrl: string,
  token: string,
  params: ReplacementReportDateRangeQuery,
): Promise<unknown> {
  return fetchReplacementReportPath(
    baseUrl,
    token,
    "revenue",
    buildReportDateRangeQuery(params),
  );
}

export async function fetchReplacementReportsProfit(
  baseUrl: string,
  token: string,
  params: ReplacementReportDateRangeQuery,
): Promise<unknown> {
  return fetchReplacementReportPath(
    baseUrl,
    token,
    "profit",
    buildReportDateRangeQuery(params),
  );
}

export async function fetchReplacementReportsBurnRate(
  baseUrl: string,
  token: string,
  params: ReplacementReportDateRangeQuery,
): Promise<unknown> {
  return fetchReplacementReportPath(
    baseUrl,
    token,
    "burn-rate",
    buildReportDateRangeQuery(params),
  );
}

export async function fetchReplacementReportsRunway(
  baseUrl: string,
  token: string,
  currency?: string | null,
): Promise<unknown> {
  const search = new URLSearchParams();
  if (currency) search.set("currency", currency);
  const qs = search.toString();
  return fetchReplacementReportPath(
    baseUrl,
    token,
    "runway",
    qs ? `?${qs}` : "",
  );
}

export async function fetchReplacementReportsExpense(
  baseUrl: string,
  token: string,
  params: ReplacementReportDateRangeQuery,
): Promise<unknown> {
  return fetchReplacementReportPath(
    baseUrl,
    token,
    "expense",
    buildReportDateRangeQuery(params),
  );
}

export async function fetchReplacementReportsSpending(
  baseUrl: string,
  token: string,
  params: ReplacementReportDateRangeQuery,
): Promise<unknown> {
  return fetchReplacementReportPath(
    baseUrl,
    token,
    "spending",
    buildReportDateRangeQuery(params),
  );
}

export type ReplacementTaxSummaryQuery = {
  from: string;
  to: string;
  currency?: string | null;
  type: string;
  categorySlug?: string | null;
  taxType?: string | null;
};

export async function fetchReplacementReportsTaxSummary(
  baseUrl: string,
  token: string,
  params: ReplacementTaxSummaryQuery,
): Promise<unknown> {
  const search = new URLSearchParams({
    from: params.from,
    to: params.to,
    type: params.type,
  });
  if (params.currency) search.set("currency", params.currency);
  if (params.categorySlug) search.set("categorySlug", params.categorySlug);
  if (params.taxType) search.set("taxType", params.taxType);
  return fetchReplacementReportPath(
    baseUrl,
    token,
    "tax-summary",
    `?${search.toString()}`,
  );
}

export async function fetchReplacementReportsAccountBalances(
  baseUrl: string,
  token: string,
  currency?: string | null,
): Promise<unknown> {
  const search = new URLSearchParams();
  if (currency) search.set("currency", currency);
  const qs = search.toString();
  return fetchReplacementReportPath(
    baseUrl,
    token,
    "account-balances",
    qs ? `?${qs}` : "",
  );
}

export type ReplacementRevenueForecastQuery = ReplacementReportDateRangeQuery & {
  forecastMonths?: number | null;
};

function buildRevenueForecastQuery(params: ReplacementRevenueForecastQuery): string {
  const search = new URLSearchParams({ from: params.from, to: params.to });
  if (params.currency) search.set("currency", params.currency);
  if (params.revenueType) search.set("revenueType", params.revenueType);
  if (params.forecastMonths != null) {
    search.set("forecastMonths", String(params.forecastMonths));
  }
  return `?${search.toString()}`;
}

export async function fetchReplacementReportsRevenueForecast(
  baseUrl: string,
  token: string,
  params: ReplacementRevenueForecastQuery,
): Promise<unknown> {
  return fetchReplacementReportPath(
    baseUrl,
    token,
    "revenue-forecast",
    buildRevenueForecastQuery(params),
  );
}

export async function fetchReplacementReportByLinkId(
  baseUrl: string,
  linkId: string,
): Promise<unknown> {
  const root = trimBase(baseUrl);
  const payload = await replacementFetchPublic<unknown>(
    `${root}/api/v1/reports/public/${encodeURIComponent(linkId)}`,
  );
  if (payload === null) {
    return undefined;
  }
  return mapReplacementToReportJson(payload);
}

export async function fetchReplacementReportChartByLinkId(
  baseUrl: string,
  linkId: string,
): Promise<unknown> {
  const root = trimBase(baseUrl);
  const payload = await replacementFetchPublic<unknown>(
    `${root}/api/v1/reports/public/${encodeURIComponent(linkId)}/chart`,
  );
  return mapReplacementToReportJson(payload);
}

export type ReplacementSearchAttachmentsQuery = {
  q?: string | null;
  transactionId?: string | null;
  limit?: number | null;
};

export function buildSearchAttachmentsQuery(
  params: ReplacementSearchAttachmentsQuery,
): string {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.transactionId) search.set("transactionId", params.transactionId);
  if (params.limit != null) search.set("limit", String(params.limit));
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchReplacementSearchAttachments(
  baseUrl: string,
  token: string,
  params: ReplacementSearchAttachmentsQuery,
): Promise<unknown[]> {
  const root = trimBase(baseUrl);
  const payload = await replacementFetch<unknown[]>(
    `${root}/api/v1/search/attachments${buildSearchAttachmentsQuery(params)}`,
    token,
  );
  return mapReplacementToReportJson(payload) as unknown[];
}

export type ReplacementTrackerProjectsListQuery = {
  cursor?: string | null;
  pageSize?: number | null;
  q?: string | null;
  start?: string | null;
  end?: string | null;
  status?: "in_progress" | "completed" | null;
  customers?: string[] | null;
  tags?: string[] | null;
  sort?: string[] | null;
};

export function buildTrackerProjectsListQuery(
  params: ReplacementTrackerProjectsListQuery,
): string {
  const search = new URLSearchParams();
  if (params.cursor) search.set("cursor", params.cursor);
  if (params.pageSize != null) search.set("pageSize", String(params.pageSize));
  if (params.q) search.set("q", params.q);
  if (params.start) search.set("start", params.start);
  if (params.end) search.set("end", params.end);
  if (params.status) search.set("status", params.status);
  for (const v of params.customers ?? []) search.append("customers", v);
  for (const v of params.tags ?? []) search.append("tags", v);
  for (const v of params.sort ?? []) search.append("sort", v);
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchReplacementTrackerProjects(
  baseUrl: string,
  token: string,
  params: ReplacementTrackerProjectsListQuery,
): Promise<MiddayTrackerProjectsGetShape> {
  const root = trimBase(baseUrl);
  const payload = await replacementFetch<unknown>(
    `${root}/api/v1/tracker/projects${buildTrackerProjectsListQuery(params)}`,
    token,
  );
  return mapReplacementToTrackerProjectsGet(payload);
}

export type ReplacementTrackerEntriesByRangeQuery = {
  from: string;
  to: string;
  projectId?: string | null;
};

export function buildTrackerEntriesByRangeQuery(
  params: ReplacementTrackerEntriesByRangeQuery,
): string {
  const search = new URLSearchParams();
  search.set("from", params.from);
  search.set("to", params.to);
  if (params.projectId) search.set("projectId", params.projectId);
  return `?${search.toString()}`;
}

export async function fetchReplacementTrackerEntriesByRange(
  baseUrl: string,
  token: string,
  params: ReplacementTrackerEntriesByRangeQuery,
): Promise<unknown> {
  const root = trimBase(baseUrl);
  const payload = await replacementFetch<unknown>(
    `${root}/api/v1/tracker/entries/by-range${buildTrackerEntriesByRangeQuery(params)}`,
    token,
  );
  return mapReplacementToTrackerEntriesByRange(payload);
}

export type ReplacementTrackerBillableHoursQuery = {
  date: string;
  view: "week" | "month";
  weekStartsOnMonday?: boolean;
};

export function buildTrackerBillableHoursQuery(
  params: ReplacementTrackerBillableHoursQuery,
): string {
  const search = new URLSearchParams();
  search.set("date", params.date);
  search.set("view", params.view);
  if (params.weekStartsOnMonday != null) {
    search.set("weekStartsOnMonday", String(params.weekStartsOnMonday));
  }
  return `?${search.toString()}`;
}

export async function fetchReplacementTrackerBillableHours(
  baseUrl: string,
  token: string,
  params: ReplacementTrackerBillableHoursQuery,
): Promise<unknown> {
  const root = trimBase(baseUrl);
  const payload = await replacementFetch<unknown>(
    `${root}/api/v1/tracker/billable-hours${buildTrackerBillableHoursQuery(params)}`,
    token,
  );
  return mapReplacementToTrackerBillableHours(payload);
}

export type ReplacementTrackerEntriesByDateQuery = {
  date: string;
};

export function buildTrackerEntriesByDateQuery(
  params: ReplacementTrackerEntriesByDateQuery,
): string {
  const search = new URLSearchParams();
  search.set("date", params.date);
  return `?${search.toString()}`;
}

export async function fetchReplacementTrackerEntriesByDate(
  baseUrl: string,
  token: string,
  params: ReplacementTrackerEntriesByDateQuery,
): Promise<unknown> {
  const root = trimBase(baseUrl);
  const payload = await replacementFetch<unknown>(
    `${root}/api/v1/tracker/entries/by-date${buildTrackerEntriesByDateQuery(params)}`,
    token,
  );
  return mapReplacementToTrackerEntriesByDate(payload);
}

export async function fetchReplacementTrackerProjectById(
  baseUrl: string,
  token: string,
  id: string,
): Promise<unknown | null> {
  const root = trimBase(baseUrl);
  const url = `${root}/api/v1/tracker/projects/${encodeURIComponent(id)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`replacement API ${url} HTTP ${res.status}`);
  return mapReplacementToTrackerProjectById(await res.json());
}

export type ReplacementTrackerTimerQuery = {
  assignedId?: string | null;
};

export function buildTrackerTimerQuery(
  params: ReplacementTrackerTimerQuery,
): string {
  const search = new URLSearchParams();
  if (params.assignedId) search.set("assignedId", params.assignedId);
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchReplacementTrackerCurrentTimer(
  baseUrl: string,
  token: string,
  params: ReplacementTrackerTimerQuery,
): Promise<unknown | null> {
  const root = trimBase(baseUrl);
  const url = `${root}/api/v1/tracker/timer/current${buildTrackerTimerQuery(params)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`replacement API ${url} HTTP ${res.status}`);
  const body: unknown = await res.json();
  return mapReplacementToTrackerCurrentTimer(body);
}

export async function fetchReplacementTrackerTimerStatus(
  baseUrl: string,
  token: string,
  params: ReplacementTrackerTimerQuery,
): Promise<unknown> {
  const root = trimBase(baseUrl);
  const payload = await replacementFetch<unknown>(
    `${root}/api/v1/tracker/timer/status${buildTrackerTimerQuery(params)}`,
    token,
  );
  return mapReplacementToTrackerTimerStatus(payload);
}

export type ReplacementStartTimerInput = {
  projectId: string;
  assignedId?: string | null;
  description?: string | null;
  start?: string;
};

export type ReplacementStopTimerInput = {
  entryId?: string;
  assignedId?: string | null;
  stop?: string;
};

export async function fetchReplacementTrackerStartTimer(
  baseUrl: string,
  token: string,
  input: ReplacementStartTimerInput,
): Promise<unknown> {
  const root = trimBase(baseUrl);
  const payload = await replacementPost<unknown>(
    `${root}/api/v1/tracker/timer/start`,
    token,
    {
      projectId: input.projectId,
      assignedId: input.assignedId ?? undefined,
      description: input.description ?? undefined,
      start: input.start,
    },
  );
  return mapReplacementToTrackerCurrentTimer(payload);
}

export async function fetchReplacementTrackerStopTimer(
  baseUrl: string,
  token: string,
  input: ReplacementStopTimerInput,
): Promise<unknown> {
  const root = trimBase(baseUrl);
  const payload = await replacementPost<unknown>(
    `${root}/api/v1/tracker/timer/stop`,
    token,
    {
      entryId: input.entryId,
      assignedId: input.assignedId ?? undefined,
      stop: input.stop,
    },
  );
  return mapReplacementToTrackerCurrentTimer(payload ?? {});
}

export type ReplacementTrackerUpsertInput = {
  id?: string;
  start: string;
  stop: string;
  dates: string[];
  assignedId?: string | null;
  projectId: string;
  description?: string | null;
  duration: number;
};

export async function fetchReplacementTrackerEntriesUpsert(
  baseUrl: string,
  token: string,
  input: ReplacementTrackerUpsertInput,
): Promise<unknown[]> {
  const root = trimBase(baseUrl);
  const payload = await replacementPost<unknown>(
    `${root}/api/v1/tracker/entries/upsert`,
    token,
    {
      id: input.id,
      start: input.start,
      stop: input.stop,
      dates: input.dates,
      assignedId: input.assignedId ?? undefined,
      projectId: input.projectId,
      description: input.description ?? undefined,
      duration: input.duration,
    },
  );
  return mapReplacementToTrackerEntriesUpsert(payload);
}

export async function fetchReplacementTrackerEntryDelete(
  baseUrl: string,
  token: string,
  id: string,
): Promise<{ id: string } | null> {
  const root = trimBase(baseUrl);
  const payload = await replacementDelete<unknown>(
    `${root}/api/v1/tracker/entries/${encodeURIComponent(id)}`,
    token,
  );
  return mapReplacementToIdOnly(payload);
}

export async function fetchReplacementInvoiceDelete(
  baseUrl: string,
  token: string,
  id: string,
): Promise<{ id: string } | null> {
  const root = trimBase(baseUrl);
  const payload = await replacementDelete<unknown>(
    `${root}/api/v1/invoices/${encodeURIComponent(id)}`,
    token,
  );
  return mapReplacementToIdOnly(payload);
}

export type ReplacementAccountingSyncStatusQuery = {
  transactionIds?: string[] | null;
  providerId?: string | null;
};

export function buildAccountingSyncStatusQuery(
  params: ReplacementAccountingSyncStatusQuery,
): string {
  const search = new URLSearchParams();
  for (const id of params.transactionIds ?? []) {
    search.append("transactionIds", id);
  }
  if (params.providerId) search.set("providerId", params.providerId);
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchReplacementAccountingSyncStatus(
  baseUrl: string,
  token: string,
  params: ReplacementAccountingSyncStatusQuery,
): Promise<unknown[]> {
  const root = trimBase(baseUrl);
  const payload = await replacementFetch<unknown>(
    `${root}/api/v1/accounting/sync-status${buildAccountingSyncStatusQuery(params)}`,
    token,
  );
  return mapReplacementToAccountingSyncStatus(payload);
}

export async function fetchReplacementAccountingConnections(
  baseUrl: string,
  token: string,
): Promise<MiddayAccountingConnectionShape[]> {
  const root = trimBase(baseUrl);
  const payload = await replacementFetch<unknown>(
    `${root}/api/v1/accounting/connections`,
    token,
  );
  return mapReplacementToAccountingConnections(payload);
}

export type ReplacementBankConnectionsListQuery = {
  enabled?: boolean | null;
};

export function buildBankConnectionsListQuery(
  params: ReplacementBankConnectionsListQuery,
): string {
  const search = new URLSearchParams();
  if (params.enabled != null) search.set("enabled", String(params.enabled));
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchReplacementBankConnections(
  baseUrl: string,
  token: string,
  params: ReplacementBankConnectionsListQuery,
): Promise<unknown[]> {
  const root = trimBase(baseUrl);
  const payload = await replacementFetch<unknown[]>(
    `${root}/api/v1/bank-connections${buildBankConnectionsListQuery(params)}`,
    token,
  );
  return mapReplacementToBankConnectionsGet(payload);
}

export async function fetchReplacementUserInvites(
  baseUrl: string,
  token: string,
): Promise<unknown[]> {
  const root = trimBase(baseUrl);
  const payload = await replacementFetch<unknown>(
    `${root}/api/v1/user/invites`,
    token,
  );
  return mapReplacementToUserInvites(payload);
}

export async function fetchReplacementBankAccountsBalances(
  baseUrl: string,
  token: string,
): Promise<unknown[]> {
  const root = trimBase(baseUrl);
  const payload = await replacementFetch<unknown>(
    `${root}/api/v1/bank-accounts/balances`,
    token,
  );
  return mapReplacementToBankAccountsBalances(payload);
}

export async function fetchReplacementBankAccountsCurrencies(
  baseUrl: string,
  token: string,
): Promise<unknown[]> {
  const root = trimBase(baseUrl);
  const payload = await replacementFetch<unknown>(
    `${root}/api/v1/bank-accounts/currencies`,
    token,
  );
  return mapReplacementToBankAccountsCurrencies(payload);
}

export async function fetchReplacementDocumentTags(
  baseUrl: string,
  token: string,
): Promise<unknown[]> {
  const root = trimBase(baseUrl);
  const payload = await replacementFetch<unknown>(
    `${root}/api/v1/document-tags`,
    token,
  );
  return mapReplacementToDocumentTagsGet(payload);
}

export async function fetchReplacementTags(
  baseUrl: string,
  token: string,
): Promise<unknown[]> {
  const root = trimBase(baseUrl);
  const payload = await replacementFetch<unknown>(
    `${root}/api/v1/tags`,
    token,
  );
  return mapReplacementToTagsGet(payload);
}

export async function fetchReplacementBankAccountTransactionCount(
  baseUrl: string,
  token: string,
  bankAccountId: string,
): Promise<{ count: number }> {
  const root = trimBase(baseUrl);
  const payload = await replacementFetch<unknown>(
    `${root}/api/v1/bank-accounts/${encodeURIComponent(bankAccountId)}/transaction-count`,
    token,
  );
  return mapReplacementToBankAccountTransactionCount(payload);
}

export type ReplacementTransactionUpdateInput = Record<string, unknown> & {
  id: string;
};

export async function fetchReplacementTransactionUpdate(
  baseUrl: string,
  token: string,
  input: ReplacementTransactionUpdateInput,
): Promise<MiddayTransactionByIdShape | null> {
  const root = trimBase(baseUrl);
  const { id } = input;
  const body = buildReplacementTransactionUpdateBody(input);
  const payload = await replacementPut<unknown>(
    `${root}/api/v1/transactions/${encodeURIComponent(id)}`,
    token,
    body,
  );
  if (payload == null) {
    return null;
  }
  return mapReplacementToTransactionById(payload);
}

export async function fetchReplacementMostActiveClient(
  baseUrl: string,
  token: string,
): Promise<unknown | null> {
  const root = trimBase(baseUrl);
  const payload = await replacementFetch<unknown | null>(
    `${root}/api/v1/invoices/metrics/most-active-client`,
    token,
  );
  return mapReplacementToMostActiveClient(payload);
}

export async function fetchReplacementInactiveClientsCount(
  baseUrl: string,
  token: string,
): Promise<number> {
  const root = trimBase(baseUrl);
  const payload = await replacementFetch<unknown>(
    `${root}/api/v1/invoices/metrics/inactive-clients-count`,
    token,
  );
  return mapReplacementToCountMetric(payload);
}

export async function fetchReplacementAverageDaysToPayment(
  baseUrl: string,
  token: string,
): Promise<number> {
  const root = trimBase(baseUrl);
  const payload = await replacementFetch<unknown>(
    `${root}/api/v1/invoices/metrics/average-days-to-payment`,
    token,
  );
  return mapReplacementToCountMetric(payload);
}

export async function fetchReplacementAverageInvoiceSize(
  baseUrl: string,
  token: string,
): Promise<unknown[]> {
  const root = trimBase(baseUrl);
  const payload = await replacementFetch<unknown>(
    `${root}/api/v1/invoices/metrics/average-invoice-size`,
    token,
  );
  return mapReplacementToAverageInvoiceSize(payload);
}

export async function fetchReplacementTopRevenueClient(
  baseUrl: string,
  token: string,
): Promise<unknown | null> {
  const root = trimBase(baseUrl);
  const payload = await replacementFetch<unknown | null>(
    `${root}/api/v1/invoices/metrics/top-revenue-client`,
    token,
  );
  return mapReplacementToTopRevenueClient(payload);
}

export async function fetchReplacementNewCustomersCount(
  baseUrl: string,
  token: string,
): Promise<number> {
  const root = trimBase(baseUrl);
  const payload = await replacementFetch<unknown>(
    `${root}/api/v1/invoices/metrics/new-customers-count`,
    token,
  );
  return mapReplacementToCountMetric(payload);
}

export type ReplacementNotificationsListQuery = {
  cursor?: string | null;
  pageSize?: number;
  status?:
    | "unread"
    | "read"
    | "archived"
    | Array<"unread" | "read" | "archived">
    | null;
  userId?: string | null;
  priority?: number | null;
  maxPriority?: number | null;
  createdAfter?: string | null;
};

export function buildNotificationsListQuery(
  params: ReplacementNotificationsListQuery,
): string {
  const search = new URLSearchParams();
  if (params.cursor) {
    search.set("cursor", params.cursor);
  }
  if (params.pageSize != null) {
    search.set("pageSize", String(params.pageSize));
  }
  if (params.status) {
    const statuses = Array.isArray(params.status)
      ? params.status
      : [params.status];
    for (const s of statuses) {
      search.append("status", s);
    }
  }
  if (params.userId) {
    search.set("userId", params.userId);
  }
  if (params.priority != null) {
    search.set("priority", String(params.priority));
  }
  if (params.maxPriority != null) {
    search.set("maxPriority", String(params.maxPriority));
  }
  if (params.createdAfter) {
    search.set("createdAfter", params.createdAfter);
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchReplacementNotificationsList(
  baseUrl: string,
  token: string,
  params: ReplacementNotificationsListQuery,
): Promise<MiddayNotificationsListShape> {
  const root = trimBase(baseUrl);
  const query = buildNotificationsListQuery(params);
  const payload = await replacementFetch<unknown>(
    `${root}/api/v1/notifications${query}`,
    token,
  );
  return mapReplacementToNotificationsList(payload);
}

export async function fetchReplacementNotificationUpdateStatus(
  baseUrl: string,
  token: string,
  activityId: string,
  status: "unread" | "read" | "archived",
): Promise<MiddayNotificationShape | null> {
  const root = trimBase(baseUrl);
  const payload = await replacementPut<unknown>(
    `${root}/api/v1/notifications/${encodeURIComponent(activityId)}/status`,
    token,
    { status },
  );
  if (payload == null) {
    return null;
  }
  return mapReplacementToNotification(payload);
}

export async function fetchReplacementNotificationsUpdateAll(
  baseUrl: string,
  token: string,
  status: "unread" | "read" | "archived",
): Promise<MiddayNotificationShape[]> {
  const root = trimBase(baseUrl);
  const payload = await replacementPut<unknown>(
    `${root}/api/v1/notifications/status`,
    token,
    { status },
  );
  return mapReplacementToNotificationsUpdateAll(payload ?? []);
}

export async function fetchReplacementUserUpdate(
  baseUrl: string,
  token: string,
  input: Record<string, unknown>,
): Promise<MiddayUserUpdateShape | null> {
  const root = trimBase(baseUrl);
  const payload = await replacementPut<unknown>(
    `${root}/api/v1/user`,
    token,
    buildReplacementUserUpdateBody(input),
  );
  if (payload == null) {
    return null;
  }
  return mapReplacementToUserUpdate(payload);
}

export async function fetchReplacementTransactionsUpdateMany(
  baseUrl: string,
  token: string,
  input: Record<string, unknown>,
): Promise<MiddayTransactionByIdShape[]> {
  const root = trimBase(baseUrl);
  const payload = await replacementPost<unknown>(
    `${root}/api/v1/transactions/update-many`,
    token,
    input,
  );
  return mapReplacementToTransactionsUpdateMany(payload);
}

export async function fetchReplacementInboxUpdate(
  baseUrl: string,
  token: string,
  id: string,
  body: Record<string, unknown>,
): Promise<MiddayInboxByIdShape | null> {
  const root = trimBase(baseUrl);
  const payload = await replacementPut<unknown>(
    `${root}/api/v1/inbox/${encodeURIComponent(id)}`,
    token,
    body,
  );
  if (payload == null) {
    return null;
  }
  return mapReplacementToInboxById(payload);
}

export type ReplacementInvoiceUpdateInput = Record<string, unknown> & {
  id: string;
};

export async function fetchReplacementInvoiceUpdate(
  baseUrl: string,
  token: string,
  input: ReplacementInvoiceUpdateInput,
): Promise<unknown | null> {
  const root = trimBase(baseUrl);
  const { id } = input;
  const body = buildReplacementTransactionUpdateBody(input);
  const payload = await replacementPut<unknown>(
    `${root}/api/v1/invoices/${encodeURIComponent(id)}`,
    token,
    body,
  );
  if (payload == null) {
    return null;
  }
  return mapReplacementToInvoiceById(payload);
}

export async function fetchReplacementInvoiceDraft(
  baseUrl: string,
  token: string,
  input: unknown,
): Promise<unknown> {
  const root = trimBase(baseUrl);
  const payload = await replacementPost<unknown>(
    `${root}/api/v1/invoices/draft`,
    token,
    input,
  );
  return mapReplacementToInvoiceById(payload);
}

export async function fetchReplacementInvoiceDuplicate(
  baseUrl: string,
  token: string,
  input: { id: string; invoiceNumber: string },
): Promise<unknown> {
  const root = trimBase(baseUrl);
  const payload = await replacementPost<unknown>(
    `${root}/api/v1/invoices/duplicate`,
    token,
    input,
  );
  return mapReplacementToInvoiceById(payload);
}

export type ReplacementInvoiceProductsQuery = {
  sortBy?: string;
  limit?: number;
  includeInactive?: boolean;
  currency?: string;
};

export async function fetchReplacementInvoiceProducts(
  baseUrl: string,
  token: string,
  params: ReplacementInvoiceProductsQuery,
): Promise<unknown[]> {
  const root = trimBase(baseUrl);
  const search = new URLSearchParams();
  if (params.sortBy) search.set("sortBy", params.sortBy);
  if (params.limit != null) search.set("limit", String(params.limit));
  if (params.includeInactive != null) {
    search.set("includeInactive", String(params.includeInactive));
  }
  if (params.currency) search.set("currency", params.currency);
  const qs = search.toString();
  const payload = await replacementFetch<unknown>(
    `${root}/api/v1/invoice-products${qs ? `?${qs}` : ""}`,
    token,
  );
  return mapReplacementToInvoiceProducts(payload);
}

export async function fetchReplacementInvoiceProductById(
  baseUrl: string,
  token: string,
  id: string,
): Promise<unknown | null> {
  const root = trimBase(baseUrl);
  const url = `${root}/api/v1/invoice-products/${encodeURIComponent(id)}`;
  try {
    const payload = await replacementFetch<unknown>(url, token);
    return mapReplacementToInvoiceProduct(payload);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("HTTP 404")
    ) {
      return null;
    }
    throw error;
  }
}

export async function fetchReplacementInvoiceProductDelete(
  baseUrl: string,
  token: string,
  id: string,
): Promise<boolean> {
  const root = trimBase(baseUrl);
  const payload = await replacementDelete<unknown>(
    `${root}/api/v1/invoice-products/${encodeURIComponent(id)}`,
    token,
  );
  return payload === true;
}

export async function fetchReplacementInvoiceProductIncrementUsage(
  baseUrl: string,
  token: string,
  id: string,
): Promise<{ success: true }> {
  const root = trimBase(baseUrl);
  await replacementPost<unknown>(
    `${root}/api/v1/invoice-products/${encodeURIComponent(id)}/increment-usage`,
    token,
    {},
  );
  return { success: true };
}

export type ReplacementInvoiceProductCreateInput = {
  name: string;
  description?: string | null;
  price?: number | null;
  currency?: string | null;
  unit?: string | null;
  taxRate?: number | null;
  isActive?: boolean;
};

export type ReplacementInvoiceProductUpsertInput = {
  name: string;
  description?: string | null;
  price?: number | null;
  currency?: string | null;
  unit?: string | null;
  taxRate?: number | null;
};

export type ReplacementInvoiceProductUpdateInput = {
  name?: string;
  description?: string | null;
  price?: number | null;
  currency?: string | null;
  unit?: string | null;
  taxRate?: number | null;
  isActive?: boolean;
};

export async function fetchReplacementInvoiceProductCreate(
  baseUrl: string,
  token: string,
  input: ReplacementInvoiceProductCreateInput,
): Promise<unknown> {
  const root = trimBase(baseUrl);
  const payload = await replacementPost<unknown>(
    `${root}/api/v1/invoice-products`,
    token,
    input,
  );
  return mapReplacementToInvoiceProduct(payload);
}

export async function fetchReplacementInvoiceProductUpsert(
  baseUrl: string,
  token: string,
  input: ReplacementInvoiceProductUpsertInput,
): Promise<unknown> {
  const root = trimBase(baseUrl);
  const payload = await replacementPost<unknown>(
    `${root}/api/v1/invoice-products/upsert`,
    token,
    input,
  );
  return mapReplacementToInvoiceProduct(payload);
}

export async function fetchReplacementInvoiceProductUpdate(
  baseUrl: string,
  token: string,
  id: string,
  input: ReplacementInvoiceProductUpdateInput,
): Promise<unknown | null> {
  const root = trimBase(baseUrl);
  const payload = await replacementPut<unknown>(
    `${root}/api/v1/invoice-products/${encodeURIComponent(id)}`,
    token,
    input,
  );
  if (payload == null) return null;
  return mapReplacementToInvoiceProduct(payload);
}

export type ReplacementSaveLineItemAsProductInput = {
  name: string;
  price?: number | null;
  unit?: string | null;
  productId?: string;
  currency?: string | null;
};

export async function fetchReplacementInvoiceProductSaveLineItem(
  baseUrl: string,
  token: string,
  input: ReplacementSaveLineItemAsProductInput,
): Promise<{ product: unknown | null; shouldClearProductId: boolean }> {
  const root = trimBase(baseUrl);
  const payload = await replacementPost<unknown>(
    `${root}/api/v1/invoice-products/save-line-item`,
    token,
    input,
  );
  return mapReplacementToSaveLineItemAsProduct(payload);
}

export async function fetchReplacementAppsDisconnect(
  baseUrl: string,
  token: string,
  appId: string,
): Promise<unknown | null> {
  const root = trimBase(baseUrl);
  const payload = await replacementDelete<unknown>(
    `${root}/api/v1/apps/${encodeURIComponent(appId)}`,
    token,
  );
  if (payload == null) return null;
  return mapReplacementToAppMutation(payload);
}

export type ReplacementAppsUpdateInput = {
  option: { id: string; value: string | number | boolean };
};

export async function fetchReplacementAppsUpdate(
  baseUrl: string,
  token: string,
  appId: string,
  input: ReplacementAppsUpdateInput,
): Promise<unknown> {
  const root = trimBase(baseUrl);
  const payload = await replacementPut<unknown>(
    `${root}/api/v1/apps/${encodeURIComponent(appId)}/settings`,
    token,
    input,
  );
  return mapReplacementToAppMutation(payload);
}

export type ReplacementAppsUpdateSettingsInput = {
  settings: Array<{
    id: string;
    value: unknown;
    [key: string]: unknown;
  }>;
};

export async function fetchReplacementAppsUpdateSettings(
  baseUrl: string,
  token: string,
  appId: string,
  input: ReplacementAppsUpdateSettingsInput,
): Promise<unknown> {
  const root = trimBase(baseUrl);
  const payload = await replacementPut<unknown>(
    `${root}/api/v1/apps/${encodeURIComponent(appId)}/settings/bulk`,
    token,
    input,
  );
  return mapReplacementToAppMutation(payload);
}

export async function fetchReplacementInboxBlocklist(
  baseUrl: string,
  token: string,
): Promise<unknown[]> {
  const root = trimBase(baseUrl);
  const payload = await replacementFetch<unknown>(
    `${root}/api/v1/inbox/blocklist`,
    token,
  );
  return mapReplacementToInboxBlocklist(payload);
}

export type ReplacementInboxBlocklistCreateInput = {
  type: "email" | "domain";
  value: string;
};

export async function fetchReplacementInboxBlocklistCreate(
  baseUrl: string,
  token: string,
  input: ReplacementInboxBlocklistCreateInput,
): Promise<unknown> {
  const root = trimBase(baseUrl);
  const payload = await replacementPost<unknown>(
    `${root}/api/v1/inbox/blocklist`,
    token,
    input,
  );
  return mapReplacementToInboxBlocklistItem(payload);
}

export async function fetchReplacementInboxBlocklistDelete(
  baseUrl: string,
  token: string,
  id: string,
): Promise<unknown | null> {
  const root = trimBase(baseUrl);
  const payload = await replacementDelete<unknown>(
    `${root}/api/v1/inbox/blocklist/${encodeURIComponent(id)}`,
    token,
  );
  if (payload == null) return null;
  return mapReplacementToInboxBlocklistItem(payload);
}

export async function fetchReplacementApiKeyDelete(
  baseUrl: string,
  token: string,
  id: string,
): Promise<string | undefined> {
  const root = trimBase(baseUrl);
  const payload = await replacementDelete<unknown>(
    `${root}/api/v1/api-keys/${encodeURIComponent(id)}`,
    token,
  );
  if (payload == null || typeof payload !== "object") return undefined;
  const row = payload as Record<string, unknown>;
  const keyHash = row.keyHash ?? row.key_hash;
  return typeof keyHash === "string" ? keyHash : undefined;
}

export type ReplacementReportCreateInput = {
  type: string;
  from: string;
  to: string;
  currency?: string;
  expireAt?: string;
};

export async function fetchReplacementReportCreate(
  baseUrl: string,
  token: string,
  input: ReplacementReportCreateInput,
): Promise<unknown> {
  const root = trimBase(baseUrl);
  const payload = await replacementPost<unknown>(
    `${root}/api/v1/reports`,
    token,
    input,
  );
  return mapReplacementToReportCreate(payload);
}

export async function fetchReplacementTeamAcceptInvite(
  baseUrl: string,
  token: string,
  id: string,
): Promise<unknown> {
  const root = trimBase(baseUrl);
  const payload = await replacementPost<unknown>(
    `${root}/api/v1/team/invites/accept`,
    token,
    { id },
  );
  return mapReplacementToTeamInviteMutation(payload);
}

export async function fetchReplacementTeamDeclineInvite(
  baseUrl: string,
  token: string,
  id: string,
): Promise<unknown> {
  const root = trimBase(baseUrl);
  const payload = await replacementPost<unknown>(
    `${root}/api/v1/team/invites/decline`,
    token,
    { id },
  );
  return mapReplacementToTeamInviteMutation(payload);
}

export async function fetchReplacementTeamDeleteInvite(
  baseUrl: string,
  token: string,
  id: string,
): Promise<unknown | null> {
  const root = trimBase(baseUrl);
  const payload = await replacementDelete<unknown>(
    `${root}/api/v1/team/invites/${encodeURIComponent(id)}`,
    token,
  );
  if (payload == null) return null;
  return mapReplacementToTeamInviteMutation(payload);
}

export type ReplacementTeamMemberInput = {
  userId: string;
  teamId: string;
};

export async function fetchReplacementTeamDeleteMember(
  baseUrl: string,
  token: string,
  input: ReplacementTeamMemberInput,
): Promise<unknown> {
  const root = trimBase(baseUrl);
  const payload = await replacementDeleteWithBody<unknown>(
    `${root}/api/v1/team/members`,
    token,
    input,
  );
  return mapReplacementToTeamInviteMutation(payload);
}

export type ReplacementTeamUpdateMemberInput = {
  userId: string;
  teamId: string;
  role: "owner" | "member";
};

export async function fetchReplacementTeamUpdateMember(
  baseUrl: string,
  token: string,
  input: ReplacementTeamUpdateMemberInput,
): Promise<unknown> {
  const root = trimBase(baseUrl);
  const payload = await replacementPut<unknown>(
    `${root}/api/v1/team/members`,
    token,
    input,
  );
  return mapReplacementToTeamInviteMutation(payload);
}

export async function fetchReplacementShortLinkGet(
  baseUrl: string,
  shortId: string,
): Promise<unknown> {
  const root = trimBase(baseUrl);
  const payload = await replacementFetchPublic<unknown>(
    `${root}/api/v1/short-links/${encodeURIComponent(shortId)}`,
  );
  return mapReplacementToShortLink(payload);
}

export type ReplacementShortLinkCreateInput = {
  url: string;
  type?: string;
  fileName?: string;
  mimeType?: string;
  size?: number;
  expiresAt?: string;
};

export async function fetchReplacementShortLinkCreate(
  baseUrl: string,
  token: string,
  input: ReplacementShortLinkCreateInput,
): Promise<unknown> {
  const root = trimBase(baseUrl);
  const payload = await replacementPost<unknown>(
    `${root}/api/v1/short-links`,
    token,
    input,
  );
  return mapReplacementToShortLink(payload);
}

export type ReplacementInvoiceRecurringListQuery = {
  cursor?: string | null;
  pageSize?: number;
  status?: string[];
  customerId?: string;
};

export async function fetchReplacementInvoiceRecurringList(
  baseUrl: string,
  token: string,
  query: ReplacementInvoiceRecurringListQuery = {},
): Promise<unknown> {
  const root = trimBase(baseUrl);
  const search = new URLSearchParams();
  if (query.cursor) search.set("cursor", query.cursor);
  if (query.pageSize != null) search.set("pageSize", String(query.pageSize));
  if (query.status?.length) search.set("status", query.status.join(","));
  if (query.customerId) search.set("customerId", query.customerId);
  const qs = search.toString();
  const payload = await replacementFetch<unknown>(
    `${root}/api/v1/invoice-recurring${qs ? `?${qs}` : ""}`,
    token,
  );
  return mapReplacementToInvoiceRecurringList(payload);
}

export async function fetchReplacementInvoiceRecurringGet(
  baseUrl: string,
  token: string,
  id: string,
): Promise<unknown> {
  const root = trimBase(baseUrl);
  const payload = await replacementFetch<unknown>(
    `${root}/api/v1/invoice-recurring/${encodeURIComponent(id)}`,
    token,
  );
  return mapReplacementToInvoiceRecurring(payload);
}

export async function fetchReplacementInvoiceRecurringPause(
  baseUrl: string,
  token: string,
  id: string,
): Promise<{ recurring: unknown; jobIds: string[] }> {
  const root = trimBase(baseUrl);
  const payload = await replacementPost<unknown>(
    `${root}/api/v1/invoice-recurring/${encodeURIComponent(id)}/pause`,
    token,
    {},
  );
  return mapReplacementToInvoiceRecurringMutation(payload);
}

export async function fetchReplacementInvoiceRecurringResume(
  baseUrl: string,
  token: string,
  id: string,
): Promise<unknown> {
  const root = trimBase(baseUrl);
  const payload = await replacementPost<unknown>(
    `${root}/api/v1/invoice-recurring/${encodeURIComponent(id)}/resume`,
    token,
    {},
  );
  return mapReplacementToInvoiceRecurring(payload);
}

export async function fetchReplacementInvoiceRecurringDelete(
  baseUrl: string,
  token: string,
  id: string,
): Promise<{ recurring: unknown; jobIds: string[] }> {
  const root = trimBase(baseUrl);
  const payload = await replacementDelete<unknown>(
    `${root}/api/v1/invoice-recurring/${encodeURIComponent(id)}`,
    token,
  );
  return mapReplacementToInvoiceRecurringMutation(payload);
}

export async function fetchReplacementInvoiceRecurringUpcoming(
  baseUrl: string,
  token: string,
  id: string,
  limit?: number,
): Promise<unknown> {
  const root = trimBase(baseUrl);
  const search = new URLSearchParams();
  if (limit != null) search.set("limit", String(limit));
  const qs = search.toString();
  const payload = await replacementFetch<unknown>(
    `${root}/api/v1/invoice-recurring/${encodeURIComponent(id)}/upcoming${qs ? `?${qs}` : ""}`,
    token,
  );
  return mapReplacementToInvoiceRecurringUpcoming(payload);
}

/** accounting.disconnect reuses apps DELETE; returns `{ success: true }`. */
export async function fetchReplacementAccountingDisconnect(
  baseUrl: string,
  token: string,
  providerId: string,
): Promise<{ success: true }> {
  await fetchReplacementAppsDisconnect(baseUrl, token, providerId);
  return { success: true };
}

export async function fetchReplacementTeamLeave(
  baseUrl: string,
  token: string,
  teamId: string,
): Promise<unknown> {
  const root = trimBase(baseUrl);
  const payload = await replacementPost<unknown>(
    `${root}/api/v1/team/leave`,
    token,
    { teamId },
  );
  return mapReplacementToTeamInviteMutation(payload);
}

export type ReplacementBankAccountCreateInput = {
  name: string;
  currency?: string;
  manual?: boolean;
};

export async function fetchReplacementBankAccountCreate(
  baseUrl: string,
  token: string,
  input: ReplacementBankAccountCreateInput,
): Promise<unknown> {
  const root = trimBase(baseUrl);
  const payload = await replacementPost<unknown>(
    `${root}/api/v1/bank-accounts`,
    token,
    input,
  );
  return mapReplacementToBankAccountMutation(payload);
}

export type ReplacementBankAccountUpdateInput = {
  name?: string;
  type?: string;
  balance?: number;
  enabled?: boolean;
  currency?: string;
  baseBalance?: number;
  baseCurrency?: string;
};

export async function fetchReplacementBankAccountUpdate(
  baseUrl: string,
  token: string,
  id: string,
  input: ReplacementBankAccountUpdateInput,
): Promise<unknown | null> {
  const root = trimBase(baseUrl);
  try {
    const payload = await replacementPut<unknown>(
      `${root}/api/v1/bank-accounts/${encodeURIComponent(id)}`,
      token,
      input,
    );
    return mapReplacementToBankAccountMutation(payload);
  } catch (error) {
    if (error instanceof Error && error.message.includes("HTTP 404")) {
      return null;
    }
    throw error;
  }
}

export async function fetchReplacementBankAccountDelete(
  baseUrl: string,
  token: string,
  id: string,
): Promise<unknown | null> {
  const root = trimBase(baseUrl);
  try {
    const payload = await replacementDelete<unknown>(
      `${root}/api/v1/bank-accounts/${encodeURIComponent(id)}`,
      token,
    );
    return mapReplacementToBankAccountMutation(payload);
  } catch (error) {
    if (error instanceof Error && error.message.includes("HTTP 404")) {
      return null;
    }
    throw error;
  }
}

export type ReplacementInstitutionsQuery = {
  countryCode: string;
  q?: string;
  limit?: number;
  excludeProviders?: string[];
};

export async function fetchReplacementInstitutionsGet(
  baseUrl: string,
  token: string,
  query: ReplacementInstitutionsQuery,
): Promise<unknown[]> {
  const root = trimBase(baseUrl);
  const search = new URLSearchParams();
  search.set("countryCode", query.countryCode);
  if (query.q) search.set("q", query.q);
  if (query.limit != null) search.set("limit", String(query.limit));
  if (query.excludeProviders?.length) {
    search.set("excludeProviders", query.excludeProviders.join(","));
  }
  const payload = await replacementFetch<unknown>(
    `${root}/api/v1/institutions?${search}`,
    token,
  );
  return mapReplacementToInstitutions(payload);
}

export async function fetchReplacementInstitutionGetById(
  baseUrl: string,
  token: string,
  id: string,
): Promise<unknown> {
  const root = trimBase(baseUrl);
  const payload = await replacementFetch<unknown>(
    `${root}/api/v1/institutions/${encodeURIComponent(id)}`,
    token,
  );
  return mapReplacementToInstitution(payload);
}

export async function fetchReplacementInstitutionUpdateUsage(
  baseUrl: string,
  token: string,
  id: string,
): Promise<unknown> {
  const root = trimBase(baseUrl);
  const payload = await replacementPost<unknown>(
    `${root}/api/v1/institutions/${encodeURIComponent(id)}`,
    token,
    {},
  );
  return mapReplacementToInstitutionUpdateUsage(payload);
}

export async function fetchReplacementOAuthAuthorized(
  baseUrl: string,
  token: string,
): Promise<unknown> {
  const root = trimBase(baseUrl);
  const payload = await replacementFetch<unknown>(
    `${root}/api/v1/oauth-applications/authorized`,
    token,
  );
  return mapReplacementToOAuthAuthorized(payload);
}

export async function fetchReplacementOAuthRevokeAccess(
  baseUrl: string,
  token: string,
  applicationId: string,
): Promise<{ success: true }> {
  const root = trimBase(baseUrl);
  await replacementDelete<unknown>(
    `${root}/api/v1/oauth-applications/authorized/${encodeURIComponent(applicationId)}`,
    token,
  );
  return { success: true };
}

export type ReplacementAttachmentInput = {
  type: string;
  name: string;
  size: number;
  path: string[];
  transactionId?: string;
};

export async function fetchReplacementAttachmentsCreateMany(
  baseUrl: string,
  token: string,
  attachments: ReplacementAttachmentInput[],
): Promise<unknown[]> {
  const root = trimBase(baseUrl);
  const payload = await replacementPost<unknown>(
    `${root}/api/v1/transaction-attachments`,
    token,
    { attachments },
  );
  return mapReplacementToAttachments(payload);
}

export async function fetchReplacementAttachmentDelete(
  baseUrl: string,
  token: string,
  id: string,
): Promise<unknown> {
  const root = trimBase(baseUrl);
  const payload = await replacementDelete<unknown>(
    `${root}/api/v1/transaction-attachments/${encodeURIComponent(id)}`,
    token,
  );
  return mapReplacementToAttachment(payload);
}

export type ReplacementBankConnectionReconnectInput = {
  referenceId: string;
  newReferenceId: string;
  expiresAt?: string;
};

export async function fetchReplacementBankConnectionReconnect(
  baseUrl: string,
  token: string,
  input: ReplacementBankConnectionReconnectInput,
): Promise<unknown | null> {
  const root = trimBase(baseUrl);
  try {
    const payload = await replacementPost<unknown>(
      `${root}/api/v1/bank-connections/reconnect`,
      token,
      input,
    );
    return mapReplacementToBankConnectionReconnect(payload);
  } catch (error) {
    if (error instanceof Error && error.message.includes("HTTP 404")) {
      return null;
    }
    throw error;
  }
}

export async function fetchReplacementInvoiceTemplates(
  baseUrl: string,
  token: string,
): Promise<unknown[]> {
  const root = trimBase(baseUrl);
  const payload = await replacementFetch<unknown>(
    `${root}/api/v1/invoice-templates`,
    token,
  );
  return mapReplacementToInvoiceTemplates(payload);
}

export async function fetchReplacementInvoiceTemplateById(
  baseUrl: string,
  token: string,
  id: string,
): Promise<unknown | null> {
  const root = trimBase(baseUrl);
  const url = `${root}/api/v1/invoice-templates/${encodeURIComponent(id)}`;
  try {
    const payload = await replacementFetch<unknown>(url, token);
    return mapReplacementToInvoiceTemplate(payload);
  } catch (error) {
    if (error instanceof Error && error.message.includes("HTTP 404")) {
      return null;
    }
    throw error;
  }
}

export async function fetchReplacementInvoiceTemplateCount(
  baseUrl: string,
  token: string,
): Promise<number> {
  const root = trimBase(baseUrl);
  const payload = await replacementFetch<unknown>(
    `${root}/api/v1/invoice-templates/count`,
    token,
  );
  if (typeof payload === "number") return payload;
  if (typeof payload === "string") return Number(payload);
  throw new Error("replacement invoice-templates/count: expected number");
}

export async function fetchReplacementInvoiceTemplateCreate(
  baseUrl: string,
  token: string,
  input: Record<string, unknown>,
): Promise<unknown> {
  const root = trimBase(baseUrl);
  const payload = await replacementPost<unknown>(
    `${root}/api/v1/invoice-templates`,
    token,
    input,
  );
  return mapReplacementToInvoiceTemplate(payload);
}

export async function fetchReplacementInvoiceTemplateUpsert(
  baseUrl: string,
  token: string,
  input: Record<string, unknown>,
): Promise<unknown | null> {
  const root = trimBase(baseUrl);
  const payload = await replacementPost<unknown>(
    `${root}/api/v1/invoice-templates/upsert`,
    token,
    input,
  );
  if (payload == null) return null;
  return mapReplacementToInvoiceTemplate(payload);
}

export async function fetchReplacementInvoiceTemplateSetDefault(
  baseUrl: string,
  token: string,
  id: string,
): Promise<unknown | null> {
  const root = trimBase(baseUrl);
  try {
    const payload = await replacementPost<unknown>(
      `${root}/api/v1/invoice-templates/${encodeURIComponent(id)}/set-default`,
      token,
      {},
    );
    return mapReplacementToInvoiceTemplate(payload);
  } catch (error) {
    if (error instanceof Error && error.message.includes("HTTP 404")) {
      return null;
    }
    throw error;
  }
}

export async function fetchReplacementInvoiceTemplateDelete(
  baseUrl: string,
  token: string,
  id: string,
): Promise<unknown> {
  const root = trimBase(baseUrl);
  const payload = await replacementDelete<unknown>(
    `${root}/api/v1/invoice-templates/${encodeURIComponent(id)}`,
    token,
  );
  return mapReplacementToInvoiceTemplateDelete(payload);
}

export type ReplacementCategoryCreateInput = {
  name: string;
  color?: string;
  description?: string;
  taxRate?: number;
  taxType?: string;
  taxReportingCode?: string;
  parentId?: string;
};

export type ReplacementCategoryUpdateInput = {
  name?: string;
  color?: string | null;
  description?: string | null;
  taxRate?: number | null;
  taxType?: string | null;
  taxReportingCode?: string | null;
  parentId?: string | null;
  clearParent?: boolean;
  excluded?: boolean | null;
};

export async function fetchReplacementCategoryCreate(
  baseUrl: string,
  token: string,
  input: ReplacementCategoryCreateInput,
): Promise<unknown> {
  const root = trimBase(baseUrl);
  const payload = await replacementPost<unknown>(
    `${root}/api/v1/categories`,
    token,
    input,
  );
  return mapReplacementToCategoryById(payload);
}

export async function fetchReplacementCategoryUpdate(
  baseUrl: string,
  token: string,
  id: string,
  input: ReplacementCategoryUpdateInput,
): Promise<unknown | null> {
  const root = trimBase(baseUrl);
  const payload = await replacementPut<unknown>(
    `${root}/api/v1/categories/${encodeURIComponent(id)}`,
    token,
    {
      name: input.name,
      color: input.color,
      description: input.description,
      taxRate: input.taxRate,
      taxType: input.taxType,
      taxReportingCode: input.taxReportingCode,
      parentId: input.parentId ?? undefined,
      clearParent: input.parentId === null || input.clearParent === true,
      excluded: input.excluded,
    },
  );
  if (payload == null) {
    return null;
  }
  return mapReplacementToCategoryById(payload);
}

export async function fetchReplacementCategoryDelete(
  baseUrl: string,
  token: string,
  id: string,
): Promise<unknown | null> {
  const root = trimBase(baseUrl);
  const payload = await replacementDelete<unknown>(
    `${root}/api/v1/categories/${encodeURIComponent(id)}`,
    token,
  );
  if (payload == null) {
    return null;
  }
  return mapReplacementToCategoryById(payload);
}

export async function fetchReplacementAppsGet(
  baseUrl: string,
  token: string,
): Promise<unknown[]> {
  const root = trimBase(baseUrl);
  const payload = await replacementFetch<unknown>(
    `${root}/api/v1/apps`,
    token,
  );
  return mapReplacementToAppsGet(payload);
}

export async function fetchReplacementOAuthApplicationsList(
  baseUrl: string,
  token: string,
): Promise<{ data: unknown[] }> {
  const root = trimBase(baseUrl);
  const payload = await replacementFetch<unknown>(
    `${root}/api/v1/oauth-applications`,
    token,
  );
  return mapReplacementToOAuthApplicationsList(payload);
}

export type ReplacementOAuthAppCreateInput = {
  name: string;
  description?: string;
  overview?: string;
  developerName?: string;
  logoUrl?: string;
  website?: string;
  installUrl?: string;
  screenshots?: string[];
  redirectUris: string[];
  scopes?: string[];
  isPublic?: boolean;
};

export type ReplacementOAuthAppUpdateInput = {
  name?: string;
  description?: string;
  overview?: string;
  developerName?: string;
  logoUrl?: string;
  website?: string;
  installUrl?: string;
  screenshots?: string[];
  redirectUris?: string[];
  scopes?: string[];
  isPublic?: boolean;
  active?: boolean;
};

export async function fetchReplacementOAuthApplicationGet(
  baseUrl: string,
  token: string,
  id: string,
): Promise<unknown> {
  const root = trimBase(baseUrl);
  const payload = await replacementFetch<unknown>(
    `${root}/api/v1/oauth-applications/${encodeURIComponent(id)}`,
    token,
  );
  return mapReplacementToOAuthApplication(payload);
}

export async function fetchReplacementOAuthApplicationCreate(
  baseUrl: string,
  token: string,
  input: ReplacementOAuthAppCreateInput,
): Promise<unknown> {
  const root = trimBase(baseUrl);
  const payload = await replacementPost<unknown>(
    `${root}/api/v1/oauth-applications`,
    token,
    input,
  );
  return mapReplacementToOAuthApplication(payload);
}

export async function fetchReplacementOAuthApplicationUpdate(
  baseUrl: string,
  token: string,
  id: string,
  input: ReplacementOAuthAppUpdateInput,
): Promise<unknown | null> {
  const root = trimBase(baseUrl);
  const payload = await replacementPut<unknown>(
    `${root}/api/v1/oauth-applications/${encodeURIComponent(id)}`,
    token,
    input,
  );
  if (payload == null) {
    return null;
  }
  return mapReplacementToOAuthApplication(payload);
}

export async function fetchReplacementOAuthApplicationDelete(
  baseUrl: string,
  token: string,
  id: string,
): Promise<{ id: string; name: string } | null> {
  const root = trimBase(baseUrl);
  const payload = await replacementDelete<unknown>(
    `${root}/api/v1/oauth-applications/${encodeURIComponent(id)}`,
    token,
  );
  if (payload == null) {
    return null;
  }
  return mapReplacementToOAuthApplicationDelete(payload);
}

export async function fetchReplacementOAuthApplicationRegenerateSecret(
  baseUrl: string,
  token: string,
  id: string,
): Promise<{ id: string; clientId: string; clientSecret: string } | null> {
  const root = trimBase(baseUrl);
  try {
    const payload = await replacementPost<unknown>(
      `${root}/api/v1/oauth-applications/${encodeURIComponent(id)}/regenerate-secret`,
      token,
      {},
    );
    const mapped = deepCamelCaseKeys(
      payload,
    ) as { id?: string; clientId?: string; clientSecret?: string };
    if (!mapped?.id || !mapped.clientId || !mapped.clientSecret) {
      return null;
    }
    return {
      id: mapped.id,
      clientId: mapped.clientId,
      clientSecret: mapped.clientSecret,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("HTTP 404")) {
      return null;
    }
    throw error;
  }
}

export type ReplacementTrackerProjectUpsertInput = {
  id?: string;
  name: string;
  description?: string | null;
  estimate?: number | null;
  billable?: boolean | null;
  rate?: number | null;
  currency?: string | null;
  customerId?: string | null;
  tags?: { id: string; value?: string }[] | null;
};

export async function fetchReplacementTrackerProjectUpsert(
  baseUrl: string,
  token: string,
  input: ReplacementTrackerProjectUpsertInput,
): Promise<unknown | null> {
  const root = trimBase(baseUrl);
  const payload = await replacementPost<unknown>(
    `${root}/api/v1/tracker/projects`,
    token,
    input,
  );
  if (payload == null) return null;
  return mapReplacementToTrackerProjectById(payload);
}

export async function fetchReplacementTrackerProjectDelete(
  baseUrl: string,
  token: string,
  id: string,
): Promise<{ id: string } | null> {
  const root = trimBase(baseUrl);
  const payload = await replacementDelete<unknown>(
    `${root}/api/v1/tracker/projects/${encodeURIComponent(id)}`,
    token,
  );
  if (payload == null) return null;
  return mapReplacementToIdOnly(payload);
}

export async function fetchReplacementInboxAccountsGet(
  baseUrl: string,
  token: string,
): Promise<unknown[]> {
  const root = trimBase(baseUrl);
  const payload = await replacementFetch<unknown>(
    `${root}/api/v1/inbox-accounts`,
    token,
  );
  return mapReplacementToInboxAccountsGet(payload);
}

export async function fetchReplacementTransactionsDeleteMany(
  baseUrl: string,
  token: string,
  ids: string[],
): Promise<Array<{ id: string }>> {
  const root = trimBase(baseUrl);
  const payload = await replacementPost<unknown>(
    `${root}/api/v1/transactions/delete-many`,
    token,
    ids,
  );
  if (!Array.isArray(payload)) {
    throw new Error("replacement delete-many: expected array");
  }
  return payload.map((row) => {
    if (!row || typeof row !== "object" || typeof (row as { id?: unknown }).id !== "string") {
      throw new Error("replacement delete-many: invalid row");
    }
    return { id: (row as { id: string }).id };
  });
}

export async function fetchReplacementInboxMatch(
  baseUrl: string,
  token: string,
  id: string,
  transactionId: string,
): Promise<MiddayInboxByIdShape | null> {
  const root = trimBase(baseUrl);
  const payload = await replacementPost<unknown>(
    `${root}/api/v1/inbox/${encodeURIComponent(id)}/match`,
    token,
    { transactionId },
  );
  if (payload == null) return null;
  return mapReplacementToInboxById(payload);
}

export async function fetchReplacementInboxConfirmMatch(
  baseUrl: string,
  token: string,
  input: {
    suggestionId: string;
    inboxId: string;
    transactionId: string;
  },
): Promise<MiddayInboxByIdShape | null> {
  const root = trimBase(baseUrl);
  const payload = await replacementPost<unknown>(
    `${root}/api/v1/inbox/confirm-match`,
    token,
    input,
  );
  if (payload == null) return null;
  return mapReplacementToInboxConfirmMatch(payload);
}

export async function fetchReplacementInboxDeclineMatch(
  baseUrl: string,
  token: string,
  input: { suggestionId: string; inboxId: string },
): Promise<{ ok: true }> {
  const root = trimBase(baseUrl);
  const payload = await replacementPost<unknown>(
    `${root}/api/v1/inbox/decline-match`,
    token,
    input,
  );
  return mapReplacementToInboxDeclineMatch(payload ?? { ok: true });
}

export async function fetchReplacementInboxUnmatch(
  baseUrl: string,
  token: string,
  id: string,
): Promise<unknown[] | null> {
  const root = trimBase(baseUrl);
  const payload = await replacementPost<unknown>(
    `${root}/api/v1/inbox/${encodeURIComponent(id)}/unmatch`,
    token,
    {},
  );
  return mapReplacementToInboxUnmatch(payload);
}

export async function fetchReplacementCustomerInvoiceSummary(
  baseUrl: string,
  token: string,
  customerId: string,
): Promise<unknown> {
  const root = trimBase(baseUrl);
  const payload = await replacementFetch<unknown>(
    `${root}/api/v1/customers/${encodeURIComponent(customerId)}/invoice-summary`,
    token,
  );
  return mapReplacementToCustomerInvoiceSummary(payload);
}

export async function fetchReplacementCustomerCancelEnrichment(
  baseUrl: string,
  token: string,
  customerId: string,
): Promise<unknown> {
  const root = trimBase(baseUrl);
  const payload = await replacementPost<unknown>(
    `${root}/api/v1/customers/${encodeURIComponent(customerId)}/cancel-enrichment`,
    token,
    {},
  );
  return mapReplacementToCustomerEnrichmentAction(payload ?? { cancelled: true });
}

export async function fetchReplacementCustomerClearEnrichment(
  baseUrl: string,
  token: string,
  customerId: string,
): Promise<unknown> {
  const root = trimBase(baseUrl);
  const payload = await replacementPost<unknown>(
    `${root}/api/v1/customers/${encodeURIComponent(customerId)}/clear-enrichment`,
    token,
    {},
  );
  return mapReplacementToCustomerEnrichmentAction(payload ?? { cleared: true });
}

export async function fetchReplacementMoveToReview(
  baseUrl: string,
  token: string,
  transactionId: string,
): Promise<{ success: true }> {
  const root = trimBase(baseUrl);
  const payload = await replacementPost<unknown>(
    `${root}/api/v1/transactions/${encodeURIComponent(transactionId)}/move-to-review`,
    token,
    {},
  );
  return mapReplacementToMoveToReview(payload ?? { success: true });
}

export async function fetchReplacementSimilarTransactions(
  baseUrl: string,
  token: string,
  query: {
    name: string;
    categorySlug?: string;
    transactionId?: string;
  },
): Promise<unknown[]> {
  const root = trimBase(baseUrl);
  const params = new URLSearchParams({ name: query.name });
  if (query.categorySlug) params.set("categorySlug", query.categorySlug);
  if (query.transactionId) params.set("transactionId", query.transactionId);
  const payload = await replacementFetch<unknown>(
    `${root}/api/v1/transactions/similar?${params}`,
    token,
  );
  return mapReplacementToSimilarTransactions(payload);
}

export async function fetchReplacementTogglePortal(
  baseUrl: string,
  token: string,
  input: { customerId: string; enabled: boolean },
): Promise<unknown> {
  const root = trimBase(baseUrl);
  const payload = await replacementPost<unknown>(
    `${root}/api/v1/customers/toggle-portal`,
    token,
    input,
  );
  return mapReplacementToTogglePortal(payload);
}

export async function fetchReplacementApplicationInfo(
  baseUrl: string,
  token: string,
  query: {
    clientId: string;
    redirectUri: string;
    scope: string;
    state?: string;
  },
): Promise<unknown> {
  const root = trimBase(baseUrl);
  const params = new URLSearchParams({
    clientId: query.clientId,
    redirectUri: query.redirectUri,
    scope: query.scope,
  });
  if (query.state) params.set("state", query.state);
  const payload = await replacementFetch<unknown>(
    `${root}/api/v1/oauth-applications/application-info?${params}`,
    token,
  );
  return mapReplacementToApplicationInfo(payload);
}

export async function fetchReplacementPortalCustomer(
  baseUrl: string,
  portalId: string,
): Promise<unknown | null> {
  const root = trimBase(baseUrl);
  // Public route — no bearer required; still use replacementFetch with empty token if needed.
  const res = await fetch(
    `${root}/api/v1/portal/${encodeURIComponent(portalId)}`,
  );
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`replacement portal customer: HTTP ${res.status}`);
  }
  const payload = await res.json();
  if (payload == null) return null;
  return mapReplacementToPortalCustomer(payload);
}

export async function fetchReplacementPortalInvoices(
  baseUrl: string,
  portalId: string,
  query: { cursor?: string | null; pageSize?: number },
): Promise<unknown> {
  const root = trimBase(baseUrl);
  const params = new URLSearchParams();
  if (query.cursor) params.set("cursor", query.cursor);
  if (query.pageSize != null) params.set("pageSize", String(query.pageSize));
  const qs = params.toString();
  const res = await fetch(
    `${root}/api/v1/portal/${encodeURIComponent(portalId)}/invoices${qs ? `?${qs}` : ""}`,
  );
  if (!res.ok) {
    throw new Error(`replacement portal invoices: HTTP ${res.status}`);
  }
  const payload = await res.json();
  return mapReplacementToPortalInvoices(payload);
}

export async function fetchReplacementAvailablePlans(
  baseUrl: string,
  token: string,
): Promise<unknown> {
  const root = trimBase(baseUrl);
  const payload = await replacementFetch<unknown>(
    `${root}/api/v1/team/available-plans`,
    token,
  );
  return mapReplacementToAvailablePlans(payload);
}

export async function fetchReplacementInboxDelete(
  baseUrl: string,
  token: string,
  id: string,
): Promise<{ id: string; filePath: string[] | null } | null> {
  const root = trimBase(baseUrl);
  const payload = await replacementPost<unknown>(
    `${root}/api/v1/inbox/${encodeURIComponent(id)}/delete`,
    token,
    {},
  );
  if (payload == null) return null;
  const row = payload as { id?: string; filePath?: string[] | null; file_path?: string[] | null };
  if (typeof row.id !== "string") {
    throw new Error("replacement inbox delete: invalid payload");
  }
  return {
    id: row.id,
    filePath: row.filePath ?? row.file_path ?? null,
  };
}

export async function fetchReplacementInboxDeleteMany(
  baseUrl: string,
  token: string,
  ids: string[],
): Promise<Array<{ id: string; filePath: string[] | null }>> {
  const root = trimBase(baseUrl);
  const payload = await replacementPost<unknown>(
    `${root}/api/v1/inbox/delete-many`,
    token,
    ids,
  );
  if (!Array.isArray(payload)) {
    throw new Error("replacement inbox delete-many: expected array");
  }
  return payload.map((item) => {
    const row = item as {
      id?: string;
      filePath?: string[] | null;
      file_path?: string[] | null;
    };
    if (typeof row.id !== "string") {
      throw new Error("replacement inbox delete-many: invalid row");
    }
    return { id: row.id, filePath: row.filePath ?? row.file_path ?? null };
  });
}

export async function fetchReplacementTeamMembers(
  baseUrl: string,
  token: string,
): Promise<unknown[]> {
  const root = trimBase(baseUrl);
  return replacementFetch<unknown[]>(`${root}/api/v1/team/members`, token);
}

export async function fetchReplacementTeamList(
  baseUrl: string,
  token: string,
): Promise<unknown[]> {
  const root = trimBase(baseUrl);
  return replacementFetch<unknown[]>(`${root}/api/v1/team/list`, token);
}

export async function fetchReplacementTeamInvites(
  baseUrl: string,
  token: string,
): Promise<unknown[]> {
  const root = trimBase(baseUrl);
  return replacementFetch<unknown[]>(`${root}/api/v1/team/invites`, token);
}

export async function fetchReplacementInvoicePublicById(
  baseUrl: string,
  id: string,
): Promise<unknown | null> {
  const root = trimBase(baseUrl);
  const url = `${root}/api/v1/invoices/public/${encodeURIComponent(id)}`;
  try {
    const payload = await replacementFetchPublic<unknown>(url);
    return mapReplacementToInvoiceById(payload);
  } catch (error) {
    if (
      error instanceof ReplacementPublicFetchError &&
      error.status === 404
    ) {
      return null;
    }
    throw error;
  }
}

export async function fetchReplacementTeamUpdate(
  baseUrl: string,
  token: string,
  input: Record<string, unknown>,
): Promise<MiddayTeamUpdateShape | null> {
  const root = trimBase(baseUrl);
  const payload = await replacementPut<unknown>(
    `${root}/api/v1/team`,
    token,
    buildReplacementTeamUpdateBody(input),
  );
  if (payload == null) {
    return null;
  }
  return mapReplacementToTeamUpdate(payload);
}

export async function fetchReplacementTagCreate(
  baseUrl: string,
  token: string,
  name: string,
): Promise<MiddayTagMutationShape> {
  const root = trimBase(baseUrl);
  const payload = await replacementPost<unknown>(
    `${root}/api/v1/tags`,
    token,
    { name },
  );
  return mapReplacementToTagMutation(payload);
}

export async function fetchReplacementTagUpdate(
  baseUrl: string,
  token: string,
  id: string,
  name: string,
): Promise<MiddayTagMutationShape | null> {
  const root = trimBase(baseUrl);
  const payload = await replacementPut<unknown>(
    `${root}/api/v1/tags/${encodeURIComponent(id)}`,
    token,
    { name },
  );
  if (payload == null) {
    return null;
  }
  return mapReplacementToTagMutation(payload);
}

export async function fetchReplacementTagDelete(
  baseUrl: string,
  token: string,
  id: string,
): Promise<MiddayTagMutationShape | null> {
  const root = trimBase(baseUrl);
  const payload = await replacementDelete<unknown>(
    `${root}/api/v1/tags/${encodeURIComponent(id)}`,
    token,
  );
  if (payload == null) {
    return null;
  }
  return mapReplacementToTagMutation(payload);
}

export async function fetchReplacementDocumentTagCreate(
  baseUrl: string,
  token: string,
  name: string,
  slug: string,
): Promise<MiddayDocumentTagMutationShape> {
  const root = trimBase(baseUrl);
  const payload = await replacementPost<unknown>(
    `${root}/api/v1/document-tags`,
    token,
    { name, slug },
  );
  return mapReplacementToDocumentTagCreate(payload);
}

export async function fetchReplacementDocumentTagDelete(
  baseUrl: string,
  token: string,
  id: string,
): Promise<MiddayDocumentTagDeleteShape | null> {
  const root = trimBase(baseUrl);
  const payload = await replacementDelete<unknown>(
    `${root}/api/v1/document-tags/${encodeURIComponent(id)}`,
    token,
  );
  if (payload == null) {
    return null;
  }
  return mapReplacementToDocumentTagDelete(payload);
}

export async function fetchReplacementDocumentTagAssignmentCreate(
  baseUrl: string,
  token: string,
  documentId: string,
  tagId: string,
): Promise<MiddayDocumentTagAssignmentShape> {
  const root = trimBase(baseUrl);
  const payload = await replacementPost<unknown>(
    `${root}/api/v1/document-tag-assignments`,
    token,
    { documentId, tagId },
  );
  return mapReplacementToDocumentTagAssignment(payload);
}

export async function fetchReplacementDocumentTagAssignmentDelete(
  baseUrl: string,
  token: string,
  documentId: string,
  tagId: string,
): Promise<MiddayDocumentTagAssignmentShape | null> {
  const root = trimBase(baseUrl);
  const payload = await replacementDeleteWithBody<unknown>(
    `${root}/api/v1/document-tag-assignments`,
    token,
    { documentId, tagId },
  );
  if (payload == null) {
    return null;
  }
  return mapReplacementToDocumentTagAssignment(payload);
}

export async function fetchReplacementTransactionTagCreate(
  baseUrl: string,
  token: string,
  transactionId: string,
  tagId: string,
): Promise<MiddayTransactionTagCreateShape> {
  const root = trimBase(baseUrl);
  const payload = await replacementPost<unknown>(
    `${root}/api/v1/transaction-tags`,
    token,
    { transactionId, tagId },
  );
  return mapReplacementToTransactionTagCreate(payload);
}

export async function fetchReplacementTransactionTagDelete(
  baseUrl: string,
  token: string,
  transactionId: string,
  tagId: string,
): Promise<Record<string, unknown>> {
  const root = trimBase(baseUrl);
  const payload = await replacementDeleteWithBody<unknown>(
    `${root}/api/v1/transaction-tags`,
    token,
    { transactionId, tagId },
  );
  return mapReplacementToTransactionTagDelete(payload ?? {});
}

export async function fetchReplacementCustomerDelete(
  baseUrl: string,
  token: string,
  id: string,
): Promise<unknown | null> {
  const root = trimBase(baseUrl);
  const payload = await replacementDelete<unknown>(
    `${root}/api/v1/customers/${encodeURIComponent(id)}`,
    token,
  );
  if (payload == null) {
    return null;
  }
  return mapReplacementToCustomerById(payload);
}

export type ReplacementCustomerUpsertInput = {
  id?: string;
  name: string;
  email: string;
  billingEmail?: string | null;
  country?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  note?: string | null;
  website?: string | null;
  phone?: string | null;
  contact?: string | null;
  vatNumber?: string | null;
  countryCode?: string | null;
  tags?: { id: string; name?: string }[] | null;
};

export async function fetchReplacementCustomerUpsert(
  baseUrl: string,
  token: string,
  input: ReplacementCustomerUpsertInput,
): Promise<unknown> {
  const root = trimBase(baseUrl);
  const payload = await replacementPost<unknown>(
    `${root}/api/v1/customers`,
    token,
    input,
  );
  return mapReplacementToCustomerById(payload);
}

export async function fetchReplacementNotificationSettingUpsert(
  baseUrl: string,
  token: string,
  input: {
    notificationType: string;
    channel: string;
    enabled: boolean;
  },
): Promise<unknown> {
  const root = trimBase(baseUrl);
  const payload = await replacementPut<unknown>(
    `${root}/api/v1/notification-settings`,
    token,
    input,
  );
  if (payload == null) {
    throw new Error("notification-settings upsert returned empty");
  }
  return payload;
}

export async function fetchReplacementNotificationSettingsBulkUpdate(
  baseUrl: string,
  token: string,
  updates: {
    notificationType: string;
    channel: string;
    enabled: boolean;
  }[],
): Promise<unknown[]> {
  const root = trimBase(baseUrl);
  const payload = await replacementPut<unknown>(
    `${root}/api/v1/notification-settings/bulk`,
    token,
    { updates },
  );
  if (!Array.isArray(payload)) {
    throw new Error("notification-settings bulk payload must be an array");
  }
  return payload;
}

export async function fetchReplacementCategoryById(
  baseUrl: string,
  token: string,
  id: string,
): Promise<unknown | null> {
  const root = trimBase(baseUrl);
  const res = await fetch(
    `${root}/api/v1/categories/${encodeURIComponent(id)}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
    },
  );
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error(
      `replacement API ${root}/api/v1/categories/${id} HTTP ${res.status}`,
    );
  }
  return mapReplacementToCategoryById(await res.json());
}


export async function fetchReplacementSearchInvoiceNumber(
  baseUrl: string,
  token: string,
  query: string,
): Promise<{ invoiceNumber: string } | null> {
  const root = trimBase(baseUrl);
  const url = new URL(`${root}/api/v1/invoices/search-number`);
  url.searchParams.set("q", query);
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
  });
  if (!res.ok) {
    throw new Error(`replacement API ${url} HTTP ${res.status}`);
  }
  const payload = (await res.json()) as { invoiceNumber?: string } | null;
  if (payload == null || typeof payload.invoiceNumber !== "string") {
    return null;
  }
  return { invoiceNumber: payload.invoiceNumber };
}

export async function fetchReplacementNotificationSettings(
  baseUrl: string,
  token: string,
  input: { notificationType?: string; channel?: string } = {},
): Promise<unknown[]> {
  const root = trimBase(baseUrl);
  const url = new URL(`${root}/api/v1/notification-settings`);
  if (input.notificationType) {
    url.searchParams.set("notificationType", input.notificationType);
  }
  if (input.channel) {
    url.searchParams.set("channel", input.channel);
  }
  const payload = await replacementFetch<unknown>(url.toString(), token);
  if (!Array.isArray(payload)) {
    throw new Error("notification-settings payload must be an array");
  }
  return payload;
}

export async function fetchReplacementDocumentCheckAttachments(
  baseUrl: string,
  token: string,
  id: string,
): Promise<unknown> {
  const root = trimBase(baseUrl);
  return replacementFetch<unknown>(
    `${root}/api/v1/documents/${encodeURIComponent(id)}/check-attachments`,
    token,
  );
}


export async function fetchReplacementDocumentDelete(
  baseUrl: string,
  token: string,
  id: string,
): Promise<{ id: string; pathTokens: string[] | null } | null> {
  const root = trimBase(baseUrl);
  const payload = await replacementDelete<unknown>(
    `${root}/api/v1/documents/${encodeURIComponent(id)}`,
    token,
  );
  if (payload == null) {
    return null;
  }
  const row = payload as { id?: string; pathTokens?: string[] | null };
  if (typeof row.id !== "string") {
    throw new Error("document delete payload missing id");
  }
  return { id: row.id, pathTokens: row.pathTokens ?? null };
}

export async function fetchReplacementApiKeys(
  baseUrl: string,
  token: string,
): Promise<unknown[]> {
  const root = trimBase(baseUrl);
  const payload = await replacementFetch<unknown>(`${root}/api/v1/api-keys`, token);
  if (!Array.isArray(payload)) {
    throw new Error("api-keys payload must be an array");
  }
  return payload;
}

export async function fetchReplacementTeamConnectionStatus(
  baseUrl: string,
  token: string,
): Promise<unknown> {
  const root = trimBase(baseUrl);
  return replacementFetch<unknown>(`${root}/api/v1/team/connection-status`, token);
}

export { shouldDelegateToReplacementBackend };

/** When false (dual), callers may fall back to legacy on delegation errors. */
export function replacementDelegationRequiresSuccess(): boolean {
  return getBackendMode() === "replacement";
}

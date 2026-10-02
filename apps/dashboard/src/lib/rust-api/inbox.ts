import type { components } from "./openapi.generated";
import { RustApiError } from "./overview";

type RawInboxListResponse = components["schemas"]["InboxListResponse"];
type RawInboxListItem = components["schemas"]["InboxListItem"];
type RawInboxDetailItem = components["schemas"]["InboxDetailItem"];
type RawInboxSearchItem = components["schemas"]["InboxSearchItem"];
type RawInboxByStatusItem = components["schemas"]["InboxByStatusItem"];
type RawInboxCheckAttachments =
  components["schemas"]["InboxCheckAttachmentsResponse"];
type RawInboxAccount = components["schemas"]["InboxAccountNested"];
type RawInboxTransaction = components["schemas"]["InboxTransactionNested"];
type RawInboxSuggestion = components["schemas"]["InboxSuggestionNested"];
type RawInboxRelatedItem = components["schemas"]["InboxRelatedItem"];

export type InboxListParams = {
  cursor?: string | null;
  pageSize?: number;
  q?: string | null;
  order?: string | null;
  sort?: string | null;
  status?: string | null;
  tab?: string | null;
};

export type InboxSearchParams = {
  q?: string | null;
  transactionId?: string | null;
  limit?: number;
};

export type InboxByStatusParams = {
  status?: string | null;
};

export type InboxListItem = {
  id: string;
  fileName: string | null;
  filePath: string[] | null;
  displayName: string | null;
  transactionId: string | null;
  amount: number | null;
  currency: string | null;
  contentType: string | null;
  date: string | null;
  status: string;
  type: string | null;
  createdAt: string;
  website: string | null;
  senderEmail: string | null;
  description: string | null;
  inboxAccountId: string | null;
  taxAmount: number | null;
  taxRate: number | null;
  taxType: string | null;
  relatedCount: number;
  inboxAccount: {
    id: string;
    email: string | null;
    provider: string | null;
  } | null;
  transaction: {
    id: string;
    amount: number | null;
    currency: string | null;
    name: string | null;
    date: string | null;
  } | null;
};

export type InboxList = {
  meta: {
    cursor?: string;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
  data: InboxListItem[];
};

export type InboxDetail = InboxListItem & {
  groupedInboxId: string | null;
  meta: unknown;
  suggestion: {
    id: string | null;
    transactionId: string | null;
    confidenceScore: number | null;
    matchType: string | null;
    status: string | null;
    suggestedTransaction?: {
      id: string;
      name: string | null;
      amount: number | null;
      currency: string | null;
      date: string | null;
    };
  } | null;
  relatedItems?: InboxListItem[];
};

export type InboxSearchItem = {
  id: string;
  createdAt: string;
  fileName: string | null;
  amount: number | null;
  currency: string | null;
  filePath: string[] | null;
  contentType: string | null;
  date: string | null;
  displayName: string | null;
  size: number | null;
  description: string | null;
  status: string;
  website: string | null;
  baseAmount: number | null;
  baseCurrency: string | null;
  taxAmount: number | null;
  taxRate: number | null;
  taxType: string | null;
  type: string | null;
};

export type InboxByStatusItem = {
  id: string;
  displayName: string | null;
  amount: number | null;
  currency: string | null;
  date: string | null;
  status: string;
  createdAt: string;
  transactionId: string | null;
};

export type InboxCheckAttachments = {
  hasAttachments: boolean;
  attachments: Array<{
    id: string;
    transactionId: string | null;
    name: string | null;
  }>;
  fileName?: string | null;
};

export function buildInboxListQuery(params: InboxListParams): string {
  const search = new URLSearchParams();

  if (params.cursor) search.set("cursor", params.cursor);
  if (params.pageSize != null) search.set("pageSize", String(params.pageSize));
  if (params.order) search.set("order", params.order);
  if (params.sort) search.set("sort", params.sort);
  if (params.q) search.set("q", params.q);
  if (params.status) search.set("status", params.status);
  if (params.tab) search.set("tab", params.tab);

  const query = search.toString();
  return query ? `?${query}` : "";
}

export function buildInboxSearchQuery(params: InboxSearchParams): string {
  const search = new URLSearchParams();

  if (params.q) search.set("q", params.q);
  if (params.transactionId) {
    search.set("transactionId", params.transactionId);
  }
  if (params.limit != null) search.set("limit", String(params.limit));

  const query = search.toString();
  return query ? `?${query}` : "";
}

export function buildInboxByStatusQuery(params: InboxByStatusParams): string {
  const search = new URLSearchParams();
  if (params.status) search.set("status", params.status);
  const query = search.toString();
  return query ? `?${query}` : "";
}

function normalizeInboxAccount(
  account: RawInboxAccount | null | undefined,
): InboxListItem["inboxAccount"] {
  if (!account?.id) return null;
  return {
    id: account.id,
    email: account.email ?? null,
    provider: account.provider ?? null,
  };
}

function normalizeInboxTransaction(
  tx: RawInboxTransaction | null | undefined,
): InboxListItem["transaction"] {
  if (!tx?.id) return null;
  return {
    id: tx.id,
    amount: tx.amount ?? null,
    currency: tx.currency ?? null,
    name: tx.name ?? null,
    date: tx.date ?? null,
  };
}

export function normalizeInboxListItem(row: RawInboxListItem): InboxListItem {
  return {
    id: row.id,
    fileName: row.file_name ?? null,
    filePath: row.file_path ?? null,
    displayName: row.display_name ?? null,
    transactionId: row.transaction_id ?? null,
    amount: row.amount ?? null,
    currency: row.currency ?? null,
    contentType: row.content_type ?? null,
    date: row.date ?? null,
    status: row.status,
    type: row.type ?? null,
    createdAt: row.created_at,
    website: row.website ?? null,
    senderEmail: row.sender_email ?? null,
    description: row.description ?? null,
    inboxAccountId: row.inbox_account_id ?? null,
    taxAmount: row.tax_amount ?? null,
    taxRate: row.tax_rate ?? null,
    taxType: row.tax_type ?? null,
    relatedCount: row.related_count,
    inboxAccount: normalizeInboxAccount(row.inbox_account),
    transaction: normalizeInboxTransaction(row.transaction),
  };
}

function normalizeRelatedItem(row: RawInboxRelatedItem): InboxListItem {
  return normalizeInboxListItem({
    ...row,
    related_count: 0,
    inbox_account: null,
    transaction: null,
  });
}

function normalizeSuggestion(
  suggestion: RawInboxSuggestion | null | undefined,
): InboxDetail["suggestion"] {
  if (!suggestion) return null;

  const base = {
    id: suggestion.id ?? null,
    transactionId: suggestion.transaction_id ?? null,
    confidenceScore: suggestion.confidence_score ?? null,
    matchType: suggestion.match_type ?? null,
    status: suggestion.status ?? null,
  };

  if (!suggestion.suggested_transaction) {
    return base;
  }

  return {
    ...base,
    suggestedTransaction: {
      id: suggestion.suggested_transaction.id,
      name: suggestion.suggested_transaction.name ?? null,
      amount: suggestion.suggested_transaction.amount ?? null,
      currency: suggestion.suggested_transaction.currency ?? null,
      date: suggestion.suggested_transaction.date ?? null,
    },
  };
}

export function normalizeInboxList(payload: RawInboxListResponse): InboxList {
  return {
    meta: {
      cursor: payload.meta.cursor ?? undefined,
      hasPreviousPage: payload.meta.has_previous_page,
      hasNextPage: payload.meta.has_next_page,
    },
    data: payload.data.map(normalizeInboxListItem),
  };
}

export function normalizeInboxDetail(payload: RawInboxDetailItem): InboxDetail {
  const {
    grouped_inbox_id,
    meta,
    suggestion,
    related_items,
    ...itemFields
  } = payload;

  const relatedItems = related_items?.map(normalizeRelatedItem);

  return {
    ...normalizeInboxListItem(itemFields),
    groupedInboxId: grouped_inbox_id ?? null,
    meta: meta ?? null,
    suggestion: normalizeSuggestion(suggestion),
    ...(relatedItems && relatedItems.length > 0 ? { relatedItems } : {}),
  };
}

export function normalizeInboxSearchItem(
  row: RawInboxSearchItem,
): InboxSearchItem {
  return {
    id: row.id,
    createdAt: row.created_at,
    fileName: row.file_name ?? null,
    amount: row.amount ?? null,
    currency: row.currency ?? null,
    filePath: row.file_path ?? null,
    contentType: row.content_type ?? null,
    date: row.date ?? null,
    displayName: row.display_name ?? null,
    size: row.size ?? null,
    description: row.description ?? null,
    status: row.status,
    website: row.website ?? null,
    baseAmount: row.base_amount ?? null,
    baseCurrency: row.base_currency ?? null,
    taxAmount: row.tax_amount ?? null,
    taxRate: row.tax_rate ?? null,
    taxType: row.tax_type ?? null,
    type: row.type ?? null,
  };
}

export function normalizeInboxByStatusItem(
  row: RawInboxByStatusItem,
): InboxByStatusItem {
  return {
    id: row.id,
    displayName: row.display_name ?? null,
    amount: row.amount ?? null,
    currency: row.currency ?? null,
    date: row.date ?? null,
    status: row.status,
    createdAt: row.created_at,
    transactionId: row.transaction_id ?? null,
  };
}

export function normalizeInboxCheckAttachments(
  payload: RawInboxCheckAttachments,
): InboxCheckAttachments {
  return {
    hasAttachments: payload.has_attachments,
    attachments: payload.attachments.map((a) => ({
      id: a.id,
      transactionId: a.transaction_id ?? null,
      name: a.name ?? null,
    })),
    ...(payload.file_name != null ? { fileName: payload.file_name } : {}),
  };
}

export async function fetchInboxList(
  baseUrl: string,
  accessToken: string | null,
  params: InboxListParams = {},
): Promise<InboxList> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(
    `${baseUrl}/api/v1/inbox${buildInboxListQuery(params)}`,
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

  return normalizeInboxList((await response.json()) as RawInboxListResponse);
}

export async function fetchInboxById(
  baseUrl: string,
  accessToken: string | null,
  id: string,
): Promise<InboxDetail> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(
    `${baseUrl}/api/v1/inbox/${encodeURIComponent(id)}`,
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

  return normalizeInboxDetail((await response.json()) as RawInboxDetailItem);
}

export async function fetchInboxSearch(
  baseUrl: string,
  accessToken: string | null,
  params: InboxSearchParams = {},
): Promise<InboxSearchItem[]> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(
    `${baseUrl}/api/v1/inbox/search${buildInboxSearchQuery(params)}`,
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

  const payload = (await response.json()) as RawInboxSearchItem[];
  return payload.map(normalizeInboxSearchItem);
}

export async function fetchInboxByStatus(
  baseUrl: string,
  accessToken: string | null,
  params: InboxByStatusParams = {},
): Promise<InboxByStatusItem[]> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(
    `${baseUrl}/api/v1/inbox/by-status${buildInboxByStatusQuery(params)}`,
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

  const payload = (await response.json()) as RawInboxByStatusItem[];
  return payload.map(normalizeInboxByStatusItem);
}

export async function fetchInboxCheckAttachments(
  baseUrl: string,
  accessToken: string | null,
  id: string,
): Promise<InboxCheckAttachments> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(
    `${baseUrl}/api/v1/inbox/${encodeURIComponent(id)}/check-attachments`,
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

  return normalizeInboxCheckAttachments(
    (await response.json()) as RawInboxCheckAttachments,
  );
}

export type UpdateInboxInput = {
  id: string;
  status?: string | null;
  displayName?: string | null;
  currency?: string | null;
  amount?: number | null;
};

export type MatchInboxInput = {
  id: string;
  transactionId: string;
};

export type ConfirmInboxMatchInput = {
  suggestionId: string;
  inboxId: string;
  transactionId: string;
};

export type DeclineInboxMatchInput = {
  suggestionId: string;
  inboxId: string;
};

export type UnmatchInboxInput = {
  id: string;
};

export type InboxBlocklistEntry = {
  id: string;
  teamId: string | null;
  type: string;
  value: string;
  createdAt: string | null;
};

export type CreateInboxBlocklistInput = {
  type: "email" | "domain" | string;
  value: string;
};

function omitUndefined(
  input: Record<string, unknown>,
  skipKeys: string[] = [],
): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (skipKeys.includes(key) || value === undefined) continue;
    body[key] = value;
  }
  return body;
}

export function normalizeInboxBlocklistEntry(
  row: Record<string, unknown>,
): InboxBlocklistEntry {
  return {
    id: String(row.id),
    teamId:
      typeof row.teamId === "string"
        ? row.teamId
        : typeof row.team_id === "string"
          ? row.team_id
          : null,
    type: String(row.type ?? ""),
    value: String(row.value ?? ""),
    createdAt:
      typeof row.createdAt === "string"
        ? row.createdAt
        : typeof row.created_at === "string"
          ? row.created_at
          : null,
  };
}

export async function updateInbox(
  baseUrl: string,
  accessToken: string | null,
  input: UpdateInboxInput,
): Promise<InboxDetail> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const { id, ...fields } = input;
  const response = await fetch(
    `${baseUrl}/api/v1/inbox/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(omitUndefined(fields as Record<string, unknown>)),
      signal: AbortSignal.timeout(8_000),
    },
  );

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return normalizeInboxDetail((await response.json()) as RawInboxDetailItem);
}

export async function matchInbox(
  baseUrl: string,
  accessToken: string | null,
  input: MatchInboxInput,
): Promise<InboxDetail> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(
    `${baseUrl}/api/v1/inbox/${encodeURIComponent(input.id)}/match`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ transactionId: input.transactionId }),
      signal: AbortSignal.timeout(15_000),
    },
  );

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return normalizeInboxDetail((await response.json()) as RawInboxDetailItem);
}

export async function confirmInboxMatch(
  baseUrl: string,
  accessToken: string | null,
  input: ConfirmInboxMatchInput,
): Promise<InboxDetail> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(`${baseUrl}/api/v1/inbox/confirm-match`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      suggestionId: input.suggestionId,
      inboxId: input.inboxId,
      transactionId: input.transactionId,
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return normalizeInboxDetail((await response.json()) as RawInboxDetailItem);
}

export async function declineInboxMatch(
  baseUrl: string,
  accessToken: string | null,
  input: DeclineInboxMatchInput,
): Promise<{ ok: true }> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(`${baseUrl}/api/v1/inbox/decline-match`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      suggestionId: input.suggestionId,
      inboxId: input.inboxId,
    }),
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return { ok: true };
}

export async function unmatchInbox(
  baseUrl: string,
  accessToken: string | null,
  input: UnmatchInboxInput,
): Promise<unknown> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(
    `${baseUrl}/api/v1/inbox/${encodeURIComponent(input.id)}/unmatch`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
      signal: AbortSignal.timeout(15_000),
    },
  );

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return response.json();
}

export async function fetchInboxBlocklist(
  baseUrl: string,
  accessToken: string | null,
): Promise<InboxBlocklistEntry[]> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(`${baseUrl}/api/v1/inbox/blocklist`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  const payload = (await response.json()) as Record<string, unknown>[];
  return payload.map(normalizeInboxBlocklistEntry);
}

export async function createInboxBlocklist(
  baseUrl: string,
  accessToken: string | null,
  input: CreateInboxBlocklistInput,
): Promise<InboxBlocklistEntry> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(`${baseUrl}/api/v1/inbox/blocklist`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ type: input.type, value: input.value }),
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return normalizeInboxBlocklistEntry(
    (await response.json()) as Record<string, unknown>,
  );
}

export async function deleteInboxBlocklist(
  baseUrl: string,
  accessToken: string | null,
  id: string,
): Promise<{ id: string } | null> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(
    `${baseUrl}/api/v1/inbox/blocklist/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
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

  const payload = await response.json();
  if (payload == null) return null;
  if (typeof payload === "object" && payload !== null && "id" in payload) {
    return { id: String((payload as { id: unknown }).id) };
  }
  return null;
}

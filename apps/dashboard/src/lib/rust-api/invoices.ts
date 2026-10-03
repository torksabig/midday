import type { RouterOutputs } from "@api/trpc/routers/_app";
import { fetchInvoiceDefaultSettings } from "./invoice-default-settings";
import type { components } from "./openapi.generated";
import { RustApiError } from "./overview";

type RawInvoicesListResponse = components["schemas"]["InvoicesListResponse"];
type RawPaymentStatusResponse = components["schemas"]["PaymentStatusResponse"];
type RawInvoiceSummaryResponse = components["schemas"]["InvoiceSummaryResponse"];

export type InvoicesListParams = {
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

export type InvoiceSummaryParams = {
  statuses?: string[] | null;
};

// get/getById RouterOutputs collapse via façade `unknown` returns; keep UI-usable shape.
export type Invoice = {
  id: string;
  [key: string]: any;
};

export type InvoiceListItem = {
  id: string;
  [key: string]: any;
};

export type InvoicesList = {
  meta: {
    cursor?: string;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
  data: InvoiceListItem[];
};

export type InvoicePaymentStatus = RouterOutputs["invoice"]["paymentStatus"];
export type InvoiceSummary = RouterOutputs["invoice"]["invoiceSummary"];
export type MostActiveClient = RouterOutputs["invoice"]["mostActiveClient"];
export type TopRevenueClient = RouterOutputs["invoice"]["topRevenueClient"];
export type SearchInvoiceNumberHit =
  RouterOutputs["invoice"]["searchInvoiceNumber"];
export type AverageInvoiceSize =
  RouterOutputs["invoice"]["averageInvoiceSize"];

type RawMostActiveClientResponse =
  components["schemas"]["MostActiveClientResponse"];
type RawTopRevenueClientResponse =
  components["schemas"]["TopRevenueClientResponse"];
type RawSearchInvoiceNumberHit =
  components["schemas"]["SearchInvoiceNumberHit"];
type RawAverageInvoiceSizeRow =
  components["schemas"]["AverageInvoiceSizeRow"];

export function normalizeMostActiveClient(
  payload: RawMostActiveClientResponse | null,
): MostActiveClient {
  if (payload == null) return null;
  return deepCamelCaseKeys(payload) as MostActiveClient;
}

export function normalizeTopRevenueClient(
  payload: RawTopRevenueClientResponse | null,
): TopRevenueClient {
  if (payload == null) return null;
  return deepCamelCaseKeys(payload) as TopRevenueClient;
}

export async function fetchInvoiceMostActiveClient(
  baseUrl: string,
  accessToken: string | null,
): Promise<MostActiveClient> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(
    `${baseUrl}/api/v1/invoices/metrics/most-active-client`,
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

  return normalizeMostActiveClient(
    (await response.json()) as RawMostActiveClientResponse | null,
  );
}

export async function fetchInvoiceInactiveClientsCount(
  baseUrl: string,
  accessToken: string | null,
): Promise<number> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(
    `${baseUrl}/api/v1/invoices/metrics/inactive-clients-count`,
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

  return Number(await response.json());
}

export async function fetchInvoiceTopRevenueClient(
  baseUrl: string,
  accessToken: string | null,
): Promise<TopRevenueClient> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(
    `${baseUrl}/api/v1/invoices/metrics/top-revenue-client`,
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

  return normalizeTopRevenueClient(
    (await response.json()) as RawTopRevenueClientResponse | null,
  );
}

export async function fetchInvoiceNewCustomersCount(
  baseUrl: string,
  accessToken: string | null,
): Promise<number> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(
    `${baseUrl}/api/v1/invoices/metrics/new-customers-count`,
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

  return Number(await response.json());
}

export function normalizeSearchInvoiceNumberHit(
  payload: RawSearchInvoiceNumberHit | null,
): SearchInvoiceNumberHit {
  if (payload == null) return null;
  return { invoiceNumber: payload.invoiceNumber };
}

export function normalizeAverageInvoiceSize(
  payload: RawAverageInvoiceSizeRow[],
): AverageInvoiceSize {
  return (payload ?? []).map((row) => ({
    currency: row.currency,
    averageAmount: row.average_amount,
    invoiceCount: row.invoice_count,
  })) as AverageInvoiceSize;
}

export async function fetchSearchInvoiceNumber(
  baseUrl: string,
  accessToken: string | null,
  query: string,
): Promise<SearchInvoiceNumberHit> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const url = new URL(`${baseUrl}/api/v1/invoices/search-number`);
  url.searchParams.set("q", query);

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return normalizeSearchInvoiceNumberHit(
    (await response.json()) as RawSearchInvoiceNumberHit | null,
  );
}

export async function fetchInvoiceAverageDaysToPayment(
  baseUrl: string,
  accessToken: string | null,
): Promise<number> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(
    `${baseUrl}/api/v1/invoices/metrics/average-days-to-payment`,
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

  return Number(await response.json());
}

export async function fetchInvoiceAverageInvoiceSize(
  baseUrl: string,
  accessToken: string | null,
): Promise<AverageInvoiceSize> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(
    `${baseUrl}/api/v1/invoices/metrics/average-invoice-size`,
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

  return normalizeAverageInvoiceSize(
    (await response.json()) as RawAverageInvoiceSizeRow[],
  );
}

function snakeToCamelKey(key: string): string {
  return key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
}

export function deepCamelCaseKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(deepCamelCaseKeys);
  }
  if (value && typeof value === "object" && !(value instanceof Date)) {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nested]) => [
        snakeToCamelKey(key),
        deepCamelCaseKeys(nested),
      ]),
    );
  }
  return value;
}

export function buildInvoicesListQuery(params: InvoicesListParams): string {
  const search = new URLSearchParams();

  if (params.cursor) search.set("cursor", params.cursor);
  if (params.pageSize != null) search.set("pageSize", String(params.pageSize));
  if (params.q) search.set("q", params.q);
  if (params.start) search.set("start", params.start);
  if (params.end) search.set("end", params.end);
  if (params.recurring != null) search.set("recurring", String(params.recurring));
  for (const v of params.statuses ?? []) {
    if (v) search.append("statuses", v);
  }
  for (const v of params.customers ?? []) {
    if (v) search.append("customers", v);
  }
  for (const v of params.sort ?? []) {
    if (v) search.append("sort", v);
  }
  for (const v of params.ids ?? []) {
    if (v) search.append("ids", v);
  }
  for (const v of params.recurringIds ?? []) {
    if (v) search.append("recurringIds", v);
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}

export function buildInvoiceSummaryQuery(params: InvoiceSummaryParams): string {
  const search = new URLSearchParams();
  for (const v of params.statuses ?? []) {
    if (v) search.append("statuses", v);
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

export function normalizeInvoicesList(
  payload: RawInvoicesListResponse,
): InvoicesList {
  return {
    meta: {
      cursor: payload.meta.cursor ?? undefined,
      hasPreviousPage: payload.meta.has_previous_page,
      hasNextPage: payload.meta.has_next_page,
    },
    data: (payload.data ?? []).map(
      (row) => deepCamelCaseKeys(row) as InvoiceListItem,
    ),
  };
}

export function normalizeInvoiceDetail(payload: unknown): Invoice {
  return deepCamelCaseKeys(payload) as Invoice;
}

export function normalizeInvoicePaymentStatus(
  payload: RawPaymentStatusResponse,
): InvoicePaymentStatus {
  return {
    score: payload.score,
    paymentStatus: payload.payment_status,
  } as InvoicePaymentStatus;
}

export function normalizeInvoiceSummary(
  payload: RawInvoiceSummaryResponse,
): InvoiceSummary {
  return {
    totalAmount: payload.total_amount,
    invoiceCount: payload.invoice_count,
    currency: payload.currency,
    ...(payload.breakdown
      ? {
          breakdown: payload.breakdown.map((row) => ({
            currency: row.currency,
            originalAmount: row.original_amount,
            convertedAmount: row.converted_amount,
            count: row.count,
          })),
        }
      : {}),
  } as InvoiceSummary;
}

export async function fetchInvoicesList(
  baseUrl: string,
  accessToken: string | null,
  params: InvoicesListParams = {},
): Promise<InvoicesList> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(
    `${baseUrl}/api/v1/invoices${buildInvoicesListQuery(params)}`,
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

  return normalizeInvoicesList(
    (await response.json()) as RawInvoicesListResponse,
  );
}

export async function fetchInvoiceById(
  baseUrl: string,
  accessToken: string | null,
  id: string,
): Promise<Invoice | null> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(
    `${baseUrl}/api/v1/invoices/${encodeURIComponent(id)}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(8_000),
    },
  );

  if (response.status === 404) return null;

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return normalizeInvoiceDetail(await response.json());
}

/** Public — no auth. Midday `invoice.getInvoiceByToken` (JWT verified on Rust). */
export async function fetchInvoiceByToken(
  baseUrl: string,
  token: string,
): Promise<Invoice | null> {
  const response = await fetch(
    `${baseUrl}/api/v1/invoices/by-token/${encodeURIComponent(token)}`,
    { signal: AbortSignal.timeout(8_000) },
  );

  if (response.status === 404) return null;

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return normalizeInvoiceDetail(await response.json());
}

export async function fetchInvoicePaymentStatus(
  baseUrl: string,
  accessToken: string | null,
): Promise<InvoicePaymentStatus> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(`${baseUrl}/api/v1/invoices/payment-status`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return normalizeInvoicePaymentStatus(
    (await response.json()) as RawPaymentStatusResponse,
  );
}

export async function fetchInvoiceSummary(
  baseUrl: string,
  accessToken: string | null,
  params: InvoiceSummaryParams = {},
): Promise<InvoiceSummary> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(
    `${baseUrl}/api/v1/invoices/summary${buildInvoiceSummaryQuery(params)}`,
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

  return normalizeInvoiceSummary(
    (await response.json()) as RawInvoiceSummaryResponse,
  );
}

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

export type DraftInvoiceInput = Record<string, unknown>;

export type UpdateInvoiceInput = {
  id: string;
  status?: string;
  paidAt?: string | null;
  internalNote?: string | null;
  scheduledAt?: string | null;
  scheduledJobId?: string | null;
  reminderSentAt?: string | null;
};

export type DuplicateInvoiceInput = {
  id: string;
  invoiceNumber?: string;
};

export async function draftInvoice(
  baseUrl: string,
  accessToken: string | null,
  input: DraftInvoiceInput,
): Promise<Invoice> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(`${baseUrl}/api/v1/invoices/draft`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return normalizeInvoiceDetail(await response.json());
}

export async function updateInvoice(
  baseUrl: string,
  accessToken: string | null,
  input: UpdateInvoiceInput,
): Promise<Invoice> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const { id, ...fields } = input;
  const response = await fetch(
    `${baseUrl}/api/v1/invoices/${encodeURIComponent(id)}`,
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

  return normalizeInvoiceDetail(await response.json());
}

export async function deleteInvoice(
  baseUrl: string,
  accessToken: string | null,
  id: string,
): Promise<{ id: string }> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(
    `${baseUrl}/api/v1/invoices/${encodeURIComponent(id)}`,
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

  return deepCamelCaseKeys(await response.json()) as { id: string };
}

export async function duplicateInvoice(
  baseUrl: string,
  accessToken: string | null,
  input: DuplicateInvoiceInput,
): Promise<Invoice> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  let invoiceNumber = input.invoiceNumber;
  if (!invoiceNumber) {
    const settings = await fetchInvoiceDefaultSettings(baseUrl, accessToken);
    invoiceNumber = settings.invoiceNumber;
  }

  if (!invoiceNumber) {
    throw new RustApiError(400, "Missing next invoice number for duplicate");
  }

  const response = await fetch(`${baseUrl}/api/v1/invoices/duplicate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: input.id,
      invoiceNumber,
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return normalizeInvoiceDetail(await response.json());
}

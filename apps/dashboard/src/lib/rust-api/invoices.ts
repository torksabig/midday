import type { RouterOutputs } from "@api/trpc/routers/_app";
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

import type { RouterOutputs } from "@api/trpc/routers/_app";
import { RustApiError } from "./overview";

export type InvoiceRecurringDetail =
  RouterOutputs["invoiceRecurring"]["get"];
export type InvoiceRecurringUpcoming =
  RouterOutputs["invoiceRecurring"]["getUpcoming"];
export type InvoiceRecurringList =
  RouterOutputs["invoiceRecurring"]["list"];
export type InvoiceRecurringResume =
  RouterOutputs["invoiceRecurring"]["resume"];

export type ListInvoiceRecurringParams = {
  cursor?: string | null;
  pageSize?: number | null;
  status?: string | null;
  customerId?: string | null;
};

export type GetUpcomingParams = {
  id: string;
  limit?: number | null;
};

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

export function buildInvoiceRecurringListQuery(
  params: ListInvoiceRecurringParams,
): string {
  const search = new URLSearchParams();
  if (params.cursor) search.set("cursor", params.cursor);
  if (params.pageSize != null) search.set("pageSize", String(params.pageSize));
  if (params.status) search.set("status", params.status);
  if (params.customerId) search.set("customerId", params.customerId);
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchInvoiceRecurringList(
  baseUrl: string,
  accessToken: string | null,
  params: ListInvoiceRecurringParams = {},
): Promise<InvoiceRecurringList> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(
    `${baseUrl}/api/v1/invoice-recurring${buildInvoiceRecurringListQuery(params)}`,
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

  return deepCamelCaseKeys(await response.json()) as InvoiceRecurringList;
}

export async function fetchInvoiceRecurringById(
  baseUrl: string,
  accessToken: string | null,
  id: string,
): Promise<InvoiceRecurringDetail> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(
    `${baseUrl}/api/v1/invoice-recurring/${encodeURIComponent(id)}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(8_000),
    },
  );

  if (response.status === 404) return null as InvoiceRecurringDetail;

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return deepCamelCaseKeys(await response.json()) as InvoiceRecurringDetail;
}

export async function fetchInvoiceRecurringUpcoming(
  baseUrl: string,
  accessToken: string | null,
  params: GetUpcomingParams,
): Promise<InvoiceRecurringUpcoming> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const search = new URLSearchParams();
  if (params.limit != null) search.set("limit", String(params.limit));
  const qs = search.toString();

  const response = await fetch(
    `${baseUrl}/api/v1/invoice-recurring/${encodeURIComponent(params.id)}/upcoming${qs ? `?${qs}` : ""}`,
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

  return deepCamelCaseKeys(await response.json()) as InvoiceRecurringUpcoming;
}

export async function resumeInvoiceRecurring(
  baseUrl: string,
  accessToken: string | null,
  id: string,
): Promise<InvoiceRecurringResume> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(
    `${baseUrl}/api/v1/invoice-recurring/${encodeURIComponent(id)}/resume`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
      signal: AbortSignal.timeout(8_000),
    },
  );

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return deepCamelCaseKeys(await response.json()) as InvoiceRecurringResume;
}

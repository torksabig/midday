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

export type InvoiceRecurringMutationResult = {
  recurring: InvoiceRecurringDetail | null;
  jobIds: string[];
};

function parseInvoiceRecurringMutationPayload(
  payload: unknown,
): InvoiceRecurringMutationResult {
  const normalized = deepCamelCaseKeys(payload) as {
    recurring?: InvoiceRecurringDetail | null;
    jobIds?: string[];
  };
  return {
    recurring: normalized.recurring ?? null,
    jobIds: normalized.jobIds ?? [],
  };
}

export async function pauseInvoiceRecurring(
  baseUrl: string,
  accessToken: string | null,
  id: string,
): Promise<InvoiceRecurringMutationResult> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(
    `${baseUrl}/api/v1/invoice-recurring/${encodeURIComponent(id)}/pause`,
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

  return parseInvoiceRecurringMutationPayload(await response.json());
}

export async function deleteInvoiceRecurring(
  baseUrl: string,
  accessToken: string | null,
  id: string,
): Promise<InvoiceRecurringMutationResult> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(
    `${baseUrl}/api/v1/invoice-recurring/${encodeURIComponent(id)}`,
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

  return parseInvoiceRecurringMutationPayload(await response.json());
}

export async function createInvoiceRecurring(
  baseUrl: string,
  accessToken: string | null,
  input: Record<string, unknown>,
): Promise<InvoiceRecurringDetail> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(`${baseUrl}/api/v1/invoice-recurring`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return deepCamelCaseKeys(await response.json()) as InvoiceRecurringDetail;
}

export async function updateInvoiceRecurring(
  baseUrl: string,
  accessToken: string | null,
  id: string,
  input: Record<string, unknown>,
): Promise<InvoiceRecurringDetail> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(
    `${baseUrl}/api/v1/invoice-recurring/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(8_000),
    },
  );

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return deepCamelCaseKeys(await response.json()) as InvoiceRecurringDetail;
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

import type { components } from "./openapi.generated";
import { RustApiError } from "./overview";

type RawCustomersListResponse = components["schemas"]["CustomersListResponse"];

export type CustomersListParams = {
  cursor?: string | null;
  pageSize?: number;
  q?: string | null;
  sort?: string[] | null;
};

export type Customer = {
  id: string;
  name?: string | null;
  email?: string | null;
  [key: string]: unknown;
};

export type CustomersList = {
  meta: {
    cursor?: string;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
  data: Customer[];
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

export function buildCustomersListQuery(params: CustomersListParams): string {
  const search = new URLSearchParams();

  if (params.cursor) search.set("cursor", params.cursor);
  if (params.pageSize != null) search.set("pageSize", String(params.pageSize));
  if (params.q) search.set("q", params.q);
  for (const part of params.sort ?? []) {
    if (part) search.append("sort", part);
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}

export function normalizeCustomersList(
  payload: RawCustomersListResponse,
): CustomersList {
  return {
    meta: {
      cursor: payload.meta.cursor ?? undefined,
      hasPreviousPage: payload.meta.has_previous_page,
      hasNextPage: payload.meta.has_next_page,
    },
    data: (payload.data ?? []).map(
      (row) => deepCamelCaseKeys(row) as Customer,
    ),
  };
}

export function normalizeCustomerDetail(payload: unknown): Customer {
  return deepCamelCaseKeys(payload) as Customer;
}

export function normalizeCustomerInvoiceSummary(
  payload: unknown,
): Record<string, unknown> {
  // Rust already returns camelCase for this endpoint; still normalize defensively.
  return deepCamelCaseKeys(payload) as Record<string, unknown>;
}

export type PortalCustomerTeam = {
  id: string;
  name: string | null;
  logoUrl: string | null;
  baseCurrency: string | null;
};

export type PortalCustomer = {
  id: string;
  name: string;
  email?: string | null;
  website?: string | null;
  teamId: string;
  portalEnabled: boolean;
  portalId: string;
  team: PortalCustomerTeam;
};

export type PortalInvoiceSummary = {
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  invoiceCount: number;
  currency: string;
};

export type PortalCustomerById = {
  customer: PortalCustomer;
  summary: PortalInvoiceSummary;
} | null;

export type PortalInvoice = {
  id: string;
  invoiceNumber?: string | null;
  status?: string | null;
  amount?: number | null;
  currency?: string | null;
  dueDate?: string | null;
  issueDate?: string | null;
  token?: string | null;
  paidAt?: string | null;
  createdAt?: string | null;
  [key: string]: unknown;
};

export type PortalInvoicesPage = {
  data: PortalInvoice[];
  meta: {
    cursor?: string | null;
  };
};

export type PortalInvoicesParams = {
  cursor?: string | null;
  pageSize?: number;
};

export function buildPortalInvoicesQuery(
  params: PortalInvoicesParams = {},
): string {
  const search = new URLSearchParams();
  if (params.cursor) search.set("cursor", params.cursor);
  if (params.pageSize != null) search.set("pageSize", String(params.pageSize));
  const query = search.toString();
  return query ? `?${query}` : "";
}

export function normalizePortalCustomerById(
  payload: unknown,
): PortalCustomerById {
  if (payload == null) return null;
  return deepCamelCaseKeys(payload) as PortalCustomerById;
}

export function normalizePortalInvoicesPage(
  payload: unknown,
): PortalInvoicesPage {
  const normalized = deepCamelCaseKeys(payload) as {
    data?: PortalInvoice[];
    meta?: { cursor?: string | null };
  };
  return {
    data: normalized.data ?? [],
    meta: {
      cursor: normalized.meta?.cursor ?? null,
    },
  };
}

/** Public — no auth. Midday `customers.getByPortalId`. */
export async function fetchCustomerByPortalId(
  baseUrl: string,
  portalId: string,
): Promise<PortalCustomerById> {
  const response = await fetch(
    `${baseUrl}/api/v1/portal/${encodeURIComponent(portalId)}`,
    { signal: AbortSignal.timeout(8_000) },
  );

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return normalizePortalCustomerById(await response.json());
}

/** Public — no auth. Midday `customers.getPortalInvoices`. */
export async function fetchPortalInvoices(
  baseUrl: string,
  portalId: string,
  params: PortalInvoicesParams = {},
): Promise<PortalInvoicesPage> {
  const response = await fetch(
    `${baseUrl}/api/v1/portal/${encodeURIComponent(portalId)}/invoices${buildPortalInvoicesQuery(params)}`,
    { signal: AbortSignal.timeout(8_000) },
  );

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return normalizePortalInvoicesPage(await response.json());
}

export async function fetchCustomersList(
  baseUrl: string,
  accessToken: string | null,
  params: CustomersListParams = {},
): Promise<CustomersList> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(
    `${baseUrl}/api/v1/customers${buildCustomersListQuery(params)}`,
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

  return normalizeCustomersList(
    (await response.json()) as RawCustomersListResponse,
  );
}

export async function fetchCustomerById(
  baseUrl: string,
  accessToken: string | null,
  id: string,
): Promise<Customer | null> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(
    `${baseUrl}/api/v1/customers/${encodeURIComponent(id)}`,
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

  return normalizeCustomerDetail(await response.json());
}

export async function fetchCustomerInvoiceSummary(
  baseUrl: string,
  accessToken: string | null,
  id: string,
): Promise<Record<string, unknown>> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(
    `${baseUrl}/api/v1/customers/${encodeURIComponent(id)}/invoice-summary`,
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

  return normalizeCustomerInvoiceSummary(await response.json());
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

export type UpsertCustomerInput = {
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
  tags?: Array<{ id: string; name?: string | null }>;
};

export type ToggleCustomerPortalInput = {
  customerId: string;
  enabled: boolean;
};

export async function upsertCustomer(
  baseUrl: string,
  accessToken: string | null,
  input: UpsertCustomerInput,
): Promise<Customer> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(`${baseUrl}/api/v1/customers`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(omitUndefined(input as Record<string, unknown>)),
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return normalizeCustomerDetail(await response.json());
}

export async function deleteCustomer(
  baseUrl: string,
  accessToken: string | null,
  id: string,
): Promise<Customer> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(
    `${baseUrl}/api/v1/customers/${encodeURIComponent(id)}`,
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

  return normalizeCustomerDetail(await response.json());
}

export async function toggleCustomerPortal(
  baseUrl: string,
  accessToken: string | null,
  input: ToggleCustomerPortalInput,
): Promise<Record<string, unknown>> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(`${baseUrl}/api/v1/customers/toggle-portal`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      customerId: input.customerId,
      enabled: input.enabled,
    }),
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return deepCamelCaseKeys(await response.json()) as Record<string, unknown>;
}

export async function cancelCustomerEnrichment(
  baseUrl: string,
  accessToken: string | null,
  id: string,
): Promise<{ cancelled: boolean }> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(
    `${baseUrl}/api/v1/customers/${encodeURIComponent(id)}/cancel-enrichment`,
    {
      method: "POST",
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

  return (await response.json()) as { cancelled: boolean };
}

export async function clearCustomerEnrichment(
  baseUrl: string,
  accessToken: string | null,
  id: string,
): Promise<{ cleared: boolean }> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(
    `${baseUrl}/api/v1/customers/${encodeURIComponent(id)}/clear-enrichment`,
    {
      method: "POST",
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

  return (await response.json()) as { cleared: boolean };
}

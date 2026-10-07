import type { components } from "./openapi.generated";
import { RustApiError } from "./overview";

type RawInvoiceProduct = components["schemas"]["InvoiceProduct"];
type RawSaveLineItemAsProductResponse =
  components["schemas"]["SaveLineItemAsProductResponse"];

export type InvoiceProduct = RawInvoiceProduct;

export type InvoiceProductDetail = RawInvoiceProduct | null;

export type SaveLineItemAsProductResult = RawSaveLineItemAsProductResponse;

export type ListInvoiceProductsParams = {
  sortBy?: string | null;
  limit?: number | null;
  includeInactive?: boolean | null;
  currency?: string | null;
};

export type CreateInvoiceProductInput = {
  name: string;
  description?: string | null;
  price?: number | null;
  currency?: string | null;
  unit?: string | null;
  taxRate?: number | null;
  isActive?: boolean;
};

export type UpdateInvoiceProductInput = {
  id: string;
  name?: string;
  description?: string | null;
  price?: number | null;
  currency?: string | null;
  unit?: string | null;
  taxRate?: number | null;
  isActive?: boolean;
};

export type SaveLineItemAsProductInput = {
  name: string;
  price?: number | null;
  unit?: string | null;
  productId?: string;
  currency?: string | null;
};

function omitUndefined<T extends Record<string, unknown>>(input: T): T {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined),
  ) as T;
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

export function normalizeInvoiceProduct(
  payload: RawInvoiceProduct | Record<string, unknown>,
): InvoiceProduct {
  return deepCamelCaseKeys(payload) as InvoiceProduct;
}

export function normalizeInvoiceProducts(
  payload: RawInvoiceProduct[],
): InvoiceProduct[] {
  return (payload ?? []).map((row) => normalizeInvoiceProduct(row));
}

export function normalizeSaveLineItemAsProduct(
  payload: RawSaveLineItemAsProductResponse | Record<string, unknown>,
): SaveLineItemAsProductResult {
  const row = deepCamelCaseKeys(payload) as {
    product?: InvoiceProduct | null;
    shouldClearProductId?: boolean;
  };
  return {
    product: row.product ?? null,
    shouldClearProductId: row.shouldClearProductId ?? false,
  } as SaveLineItemAsProductResult;
}

export function buildInvoiceProductsListQuery(
  params: ListInvoiceProductsParams,
): string {
  const search = new URLSearchParams();
  if (params.sortBy) search.set("sortBy", params.sortBy);
  if (params.limit != null) search.set("limit", String(params.limit));
  if (params.includeInactive != null) {
    search.set("includeInactive", String(params.includeInactive));
  }
  if (params.currency) search.set("currency", params.currency);
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchInvoiceProducts(
  baseUrl: string,
  accessToken: string | null,
  params: ListInvoiceProductsParams = {},
): Promise<InvoiceProduct[]> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(
    `${baseUrl}/api/v1/invoice-products${buildInvoiceProductsListQuery(params)}`,
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

  return normalizeInvoiceProducts(
    (await response.json()) as RawInvoiceProduct[],
  );
}

export async function fetchInvoiceProductById(
  baseUrl: string,
  accessToken: string | null,
  id: string,
): Promise<InvoiceProductDetail> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(
    `${baseUrl}/api/v1/invoice-products/${encodeURIComponent(id)}`,
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

  return normalizeInvoiceProduct(
    (await response.json()) as RawInvoiceProduct,
  ) as InvoiceProductDetail;
}

export async function createInvoiceProduct(
  baseUrl: string,
  accessToken: string | null,
  input: CreateInvoiceProductInput,
): Promise<InvoiceProduct> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(`${baseUrl}/api/v1/invoice-products`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(omitUndefined(input as Record<string, unknown>)),
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return normalizeInvoiceProduct((await response.json()) as RawInvoiceProduct);
}

export async function updateInvoiceProduct(
  baseUrl: string,
  accessToken: string | null,
  input: UpdateInvoiceProductInput,
): Promise<InvoiceProduct> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const { id, ...body } = input;
  const response = await fetch(
    `${baseUrl}/api/v1/invoice-products/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(omitUndefined(body as Record<string, unknown>)),
      signal: AbortSignal.timeout(8_000),
    },
  );

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return normalizeInvoiceProduct((await response.json()) as RawInvoiceProduct);
}

export async function deleteInvoiceProduct(
  baseUrl: string,
  accessToken: string | null,
  id: string,
): Promise<boolean> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(
    `${baseUrl}/api/v1/invoice-products/${encodeURIComponent(id)}`,
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

  return (await response.json()) === true;
}

export async function incrementInvoiceProductUsage(
  baseUrl: string,
  accessToken: string | null,
  id: string,
): Promise<{ success: true }> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(
    `${baseUrl}/api/v1/invoice-products/${encodeURIComponent(id)}/increment-usage`,
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

  return { success: true };
}

export async function saveLineItemAsProduct(
  baseUrl: string,
  accessToken: string | null,
  input: SaveLineItemAsProductInput,
): Promise<SaveLineItemAsProductResult> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(
    `${baseUrl}/api/v1/invoice-products/save-line-item`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(omitUndefined(input as Record<string, unknown>)),
      signal: AbortSignal.timeout(8_000),
    },
  );

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return normalizeSaveLineItemAsProduct(
    (await response.json()) as RawSaveLineItemAsProductResponse,
  );
}

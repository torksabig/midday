import type { RouterOutputs } from "@api/trpc/routers/_app";
import type { components } from "./openapi.generated";
import { RustApiError } from "./overview";

type RawInvoiceTemplate = components["schemas"]["InvoiceTemplate"];
type RawDeleteInvoiceTemplateResponse =
  components["schemas"]["DeleteInvoiceTemplateResponse"];

export type InvoiceTemplateList = RouterOutputs["invoiceTemplate"]["list"];
export type InvoiceTemplateItem = NonNullable<InvoiceTemplateList>[number];
export type InvoiceTemplateDetail = RouterOutputs["invoiceTemplate"]["get"];
export type InvoiceTemplateCount = RouterOutputs["invoiceTemplate"]["count"];
export type InvoiceTemplateCreate = RouterOutputs["invoiceTemplate"]["create"];
export type InvoiceTemplateUpsert = RouterOutputs["invoiceTemplate"]["upsert"];
export type InvoiceTemplateSetDefault =
  RouterOutputs["invoiceTemplate"]["setDefault"];
export type InvoiceTemplateDelete = RouterOutputs["invoiceTemplate"]["delete"];

export type CreateInvoiceTemplateInput = Record<string, unknown> & {
  name: string;
  isDefault?: boolean;
};

export type UpsertInvoiceTemplateInput = Record<string, unknown> & {
  id?: string;
  name?: string;
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

export function normalizeInvoiceTemplate(
  payload: RawInvoiceTemplate | Record<string, unknown>,
): InvoiceTemplateItem {
  return deepCamelCaseKeys(payload) as InvoiceTemplateItem;
}

export function normalizeInvoiceTemplates(
  payload: Array<RawInvoiceTemplate | Record<string, unknown>>,
): InvoiceTemplateList {
  return (payload ?? []).map((row) => normalizeInvoiceTemplate(row));
}

export function normalizeDeleteInvoiceTemplate(
  payload: RawDeleteInvoiceTemplateResponse | Record<string, unknown>,
): InvoiceTemplateDelete {
  const row = deepCamelCaseKeys(payload) as {
    deleted?: InvoiceTemplateItem;
    newDefault?: InvoiceTemplateItem | null;
  };
  return {
    deleted: row.deleted,
    newDefault: row.newDefault ?? null,
  } as InvoiceTemplateDelete;
}

export async function fetchInvoiceTemplates(
  baseUrl: string,
  accessToken: string | null,
): Promise<InvoiceTemplateList> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(`${baseUrl}/api/v1/invoice-templates`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return normalizeInvoiceTemplates(
    (await response.json()) as RawInvoiceTemplate[],
  );
}

export async function fetchInvoiceTemplateById(
  baseUrl: string,
  accessToken: string | null,
  id: string,
): Promise<InvoiceTemplateDetail> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(
    `${baseUrl}/api/v1/invoice-templates/${encodeURIComponent(id)}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(8_000),
    },
  );

  if (response.status === 404) return null as InvoiceTemplateDetail;

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return normalizeInvoiceTemplate(
    (await response.json()) as RawInvoiceTemplate,
  ) as InvoiceTemplateDetail;
}

export async function fetchInvoiceTemplateCount(
  baseUrl: string,
  accessToken: string | null,
): Promise<InvoiceTemplateCount> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(`${baseUrl}/api/v1/invoice-templates/count`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  const payload = await response.json();
  if (typeof payload === "number") return payload;
  if (typeof payload === "string") return Number(payload);
  throw new RustApiError(500, "Unexpected invoice template count response");
}

export async function createInvoiceTemplate(
  baseUrl: string,
  accessToken: string | null,
  input: CreateInvoiceTemplateInput,
): Promise<InvoiceTemplateCreate> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(`${baseUrl}/api/v1/invoice-templates`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(omitUndefined(input)),
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return normalizeInvoiceTemplate(
    (await response.json()) as RawInvoiceTemplate,
  ) as InvoiceTemplateCreate;
}

export async function upsertInvoiceTemplate(
  baseUrl: string,
  accessToken: string | null,
  input: UpsertInvoiceTemplateInput,
): Promise<InvoiceTemplateUpsert> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(`${baseUrl}/api/v1/invoice-templates/upsert`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(omitUndefined(input)),
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return normalizeInvoiceTemplate(
    (await response.json()) as RawInvoiceTemplate,
  ) as InvoiceTemplateUpsert;
}

export async function setDefaultInvoiceTemplate(
  baseUrl: string,
  accessToken: string | null,
  id: string,
): Promise<InvoiceTemplateSetDefault> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(
    `${baseUrl}/api/v1/invoice-templates/${encodeURIComponent(id)}/set-default`,
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

  return normalizeInvoiceTemplate(
    (await response.json()) as RawInvoiceTemplate,
  ) as InvoiceTemplateSetDefault;
}

export async function deleteInvoiceTemplate(
  baseUrl: string,
  accessToken: string | null,
  id: string,
): Promise<InvoiceTemplateDelete> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(
    `${baseUrl}/api/v1/invoice-templates/${encodeURIComponent(id)}`,
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

  return normalizeDeleteInvoiceTemplate(
    (await response.json()) as RawDeleteInvoiceTemplateResponse,
  );
}

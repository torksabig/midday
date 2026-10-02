import type { components } from "./openapi.generated";
import { RustApiError } from "./overview";

type RawCategory = components["schemas"]["MiddayCategory"];
type RawCategoryChild = components["schemas"]["MiddayCategoryChild"];
type CategoryMutationResponse =
  components["schemas"]["CategoryMutationResponse"];

type CategoryMutationBody = Record<string, unknown>;

export type TransactionCategoryChild = {
  id: string;
  name: string;
  color: string | null;
  slug: string | null;
  description: string | null;
  system: boolean | null;
  taxRate: number | null;
  taxType: string | null;
  taxReportingCode: string | null;
  excluded: boolean | null;
  parentId: string | null;
};

export type TransactionCategory = TransactionCategoryChild & {
  children: TransactionCategoryChild[];
};

export type CreateTransactionCategoryInput = {
  name: string;
  color?: string | null;
  description?: string | null;
  taxRate?: number | null;
  taxType?: string | null;
  taxReportingCode?: string | null;
  parentId?: string | null;
};

export type UpdateTransactionCategoryInput =
  Partial<CreateTransactionCategoryInput> & {
    id: string;
    excluded?: boolean | null;
  };

export type DeleteTransactionCategoryInput = {
  id: string;
};

function normalizeChild(category: RawCategoryChild): TransactionCategoryChild {
  return {
    id: category.id,
    name: category.name,
    color: category.color ?? null,
    slug: category.slug ?? null,
    description: category.description ?? null,
    system: category.system ?? null,
    taxRate: category.tax_rate ?? null,
    taxType: category.tax_type ?? null,
    taxReportingCode: category.tax_reporting_code ?? null,
    excluded: category.excluded ?? null,
    parentId: category.parent_id ?? null,
  };
}

function normalizeCategory(category: RawCategory): TransactionCategory {
  return {
    ...normalizeChild(category),
    children: category.children.map(normalizeChild),
  };
}

function normalizeMutationCategory(
  category: CategoryMutationResponse,
): TransactionCategoryChild {
  return {
    id: category.id,
    name: category.name,
    color: category.color ?? null,
    slug: category.slug ?? null,
    description: category.description ?? null,
    system: category.system ?? null,
    taxRate: category.taxRate ?? null,
    taxType: category.taxType ?? null,
    taxReportingCode: category.taxReportingCode ?? null,
    excluded: category.excluded ?? null,
    parentId: category.parentId ?? null,
  };
}

export async function fetchTransactionCategories(
  baseUrl: string,
  accessToken: string | null,
): Promise<TransactionCategory[]> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(`${baseUrl}/api/v1/categories`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  const payload = (await response.json()) as RawCategory[];
  return payload.map(normalizeCategory);
}

async function sendCategoryMutation(
  baseUrl: string,
  accessToken: string | null,
  path: string,
  init: RequestInit,
): Promise<TransactionCategoryChild> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return normalizeMutationCategory(
    (await response.json()) as CategoryMutationResponse,
  );
}

function categoryBody(input: CreateTransactionCategoryInput) {
  const body: CategoryMutationBody = {
    name: input.name,
  };

  if (input.color !== undefined) body.color = input.color;
  if (input.description !== undefined) body.description = input.description;
  if (input.taxRate !== undefined) body.taxRate = input.taxRate;
  if (input.taxType !== undefined) body.taxType = input.taxType;
  if (input.taxReportingCode !== undefined) {
    body.taxReportingCode = input.taxReportingCode;
  }
  if (input.parentId !== undefined) body.parentId = input.parentId;

  return body;
}

export function createTransactionCategory(
  baseUrl: string,
  accessToken: string | null,
  input: CreateTransactionCategoryInput,
) {
  return sendCategoryMutation(baseUrl, accessToken, "/api/v1/categories", {
    method: "POST",
    body: JSON.stringify(categoryBody(input)),
  });
}

export function updateTransactionCategory(
  baseUrl: string,
  accessToken: string | null,
  input: UpdateTransactionCategoryInput,
) {
  const body = categoryBody({
    ...input,
    name: input.name ?? "",
  });

  if (input.name === undefined) delete body.name;
  if (input.excluded !== undefined) body.excluded = input.excluded;
  if (input.parentId === null) {
    delete body.parentId;
    body.clearParent = true;
  }

  return sendCategoryMutation(
    baseUrl,
    accessToken,
    `/api/v1/categories/${input.id}`,
    {
      method: "PUT",
      body: JSON.stringify(body),
    },
  );
}

export function deleteTransactionCategory(
  baseUrl: string,
  accessToken: string | null,
  input: DeleteTransactionCategoryInput,
) {
  return sendCategoryMutation(
    baseUrl,
    accessToken,
    `/api/v1/categories/${input.id}`,
    {
      method: "DELETE",
    },
  );
}

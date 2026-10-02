import type { components } from "./openapi.generated";
import { RustApiError } from "./overview";

type RawCategory = components["schemas"]["MiddayCategory"];
type RawCategoryChild = components["schemas"]["MiddayCategoryChild"];

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

import type { RouterOutputs } from "@api/trpc/routers/_app";
import type { components } from "./openapi.generated";
import { RustApiError } from "./overview";

type RawPublicReport = components["schemas"]["PublicReportResponse"];
type RawCreatedReport = components["schemas"]["CreatedReportResponse"];

export type ReportDateRangeParams = {
  from: string;
  to: string;
  currency?: string | null;
  revenueType?: string | null;
};

export type ReportRunwayParams = {
  currency?: string | null;
};

export type ReportTaxSummaryParams = {
  from: string;
  to: string;
  currency?: string | null;
  type: string;
  categorySlug?: string | null;
  taxType?: string | null;
};

export type ReportAccountBalancesParams = {
  currency?: string | null;
};

export type ReportRevenueForecastParams = {
  from: string;
  to: string;
  forecastMonths?: number;
  currency?: string | null;
  revenueType?: string | null;
};

export type CreateReportInput = {
  type: string;
  from: string;
  to: string;
  currency?: string | null;
  expireAt?: string | null;
};

export type ReportsRevenue = RouterOutputs["reports"]["revenue"];
export type ReportsProfit = RouterOutputs["reports"]["profit"];
export type ReportsBurnRate = RouterOutputs["reports"]["burnRate"];
export type ReportsRunway = RouterOutputs["reports"]["runway"];
export type ReportsExpense = RouterOutputs["reports"]["expense"];
export type ReportsSpending = RouterOutputs["reports"]["spending"];
export type ReportsTaxSummary = RouterOutputs["reports"]["taxSummary"];
export type ReportsAccountBalances =
  RouterOutputs["reports"]["getAccountBalances"];
export type ReportsRevenueForecast =
  RouterOutputs["reports"]["revenueForecast"];
export type ReportByLinkId = RouterOutputs["reports"]["getByLinkId"];
export type ReportChartByLinkId =
  RouterOutputs["reports"]["getChartDataByLinkId"];
export type CreatedReport = RouterOutputs["reports"]["create"];

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

function omitUndefined<T extends Record<string, unknown>>(input: T): T {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined),
  ) as T;
}

export function buildReportDateRangeQuery(
  params: ReportDateRangeParams,
): string {
  const search = new URLSearchParams();
  search.set("from", params.from);
  search.set("to", params.to);
  if (params.currency) search.set("currency", params.currency);
  if (params.revenueType) search.set("revenueType", params.revenueType);
  return `?${search.toString()}`;
}

async function fetchAuthedReportJson(
  baseUrl: string,
  accessToken: string | null,
  path: string,
  query = "",
): Promise<unknown> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(`${baseUrl}/api/v1/reports/${path}${query}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return deepCamelCaseKeys(await response.json());
}

export async function fetchReportsRevenue(
  baseUrl: string,
  accessToken: string | null,
  params: ReportDateRangeParams,
): Promise<ReportsRevenue> {
  return (await fetchAuthedReportJson(
    baseUrl,
    accessToken,
    "revenue",
    buildReportDateRangeQuery(params),
  )) as ReportsRevenue;
}

export async function fetchReportsProfit(
  baseUrl: string,
  accessToken: string | null,
  params: ReportDateRangeParams,
): Promise<ReportsProfit> {
  return (await fetchAuthedReportJson(
    baseUrl,
    accessToken,
    "profit",
    buildReportDateRangeQuery(params),
  )) as ReportsProfit;
}

export async function fetchReportsBurnRate(
  baseUrl: string,
  accessToken: string | null,
  params: ReportDateRangeParams,
): Promise<ReportsBurnRate> {
  return (await fetchAuthedReportJson(
    baseUrl,
    accessToken,
    "burn-rate",
    buildReportDateRangeQuery(params),
  )) as ReportsBurnRate;
}

export async function fetchReportsRunway(
  baseUrl: string,
  accessToken: string | null,
  params: ReportRunwayParams = {},
): Promise<ReportsRunway> {
  const search = new URLSearchParams();
  if (params.currency) search.set("currency", params.currency);
  const qs = search.toString();
  return (await fetchAuthedReportJson(
    baseUrl,
    accessToken,
    "runway",
    qs ? `?${qs}` : "",
  )) as ReportsRunway;
}

export async function fetchReportsExpense(
  baseUrl: string,
  accessToken: string | null,
  params: ReportDateRangeParams,
): Promise<ReportsExpense> {
  return (await fetchAuthedReportJson(
    baseUrl,
    accessToken,
    "expense",
    buildReportDateRangeQuery(params),
  )) as ReportsExpense;
}

export async function fetchReportsSpending(
  baseUrl: string,
  accessToken: string | null,
  params: ReportDateRangeParams,
): Promise<ReportsSpending> {
  return (await fetchAuthedReportJson(
    baseUrl,
    accessToken,
    "spending",
    buildReportDateRangeQuery(params),
  )) as ReportsSpending;
}

export async function fetchReportsTaxSummary(
  baseUrl: string,
  accessToken: string | null,
  params: ReportTaxSummaryParams,
): Promise<ReportsTaxSummary> {
  const search = new URLSearchParams();
  search.set("from", params.from);
  search.set("to", params.to);
  search.set("type", params.type);
  if (params.currency) search.set("currency", params.currency);
  if (params.categorySlug) search.set("categorySlug", params.categorySlug);
  if (params.taxType) search.set("taxType", params.taxType);
  return (await fetchAuthedReportJson(
    baseUrl,
    accessToken,
    "tax-summary",
    `?${search.toString()}`,
  )) as ReportsTaxSummary;
}

export async function fetchReportsAccountBalances(
  baseUrl: string,
  accessToken: string | null,
  params: ReportAccountBalancesParams = {},
): Promise<ReportsAccountBalances> {
  const search = new URLSearchParams();
  if (params.currency) search.set("currency", params.currency);
  const qs = search.toString();
  return (await fetchAuthedReportJson(
    baseUrl,
    accessToken,
    "account-balances",
    qs ? `?${qs}` : "",
  )) as ReportsAccountBalances;
}

export async function fetchReportsRevenueForecast(
  baseUrl: string,
  accessToken: string | null,
  params: ReportRevenueForecastParams,
): Promise<ReportsRevenueForecast> {
  const search = new URLSearchParams();
  search.set("from", params.from);
  search.set("to", params.to);
  if (params.forecastMonths != null) {
    search.set("forecastMonths", String(params.forecastMonths));
  }
  if (params.currency) search.set("currency", params.currency);
  if (params.revenueType) search.set("revenueType", params.revenueType);
  return (await fetchAuthedReportJson(
    baseUrl,
    accessToken,
    "revenue-forecast",
    `?${search.toString()}`,
  )) as ReportsRevenueForecast;
}

export function normalizePublicReport(
  payload: RawPublicReport | Record<string, unknown> | null,
): ReportByLinkId {
  if (payload == null) return null;
  return deepCamelCaseKeys(payload) as ReportByLinkId;
}

export async function fetchReportByLinkId(
  baseUrl: string,
  linkId: string,
): Promise<ReportByLinkId> {
  const response = await fetch(
    `${baseUrl}/api/v1/reports/public/${encodeURIComponent(linkId)}`,
    { signal: AbortSignal.timeout(8_000) },
  );

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return normalizePublicReport(
    (await response.json()) as RawPublicReport | null,
  );
}

export async function fetchReportChartByLinkId(
  baseUrl: string,
  linkId: string,
): Promise<ReportChartByLinkId> {
  const response = await fetch(
    `${baseUrl}/api/v1/reports/public/${encodeURIComponent(linkId)}/chart`,
    { signal: AbortSignal.timeout(15_000) },
  );

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return deepCamelCaseKeys(await response.json()) as ReportChartByLinkId;
}

export function normalizeCreatedReport(
  payload: RawCreatedReport | Record<string, unknown>,
): CreatedReport {
  return deepCamelCaseKeys(payload) as CreatedReport;
}

export async function createReport(
  baseUrl: string,
  accessToken: string | null,
  input: CreateReportInput,
): Promise<CreatedReport> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(`${baseUrl}/api/v1/reports`, {
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

  return normalizeCreatedReport(
    (await response.json()) as RawCreatedReport,
  );
}

"use client";

import { type QueryKey, queryOptions } from "@tanstack/react-query";
import { getAccessToken } from "@/utils/session";
import {
  type CreateReportInput,
  type CreatedReport,
  type ReportAccountBalancesParams,
  type ReportByLinkId,
  type ReportChartByLinkId,
  type ReportDateRangeParams,
  type ReportRevenueForecastParams,
  type ReportRunwayParams,
  type ReportsAccountBalances,
  type ReportsBurnRate,
  type ReportsExpense,
  type ReportsProfit,
  type ReportsRevenue,
  type ReportsRevenueForecast,
  type ReportsRunway,
  type ReportsSpending,
  createReport,
  fetchReportByLinkId,
  fetchReportChartByLinkId,
  fetchReportsAccountBalances,
  fetchReportsBurnRate,
  fetchReportsExpense,
  fetchReportsProfit,
  fetchReportsRevenue,
  fetchReportsRevenueForecast,
  fetchReportsRunway,
  fetchReportsSpending,
} from "./reports";

function getRustApiUrl() {
  const url = process.env.NEXT_PUBLIC_RUST_API_URL;

  if (url) return url.replace(/\/$/, "");
  if (process.env.NODE_ENV !== "production") return "http://127.0.0.1:8787";

  throw new Error("NEXT_PUBLIC_RUST_API_URL must be configured");
}

export function reportsRevenueQueryOptions(
  queryKey: QueryKey,
  params: ReportDateRangeParams,
) {
  return queryOptions<ReportsRevenue>({
    queryKey,
    queryFn: async () =>
      fetchReportsRevenue(getRustApiUrl(), await getAccessToken(), params),
  });
}

export function reportsProfitQueryOptions(
  queryKey: QueryKey,
  params: ReportDateRangeParams,
) {
  return queryOptions<ReportsProfit>({
    queryKey,
    queryFn: async () =>
      fetchReportsProfit(getRustApiUrl(), await getAccessToken(), params),
  });
}

export function reportsBurnRateQueryOptions(
  queryKey: QueryKey,
  params: ReportDateRangeParams,
) {
  return queryOptions<ReportsBurnRate>({
    queryKey,
    queryFn: async () =>
      fetchReportsBurnRate(getRustApiUrl(), await getAccessToken(), params),
  });
}

export function reportsRunwayQueryOptions(
  queryKey: QueryKey,
  params: ReportRunwayParams = {},
) {
  return queryOptions<ReportsRunway>({
    queryKey,
    queryFn: async () =>
      fetchReportsRunway(getRustApiUrl(), await getAccessToken(), params),
  });
}

export function reportsExpenseQueryOptions(
  queryKey: QueryKey,
  params: ReportDateRangeParams,
) {
  return queryOptions<ReportsExpense>({
    queryKey,
    queryFn: async () =>
      fetchReportsExpense(getRustApiUrl(), await getAccessToken(), params),
  });
}

export function reportsSpendingQueryOptions(
  queryKey: QueryKey,
  params: ReportDateRangeParams,
) {
  return queryOptions<ReportsSpending>({
    queryKey,
    queryFn: async () =>
      fetchReportsSpending(getRustApiUrl(), await getAccessToken(), params),
  });
}

export function reportsAccountBalancesQueryOptions(
  queryKey: QueryKey,
  params: ReportAccountBalancesParams = {},
) {
  return queryOptions<ReportsAccountBalances>({
    queryKey,
    queryFn: async () =>
      fetchReportsAccountBalances(
        getRustApiUrl(),
        await getAccessToken(),
        params,
      ),
  });
}

export function reportsRevenueForecastQueryOptions(
  queryKey: QueryKey,
  params: ReportRevenueForecastParams,
) {
  return queryOptions<ReportsRevenueForecast>({
    queryKey,
    queryFn: async () =>
      fetchReportsRevenueForecast(
        getRustApiUrl(),
        await getAccessToken(),
        params,
      ),
  });
}

export function reportByLinkIdQueryOptions(
  queryKey: QueryKey,
  linkId: string,
) {
  return queryOptions<ReportByLinkId>({
    queryKey,
    queryFn: async () => fetchReportByLinkId(getRustApiUrl(), linkId),
  });
}

export function reportChartByLinkIdQueryOptions(
  queryKey: QueryKey,
  linkId: string,
) {
  return queryOptions<ReportChartByLinkId>({
    queryKey,
    queryFn: async () => fetchReportChartByLinkId(getRustApiUrl(), linkId),
  });
}

export async function createReportFromRust(
  input: CreateReportInput,
): Promise<CreatedReport> {
  return createReport(getRustApiUrl(), await getAccessToken(), input);
}

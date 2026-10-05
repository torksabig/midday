import {
  assertLegacyIdentityFallbackAllowed,
  tryDelegateReportsBurnRate,
  tryDelegateReportsExpense,
  tryDelegateReportsProfit,
  tryDelegateReportsRevenue,
  tryDelegateReportsRunway,
  tryDelegateReportsSpending,
} from "@api/services/replacement-delegation";
import type { ReplacementReportDateRangeQuery } from "@midday/replacement-backend";
import { shouldDelegateToReplacementBackend } from "@midday/replacement-backend";
import { mapDelegationErrorToHttp } from "./replacement-rest-documents";
import { extractBearerToken } from "./vault-presigned-url";

async function delegateReportRead(
  authorizationHeader: string | undefined,
  delegate: (sessionAccessToken: string | null) => Promise<unknown | null>,
  fetchLegacy: () => Promise<unknown>,
): Promise<unknown> {
  if (!shouldDelegateToReplacementBackend()) {
    return fetchLegacy();
  }

  const sessionAccessToken = extractBearerToken(authorizationHeader);
  try {
    const delegated = await delegate(sessionAccessToken);
    if (delegated) {
      return delegated;
    }
    assertLegacyIdentityFallbackAllowed();
  } catch (error) {
    mapDelegationErrorToHttp(error);
  }

  return fetchLegacy();
}

export async function fetchRevenueReportsForRest(
  input: ReplacementReportDateRangeQuery,
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<unknown>,
): Promise<unknown> {
  return delegateReportRead(
    authorizationHeader,
    (token) => tryDelegateReportsRevenue(input, token),
    fetchLegacy,
  );
}

export async function fetchProfitReportsForRest(
  input: ReplacementReportDateRangeQuery,
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<unknown>,
): Promise<unknown> {
  return delegateReportRead(
    authorizationHeader,
    (token) => tryDelegateReportsProfit(input, token),
    fetchLegacy,
  );
}

export async function fetchBurnRateReportsForRest(
  input: ReplacementReportDateRangeQuery,
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<unknown>,
): Promise<unknown> {
  return delegateReportRead(
    authorizationHeader,
    (token) => tryDelegateReportsBurnRate(input, token),
    fetchLegacy,
  );
}

export async function fetchRunwayReportsForRest(
  currency: string | null | undefined,
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<unknown>,
): Promise<unknown> {
  return delegateReportRead(
    authorizationHeader,
    (token) => tryDelegateReportsRunway(currency, token),
    fetchLegacy,
  );
}

export async function fetchExpensesReportsForRest(
  input: ReplacementReportDateRangeQuery,
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<unknown>,
): Promise<unknown> {
  return delegateReportRead(
    authorizationHeader,
    (token) => tryDelegateReportsExpense(input, token),
    fetchLegacy,
  );
}

export async function fetchSpendingReportsForRest(
  input: ReplacementReportDateRangeQuery,
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<unknown>,
): Promise<unknown> {
  return delegateReportRead(
    authorizationHeader,
    (token) => tryDelegateReportsSpending(input, token),
    fetchLegacy,
  );
}

import {
  fetchReplacementAuthMePayload,
  fetchReplacementBankAccounts,
  fetchReplacementCustomerById,
  fetchReplacementCustomersList,
  fetchReplacementDocumentById,
  fetchReplacementDocumentsList,
  fetchReplacementInvoiceById,
  fetchReplacementInvoicesList,
  fetchReplacementInvoicePaymentStatus,
  fetchReplacementInvoiceSummary,
  fetchReplacementSearchGlobal,
  fetchReplacementRelatedDocuments,
  fetchReplacementReportsAccountBalances,
  fetchReplacementReportsBurnRate,
  fetchReplacementReportsExpense,
  fetchReplacementReportsProfit,
  fetchReplacementReportsRevenue,
  fetchReplacementReportsRunway,
  fetchReplacementReportsSpending,
  fetchReplacementReportsTaxSummary,
  fetchReplacementReportsRevenueForecast,
  fetchReplacementReportByLinkId,
  fetchReplacementReportChartByLinkId,
  fetchReplacementSearchAttachments,
  fetchReplacementTrackerProjects,
  fetchReplacementTrackerEntriesByRange,
  fetchReplacementTrackerBillableHours,
  fetchReplacementBankConnections,
  fetchReplacementInvoicePublicById,
  ReplacementPublicFetchError,
  fetchReplacementInboxById,
  fetchReplacementInboxByStatus,
  fetchReplacementInboxCheckAttachments,
  fetchReplacementInboxList,
  fetchReplacementInboxSearch,
  fetchReplacementOverviewSummary,
  fetchReplacementTeamCurrent,
  fetchReplacementTransactionById,
  fetchReplacementTransactionCategories,
  fetchReplacementTransactionsList,
  fetchReplacementTransactionsReviewCount,
  getReplacementApiUrl,
  mapReplacementToTeamCurrent,
  mapReplacementToUserMe,
  replacementDelegationRequiresSuccess,
  resolveReplacementBearerToken,
  shouldDelegateToReplacementBackend,
  type MiddayInboxByIdShape,
  type MiddayTransactionByIdShape,
  type ReplacementBankAccountsListQuery,
  type ReplacementCustomersListQuery,
  type ReplacementDocumentsListQuery,
  type ReplacementInvoicesListQuery,
  type ReplacementInvoiceSummaryQuery,
  type ReplacementGlobalSearchQuery,
  type ReplacementInboxByStatusQuery,
  type ReplacementInboxListQuery,
  type ReplacementInboxSearchQuery,
  type ReplacementReportDateRangeQuery,
  type ReplacementRevenueForecastQuery,
  type ReplacementSearchAttachmentsQuery,
  type ReplacementTaxSummaryQuery,
  type ReplacementTransactionsListQuery,
  type ReplacementTrackerProjectsListQuery,
  type ReplacementTrackerEntriesByRangeQuery,
  type ReplacementTrackerBillableHoursQuery,
  type ReplacementBankConnectionsListQuery,
} from "@midday/replacement-backend";
import { TRPCError } from "@trpc/server";

/** Dual mode only: replacement failed but legacy Drizzle is still allowed. */
export function assertLegacyIdentityFallbackAllowed(): void {
  if (replacementDelegationRequiresSuccess()) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message:
        "Replacement backend delegation failed (legacy fallback disabled in replacement mode)",
    });
  }
}

export async function tryDelegateUserMe(
  generateFileKey: (teamId: string) => Promise<string | null>,
  sessionAccessToken?: string | null,
) {
  if (!shouldDelegateToReplacementBackend()) {
    return null;
  }

  const token = await resolveReplacementBearerToken(
    getReplacementApiUrl(),
    sessionAccessToken,
  );
  if (!token) {
    if (replacementDelegationRequiresSuccess()) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Replacement backend delegation failed: no bearer token",
      });
    }
    return null;
  }

  try {
    const baseUrl = getReplacementApiUrl();
    const payload = await fetchReplacementAuthMePayload(baseUrl, token);
    const fileKey = payload.team.id
      ? await generateFileKey(payload.team.id)
      : null;
    return mapReplacementToUserMe(payload, fileKey);
  } catch (error) {
    if (replacementDelegationRequiresSuccess()) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Replacement backend delegation failed",
        cause: error,
      });
    }
    return null;
  }
}

export async function tryDelegateTeamCurrent(
  sessionAccessToken?: string | null,
) {
  if (!shouldDelegateToReplacementBackend()) {
    return null;
  }

  const token = await resolveReplacementBearerToken(
    getReplacementApiUrl(),
    sessionAccessToken,
  );
  if (!token) {
    if (replacementDelegationRequiresSuccess()) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Replacement backend delegation failed: no bearer token",
      });
    }
    return null;
  }

  try {
    const baseUrl = getReplacementApiUrl();
    const payload = await fetchReplacementTeamCurrent(baseUrl, token);
    return mapReplacementToTeamCurrent(payload);
  } catch (error) {
    if (replacementDelegationRequiresSuccess()) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Replacement backend delegation failed",
        cause: error,
      });
    }
    return null;
  }
}

export async function tryDelegateTransactionsGet(
  input: ReplacementTransactionsListQuery,
  sessionAccessToken?: string | null,
) {
  if (!shouldDelegateToReplacementBackend()) {
    return null;
  }

  const token = await resolveReplacementBearerToken(
    getReplacementApiUrl(),
    sessionAccessToken,
  );
  if (!token) {
    if (replacementDelegationRequiresSuccess()) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Replacement backend delegation failed: no bearer token",
      });
    }
    return null;
  }

  try {
    const baseUrl = getReplacementApiUrl();
    return await fetchReplacementTransactionsList(baseUrl, token, input);
  } catch (error) {
    if (replacementDelegationRequiresSuccess()) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Replacement backend delegation failed",
        cause: error,
      });
    }
    return null;
  }
}

export type DelegateTransactionsGetByIdResult =
  | { delegated: false }
  | { delegated: true; transaction: MiddayTransactionByIdShape | null };

export async function tryDelegateTransactionCategoriesGet(
  sessionAccessToken?: string | null,
) {
  if (!shouldDelegateToReplacementBackend()) {
    return null;
  }

  const token = await resolveReplacementBearerToken(
    getReplacementApiUrl(),
    sessionAccessToken,
  );
  if (!token) {
    if (replacementDelegationRequiresSuccess()) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Replacement backend delegation failed: no bearer token",
      });
    }
    return null;
  }

  try {
    const baseUrl = getReplacementApiUrl();
    return await fetchReplacementTransactionCategories(baseUrl, token);
  } catch (error) {
    if (replacementDelegationRequiresSuccess()) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Replacement backend delegation failed",
        cause: error,
      });
    }
    return null;
  }
}

export async function tryDelegateBankAccountsGet(
  input: ReplacementBankAccountsListQuery,
  sessionAccessToken?: string | null,
) {
  if (!shouldDelegateToReplacementBackend()) {
    return null;
  }

  const token = await resolveReplacementBearerToken(
    getReplacementApiUrl(),
    sessionAccessToken,
  );
  if (!token) {
    if (replacementDelegationRequiresSuccess()) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Replacement backend delegation failed: no bearer token",
      });
    }
    return null;
  }

  try {
    const baseUrl = getReplacementApiUrl();
    return await fetchReplacementBankAccounts(baseUrl, token, input);
  } catch (error) {
    if (replacementDelegationRequiresSuccess()) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Replacement backend delegation failed",
        cause: error,
      });
    }
    return null;
  }
}

export async function tryDelegateTransactionsGetReviewCount(
  sessionAccessToken?: string | null,
): Promise<number | null> {
  if (!shouldDelegateToReplacementBackend()) {
    return null;
  }

  const token = await resolveReplacementBearerToken(
    getReplacementApiUrl(),
    sessionAccessToken,
  );
  if (!token) {
    if (replacementDelegationRequiresSuccess()) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Replacement backend delegation failed: no bearer token",
      });
    }
    return null;
  }

  try {
    const baseUrl = getReplacementApiUrl();
    return await fetchReplacementTransactionsReviewCount(baseUrl, token);
  } catch (error) {
    if (replacementDelegationRequiresSuccess()) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Replacement backend delegation failed",
        cause: error,
      });
    }
    return null;
  }
}

export async function tryDelegateInboxGet(
  input: ReplacementInboxListQuery,
  sessionAccessToken?: string | null,
) {
  if (!shouldDelegateToReplacementBackend()) {
    return null;
  }

  const token = await resolveReplacementBearerToken(
    getReplacementApiUrl(),
    sessionAccessToken,
  );
  if (!token) {
    if (replacementDelegationRequiresSuccess()) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Replacement backend delegation failed: no bearer token",
      });
    }
    return null;
  }

  try {
    const baseUrl = getReplacementApiUrl();
    return await fetchReplacementInboxList(baseUrl, token, input);
  } catch (error) {
    if (replacementDelegationRequiresSuccess()) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Replacement backend delegation failed",
        cause: error,
      });
    }
    return null;
  }
}

export type DelegateInboxGetByIdResult =
  | { delegated: false }
  | { delegated: true; item: MiddayInboxByIdShape | null };

export async function tryDelegateInboxSearch(
  input: ReplacementInboxSearchQuery,
  sessionAccessToken?: string | null,
) {
  if (!shouldDelegateToReplacementBackend()) {
    return null;
  }

  const token = await resolveReplacementBearerToken(
    getReplacementApiUrl(),
    sessionAccessToken,
  );
  if (!token) {
    if (replacementDelegationRequiresSuccess()) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Replacement backend delegation failed: no bearer token",
      });
    }
    return null;
  }

  try {
    const baseUrl = getReplacementApiUrl();
    return await fetchReplacementInboxSearch(baseUrl, token, input);
  } catch (error) {
    if (replacementDelegationRequiresSuccess()) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Replacement backend delegation failed",
        cause: error,
      });
    }
    return null;
  }
}

export async function tryDelegateInboxGetByStatus(
  input: ReplacementInboxByStatusQuery,
  sessionAccessToken?: string | null,
) {
  if (!shouldDelegateToReplacementBackend()) {
    return null;
  }

  const token = await resolveReplacementBearerToken(
    getReplacementApiUrl(),
    sessionAccessToken,
  );
  if (!token) {
    if (replacementDelegationRequiresSuccess()) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Replacement backend delegation failed: no bearer token",
      });
    }
    return null;
  }

  try {
    const baseUrl = getReplacementApiUrl();
    return await fetchReplacementInboxByStatus(baseUrl, token, input);
  } catch (error) {
    if (replacementDelegationRequiresSuccess()) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Replacement backend delegation failed",
        cause: error,
      });
    }
    return null;
  }
}

export async function tryDelegateInboxCheckAttachments(
  id: string,
  sessionAccessToken?: string | null,
) {
  if (!shouldDelegateToReplacementBackend()) {
    return null;
  }

  const token = await resolveReplacementBearerToken(
    getReplacementApiUrl(),
    sessionAccessToken,
  );
  if (!token) {
    if (replacementDelegationRequiresSuccess()) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Replacement backend delegation failed: no bearer token",
      });
    }
    return null;
  }

  try {
    const baseUrl = getReplacementApiUrl();
    return await fetchReplacementInboxCheckAttachments(baseUrl, token, id);
  } catch (error) {
    if (replacementDelegationRequiresSuccess()) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Replacement backend delegation failed",
        cause: error,
      });
    }
    return null;
  }
}

export async function tryDelegateOverviewSummary(
  sessionAccessToken?: string | null,
) {
  if (!shouldDelegateToReplacementBackend()) {
    return null;
  }

  const token = await resolveReplacementBearerToken(
    getReplacementApiUrl(),
    sessionAccessToken,
  );
  if (!token) {
    if (replacementDelegationRequiresSuccess()) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Replacement backend delegation failed: no bearer token",
      });
    }
    return null;
  }

  try {
    const baseUrl = getReplacementApiUrl();
    return await fetchReplacementOverviewSummary(baseUrl, token);
  } catch (error) {
    if (replacementDelegationRequiresSuccess()) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Replacement backend delegation failed",
        cause: error,
      });
    }
    return null;
  }
}

export async function tryDelegateInboxGetById(
  id: string,
  sessionAccessToken?: string | null,
): Promise<DelegateInboxGetByIdResult> {
  if (!shouldDelegateToReplacementBackend()) {
    return { delegated: false };
  }

  const token = await resolveReplacementBearerToken(
    getReplacementApiUrl(),
    sessionAccessToken,
  );
  if (!token) {
    if (replacementDelegationRequiresSuccess()) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Replacement backend delegation failed: no bearer token",
      });
    }
    return { delegated: false };
  }

  try {
    const baseUrl = getReplacementApiUrl();
    const item = await fetchReplacementInboxById(baseUrl, token, id);
    return { delegated: true, item };
  } catch (error) {
    if (replacementDelegationRequiresSuccess()) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Replacement backend delegation failed",
        cause: error,
      });
    }
    return { delegated: false };
  }
}

export async function tryDelegateDocumentsGet(
  params: ReplacementDocumentsListQuery,
  sessionAccessToken?: string | null,
) {
  if (!shouldDelegateToReplacementBackend()) {
    return null;
  }

  const token = await resolveReplacementBearerToken(
    getReplacementApiUrl(),
    sessionAccessToken,
  );
  if (!token) {
    if (replacementDelegationRequiresSuccess()) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Replacement backend delegation failed: no bearer token",
      });
    }
    return null;
  }

  try {
    return await fetchReplacementDocumentsList(
      getReplacementApiUrl(),
      token,
      params,
    );
  } catch (error) {
    if (replacementDelegationRequiresSuccess()) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Replacement backend delegation failed",
        cause: error,
      });
    }
    return null;
  }
}

export type DelegateDocumentGetByIdResult =
  | { delegated: true; document: unknown | null }
  | { delegated: false };

export async function tryDelegateDocumentsGetById(
  id: string,
  filePath: string | null | undefined,
  sessionAccessToken?: string | null,
): Promise<DelegateDocumentGetByIdResult> {
  if (!shouldDelegateToReplacementBackend()) {
    return { delegated: false };
  }

  const token = await resolveReplacementBearerToken(
    getReplacementApiUrl(),
    sessionAccessToken,
  );
  if (!token) {
    if (replacementDelegationRequiresSuccess()) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Replacement backend delegation failed: no bearer token",
      });
    }
    return { delegated: false };
  }

  try {
    const document = await fetchReplacementDocumentById(
      getReplacementApiUrl(),
      token,
      id,
      filePath,
    );
    return { delegated: true, document };
  } catch (error) {
    if (replacementDelegationRequiresSuccess()) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Replacement backend delegation failed",
        cause: error,
      });
    }
    return { delegated: false };
  }
}

export async function tryDelegateCustomersGet(
  params: ReplacementCustomersListQuery,
  sessionAccessToken?: string | null,
) {
  if (!shouldDelegateToReplacementBackend()) {
    return null;
  }

  const token = await resolveReplacementBearerToken(
    getReplacementApiUrl(),
    sessionAccessToken,
  );
  if (!token) {
    if (replacementDelegationRequiresSuccess()) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Replacement backend delegation failed: no bearer token",
      });
    }
    return null;
  }

  try {
    return await fetchReplacementCustomersList(
      getReplacementApiUrl(),
      token,
      params,
    );
  } catch (error) {
    if (replacementDelegationRequiresSuccess()) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Replacement backend delegation failed",
        cause: error,
      });
    }
    return null;
  }
}

export type DelegateCustomerGetByIdResult =
  | { delegated: true; customer: unknown | null }
  | { delegated: false };

export async function tryDelegateCustomersGetById(
  id: string,
  sessionAccessToken?: string | null,
): Promise<DelegateCustomerGetByIdResult> {
  if (!shouldDelegateToReplacementBackend()) {
    return { delegated: false };
  }

  const token = await resolveReplacementBearerToken(
    getReplacementApiUrl(),
    sessionAccessToken,
  );
  if (!token) {
    if (replacementDelegationRequiresSuccess()) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Replacement backend delegation failed: no bearer token",
      });
    }
    return { delegated: false };
  }

  try {
    const customer = await fetchReplacementCustomerById(
      getReplacementApiUrl(),
      token,
      id,
    );
    return { delegated: true, customer };
  } catch (error) {
    if (replacementDelegationRequiresSuccess()) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Replacement backend delegation failed",
        cause: error,
      });
    }
    return { delegated: false };
  }
}

export async function tryDelegateInvoicesGet(
  params: ReplacementInvoicesListQuery,
  sessionAccessToken?: string | null,
) {
  if (!shouldDelegateToReplacementBackend()) {
    return null;
  }

  const token = await resolveReplacementBearerToken(
    getReplacementApiUrl(),
    sessionAccessToken,
  );
  if (!token) {
    if (replacementDelegationRequiresSuccess()) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Replacement backend delegation failed: no bearer token",
      });
    }
    return null;
  }

  try {
    return await fetchReplacementInvoicesList(
      getReplacementApiUrl(),
      token,
      params,
    );
  } catch (error) {
    if (replacementDelegationRequiresSuccess()) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Replacement backend delegation failed",
        cause: error,
      });
    }
    return null;
  }
}

export type DelegateInvoiceGetByIdResult =
  | { delegated: true; invoice: unknown | null }
  | { delegated: false };

export async function tryDelegateInvoicesGetById(
  id: string,
  sessionAccessToken?: string | null,
): Promise<DelegateInvoiceGetByIdResult> {
  if (!shouldDelegateToReplacementBackend()) {
    return { delegated: false };
  }

  const token = await resolveReplacementBearerToken(
    getReplacementApiUrl(),
    sessionAccessToken,
  );
  if (!token) {
    if (replacementDelegationRequiresSuccess()) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Replacement backend delegation failed: no bearer token",
      });
    }
    return { delegated: false };
  }

  try {
    const invoice = await fetchReplacementInvoiceById(
      getReplacementApiUrl(),
      token,
      id,
    );
    return { delegated: true, invoice };
  } catch (error) {
    if (replacementDelegationRequiresSuccess()) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Replacement backend delegation failed",
        cause: error,
      });
    }
    return { delegated: false };
  }
}

export async function tryDelegateInvoicePaymentStatus(
  sessionAccessToken?: string | null,
) {
  if (!shouldDelegateToReplacementBackend()) {
    return null;
  }

  const token = await resolveReplacementBearerToken(
    getReplacementApiUrl(),
    sessionAccessToken,
  );
  if (!token) {
    if (replacementDelegationRequiresSuccess()) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Replacement backend delegation failed: no bearer token",
      });
    }
    return null;
  }

  try {
    return await fetchReplacementInvoicePaymentStatus(
      getReplacementApiUrl(),
      token,
    );
  } catch (error) {
    if (replacementDelegationRequiresSuccess()) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Replacement backend delegation failed",
        cause: error,
      });
    }
    return null;
  }
}

export async function tryDelegateInvoiceSummary(
  params: ReplacementInvoiceSummaryQuery,
  sessionAccessToken?: string | null,
) {
  if (!shouldDelegateToReplacementBackend()) {
    return null;
  }

  const token = await resolveReplacementBearerToken(
    getReplacementApiUrl(),
    sessionAccessToken,
  );
  if (!token) {
    if (replacementDelegationRequiresSuccess()) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Replacement backend delegation failed: no bearer token",
      });
    }
    return null;
  }

  try {
    return await fetchReplacementInvoiceSummary(
      getReplacementApiUrl(),
      token,
      params,
    );
  } catch (error) {
    if (replacementDelegationRequiresSuccess()) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Replacement backend delegation failed",
        cause: error,
      });
    }
    return null;
  }
}

export async function tryDelegateSearchGlobal(
  params: ReplacementGlobalSearchQuery,
  sessionAccessToken?: string | null,
) {
  if (!shouldDelegateToReplacementBackend()) {
    return null;
  }

  const token = await resolveReplacementBearerToken(
    getReplacementApiUrl(),
    sessionAccessToken,
  );
  if (!token) {
    if (replacementDelegationRequiresSuccess()) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Replacement backend delegation failed: no bearer token",
      });
    }
    return null;
  }

  try {
    return await fetchReplacementSearchGlobal(
      getReplacementApiUrl(),
      token,
      params,
    );
  } catch (error) {
    if (replacementDelegationRequiresSuccess()) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Replacement backend delegation failed",
        cause: error,
      });
    }
    return null;
  }
}

export async function tryDelegateTransactionsGetById(
  id: string,
  sessionAccessToken?: string | null,
): Promise<DelegateTransactionsGetByIdResult> {
  if (!shouldDelegateToReplacementBackend()) {
    return { delegated: false };
  }

  const token = await resolveReplacementBearerToken(
    getReplacementApiUrl(),
    sessionAccessToken,
  );
  if (!token) {
    if (replacementDelegationRequiresSuccess()) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Replacement backend delegation failed: no bearer token",
      });
    }
    return { delegated: false };
  }

  try {
    const baseUrl = getReplacementApiUrl();
    const transaction = await fetchReplacementTransactionById(
      baseUrl,
      token,
      id,
    );
    return { delegated: true, transaction };
  } catch (error) {
    if (replacementDelegationRequiresSuccess()) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Replacement backend delegation failed",
        cause: error,
      });
    }
    return { delegated: false };
  }
}

async function tryDelegateReplacementRead<T>(
  sessionAccessToken: string | null | undefined,
  run: (baseUrl: string, token: string) => Promise<T>,
): Promise<T | null> {
  if (!shouldDelegateToReplacementBackend()) {
    return null;
  }

  const token = await resolveReplacementBearerToken(
    getReplacementApiUrl(),
    sessionAccessToken,
  );
  if (!token) {
    if (replacementDelegationRequiresSuccess()) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Replacement backend delegation failed: no bearer token",
      });
    }
    return null;
  }

  try {
    return await run(getReplacementApiUrl(), token);
  } catch (error) {
    if (replacementDelegationRequiresSuccess()) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Replacement backend delegation failed",
        cause: error,
      });
    }
    return null;
  }
}

export async function tryDelegateDocumentsGetRelated(
  id: string,
  pageSize: number,
  sessionAccessToken?: string | null,
) {
  return tryDelegateReplacementRead(sessionAccessToken, (baseUrl, token) =>
    fetchReplacementRelatedDocuments(baseUrl, token, id, pageSize),
  );
}

export async function tryDelegateReportsRevenue(
  input: ReplacementReportDateRangeQuery,
  sessionAccessToken?: string | null,
) {
  return tryDelegateReplacementRead(sessionAccessToken, (baseUrl, token) =>
    fetchReplacementReportsRevenue(baseUrl, token, input),
  );
}

export async function tryDelegateReportsProfit(
  input: ReplacementReportDateRangeQuery,
  sessionAccessToken?: string | null,
) {
  return tryDelegateReplacementRead(sessionAccessToken, (baseUrl, token) =>
    fetchReplacementReportsProfit(baseUrl, token, input),
  );
}

export async function tryDelegateReportsBurnRate(
  input: ReplacementReportDateRangeQuery,
  sessionAccessToken?: string | null,
) {
  return tryDelegateReplacementRead(sessionAccessToken, (baseUrl, token) =>
    fetchReplacementReportsBurnRate(baseUrl, token, input),
  );
}

export async function tryDelegateReportsRunway(
  currency: string | null | undefined,
  sessionAccessToken?: string | null,
) {
  return tryDelegateReplacementRead(sessionAccessToken, (baseUrl, token) =>
    fetchReplacementReportsRunway(baseUrl, token, currency),
  );
}

export async function tryDelegateReportsExpense(
  input: ReplacementReportDateRangeQuery,
  sessionAccessToken?: string | null,
) {
  return tryDelegateReplacementRead(sessionAccessToken, (baseUrl, token) =>
    fetchReplacementReportsExpense(baseUrl, token, input),
  );
}

export async function tryDelegateReportsSpending(
  input: ReplacementReportDateRangeQuery,
  sessionAccessToken?: string | null,
) {
  return tryDelegateReplacementRead(sessionAccessToken, (baseUrl, token) =>
    fetchReplacementReportsSpending(baseUrl, token, input),
  );
}

export async function tryDelegateReportsTaxSummary(
  input: ReplacementTaxSummaryQuery,
  sessionAccessToken?: string | null,
) {
  return tryDelegateReplacementRead(sessionAccessToken, (baseUrl, token) =>
    fetchReplacementReportsTaxSummary(baseUrl, token, input),
  );
}

export async function tryDelegateReportsAccountBalances(
  currency: string | null | undefined,
  sessionAccessToken?: string | null,
) {
  return tryDelegateReplacementRead(sessionAccessToken, (baseUrl, token) =>
    fetchReplacementReportsAccountBalances(baseUrl, token, currency),
  );
}

async function tryDelegateReplacementPublicRead<T>(
  run: (baseUrl: string) => Promise<T>,
): Promise<T | null> {
  if (!shouldDelegateToReplacementBackend()) {
    return null;
  }

  try {
    return await run(getReplacementApiUrl());
  } catch (error) {
    if (error instanceof ReplacementPublicFetchError) {
      if (error.status === 404) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: error.message,
        });
      }
      if (error.status === 400) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message,
        });
      }
    }
    if (replacementDelegationRequiresSuccess()) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Replacement backend delegation failed",
        cause: error,
      });
    }
    return null;
  }
}

export async function tryDelegateReportsRevenueForecast(
  input: ReplacementRevenueForecastQuery,
  sessionAccessToken?: string | null,
) {
  return tryDelegateReplacementRead(sessionAccessToken, (baseUrl, token) =>
    fetchReplacementReportsRevenueForecast(baseUrl, token, input),
  );
}

export async function tryDelegateReportsGetByLinkId(linkId: string) {
  return tryDelegateReplacementPublicRead((baseUrl) =>
    fetchReplacementReportByLinkId(baseUrl, linkId),
  );
}

export async function tryDelegateReportsGetChartDataByLinkId(linkId: string) {
  return tryDelegateReplacementPublicRead((baseUrl) =>
    fetchReplacementReportChartByLinkId(baseUrl, linkId),
  );
}

export async function tryDelegateSearchAttachments(
  input: ReplacementSearchAttachmentsQuery,
  sessionAccessToken?: string | null,
) {
  return tryDelegateReplacementRead(sessionAccessToken, (baseUrl, token) =>
    fetchReplacementSearchAttachments(baseUrl, token, input),
  );
}

export async function tryDelegateTrackerProjectsGet(
  input: ReplacementTrackerProjectsListQuery,
  sessionAccessToken?: string | null,
) {
  return tryDelegateReplacementRead(sessionAccessToken, (baseUrl, token) =>
    fetchReplacementTrackerProjects(baseUrl, token, input),
  );
}

export async function tryDelegateTrackerEntriesByRange(
  input: ReplacementTrackerEntriesByRangeQuery,
  sessionAccessToken?: string | null,
) {
  return tryDelegateReplacementRead(sessionAccessToken, (baseUrl, token) =>
    fetchReplacementTrackerEntriesByRange(baseUrl, token, input),
  );
}

export async function tryDelegateTrackerBillableHours(
  input: ReplacementTrackerBillableHoursQuery,
  sessionAccessToken?: string | null,
) {
  return tryDelegateReplacementRead(sessionAccessToken, (baseUrl, token) =>
    fetchReplacementTrackerBillableHours(baseUrl, token, input),
  );
}

export async function tryDelegateBankConnectionsGet(
  input: ReplacementBankConnectionsListQuery,
  sessionAccessToken?: string | null,
) {
  return tryDelegateReplacementRead(sessionAccessToken, (baseUrl, token) =>
    fetchReplacementBankConnections(baseUrl, token, input),
  );
}

export async function tryDelegateInvoiceGetByToken(id: string) {
  return tryDelegateReplacementPublicRead((baseUrl) =>
    fetchReplacementInvoicePublicById(baseUrl, id),
  );
}

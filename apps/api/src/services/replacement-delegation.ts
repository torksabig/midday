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
  fetchReplacementTrackerEntriesByDate,
  fetchReplacementTrackerProjectById,
  fetchReplacementTrackerCurrentTimer,
  fetchReplacementTrackerTimerStatus,
  fetchReplacementTrackerStartTimer,
  fetchReplacementTrackerStopTimer,
  fetchReplacementAccountingSyncStatus,
  fetchReplacementAccountingConnections,
  fetchReplacementBankConnections,
  fetchReplacementUserInvites,
  fetchReplacementBankAccountsBalances,
  fetchReplacementBankAccountsCurrencies,
  fetchReplacementDocumentTags,
  fetchReplacementTags,
  fetchReplacementBankAccountTransactionCount,
  fetchReplacementTransactionUpdate,
  fetchReplacementTransactionsUpdateMany,
  fetchReplacementNotificationsList,
  fetchReplacementNotificationUpdateStatus,
  fetchReplacementNotificationsUpdateAll,
  fetchReplacementUserUpdate,
  fetchReplacementTeamUpdate,
  fetchReplacementTagCreate,
  fetchReplacementTagUpdate,
  fetchReplacementTagDelete,
  fetchReplacementDocumentTagCreate,
  fetchReplacementDocumentTagDelete,
  fetchReplacementDocumentTagAssignmentCreate,
  fetchReplacementDocumentTagAssignmentDelete,
  fetchReplacementTransactionTagCreate,
  fetchReplacementTransactionTagDelete,
  fetchReplacementCustomerDelete,
  fetchReplacementCategoryById,
  fetchReplacementSearchInvoiceNumber,
  fetchReplacementNotificationSettings,
  fetchReplacementDocumentCheckAttachments,
  fetchReplacementDocumentDelete,
  fetchReplacementApiKeys,
  fetchReplacementTeamConnectionStatus,
  fetchReplacementInboxUpdate,
  fetchReplacementInvoiceUpdate,
  fetchReplacementAppsGet,
  fetchReplacementOAuthApplicationsList,
  fetchReplacementInboxAccountsGet,
  fetchReplacementTransactionsDeleteMany,
  fetchReplacementInboxMatch,
  fetchReplacementInboxDelete,
  fetchReplacementInboxDeleteMany,
  fetchReplacementTeamMembers,
  fetchReplacementTeamList,
  fetchReplacementTeamInvites,
  type ReplacementNotificationsListQuery,
  fetchReplacementMostActiveClient,
  fetchReplacementInactiveClientsCount,
  fetchReplacementAverageDaysToPayment,
  fetchReplacementAverageInvoiceSize,
  fetchReplacementTopRevenueClient,
  fetchReplacementNewCustomersCount,
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
  type ReplacementTransactionUpdateInput,
  type ReplacementInvoiceUpdateInput,
  type ReplacementTrackerProjectsListQuery,
  type ReplacementTrackerEntriesByRangeQuery,
  type ReplacementTrackerBillableHoursQuery,
  type ReplacementTrackerEntriesByDateQuery,
  type ReplacementTrackerTimerQuery,
  type ReplacementStartTimerInput,
  type ReplacementStopTimerInput,
  type ReplacementAccountingSyncStatusQuery,
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

/**
 * AP-20: procedure/router is 100% on Rust — dual may not fall back to Drizzle.
 * Legacy mode still uses Drizzle (callers only invoke this after shouldDelegate).
 */
export function assertNoLegacyFallback(procedurePath: string): never {
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: `Replacement backend delegation failed (legacy fallback removed for ${procedurePath})`,
  });
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

export async function tryDelegateTrackerEntriesByDate(
  input: ReplacementTrackerEntriesByDateQuery,
  sessionAccessToken?: string | null,
) {
  return tryDelegateReplacementRead(sessionAccessToken, (baseUrl, token) =>
    fetchReplacementTrackerEntriesByDate(baseUrl, token, input),
  );
}

export type DelegateTrackerProjectGetByIdResult =
  | { delegated: false }
  | { delegated: true; project: unknown | null };

export async function tryDelegateTrackerProjectGetById(
  id: string,
  sessionAccessToken?: string | null,
): Promise<DelegateTrackerProjectGetByIdResult> {
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
    const project = await fetchReplacementTrackerProjectById(
      getReplacementApiUrl(),
      token,
      id,
    );
    return { delegated: true, project };
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

export type DelegateTrackerCurrentTimerResult =
  | { delegated: false }
  | { delegated: true; timer: unknown | null };

export async function tryDelegateTrackerCurrentTimer(
  input: ReplacementTrackerTimerQuery,
  sessionAccessToken?: string | null,
): Promise<DelegateTrackerCurrentTimerResult> {
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
    const timer = await fetchReplacementTrackerCurrentTimer(
      getReplacementApiUrl(),
      token,
      input,
    );
    return { delegated: true, timer };
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

export async function tryDelegateTrackerTimerStatus(
  input: ReplacementTrackerTimerQuery,
  sessionAccessToken?: string | null,
) {
  return tryDelegateReplacementRead(sessionAccessToken, (baseUrl, token) =>
    fetchReplacementTrackerTimerStatus(baseUrl, token, input),
  );
}

export type DelegateTrackerTimerMutationResult =
  | { delegated: false }
  | { delegated: true; entry: unknown };

export async function tryDelegateTrackerStartTimer(
  input: ReplacementStartTimerInput,
  sessionAccessToken?: string | null,
): Promise<DelegateTrackerTimerMutationResult> {
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
    const entry = await fetchReplacementTrackerStartTimer(
      getReplacementApiUrl(),
      token,
      input,
    );
    return { delegated: true, entry };
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

export async function tryDelegateTrackerStopTimer(
  input: ReplacementStopTimerInput,
  sessionAccessToken?: string | null,
): Promise<DelegateTrackerTimerMutationResult> {
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
    const entry = await fetchReplacementTrackerStopTimer(
      getReplacementApiUrl(),
      token,
      input,
    );
    return { delegated: true, entry };
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

export async function tryDelegateAccountingSyncStatus(
  input: ReplacementAccountingSyncStatusQuery,
  sessionAccessToken?: string | null,
) {
  return tryDelegateReplacementRead(sessionAccessToken, (baseUrl, token) =>
    fetchReplacementAccountingSyncStatus(baseUrl, token, input),
  );
}

export async function tryDelegateAccountingConnections(
  sessionAccessToken?: string | null,
) {
  return tryDelegateReplacementRead(sessionAccessToken, (baseUrl, token) =>
    fetchReplacementAccountingConnections(baseUrl, token),
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

export async function tryDelegateUserInvites(
  sessionAccessToken?: string | null,
) {
  return tryDelegateReplacementRead(sessionAccessToken, (baseUrl, token) =>
    fetchReplacementUserInvites(baseUrl, token),
  );
}

export async function tryDelegateBankAccountsBalances(
  sessionAccessToken?: string | null,
) {
  return tryDelegateReplacementRead(sessionAccessToken, (baseUrl, token) =>
    fetchReplacementBankAccountsBalances(baseUrl, token),
  );
}

export async function tryDelegateBankAccountsCurrencies(
  sessionAccessToken?: string | null,
) {
  return tryDelegateReplacementRead(sessionAccessToken, (baseUrl, token) =>
    fetchReplacementBankAccountsCurrencies(baseUrl, token),
  );
}

export async function tryDelegateDocumentTagsGet(
  sessionAccessToken?: string | null,
) {
  return tryDelegateReplacementRead(sessionAccessToken, (baseUrl, token) =>
    fetchReplacementDocumentTags(baseUrl, token),
  );
}

export async function tryDelegateTagsGet(sessionAccessToken?: string | null) {
  return tryDelegateReplacementRead(sessionAccessToken, (baseUrl, token) =>
    fetchReplacementTags(baseUrl, token),
  );
}

export async function tryDelegateBankAccountsGetTransactionCount(
  bankAccountId: string,
  sessionAccessToken?: string | null,
) {
  return tryDelegateReplacementRead(sessionAccessToken, (baseUrl, token) =>
    fetchReplacementBankAccountTransactionCount(baseUrl, token, bankAccountId),
  );
}

export type DelegateTransactionUpdateResult =
  | { delegated: false }
  | { delegated: true; transaction: MiddayTransactionByIdShape | null };

export async function tryDelegateTransactionUpdate(
  input: ReplacementTransactionUpdateInput,
  sessionAccessToken?: string | null,
): Promise<DelegateTransactionUpdateResult> {
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
    const transaction = await fetchReplacementTransactionUpdate(
      getReplacementApiUrl(),
      token,
      input,
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

export type DelegateNullableReadResult<T> =
  | { delegated: false }
  | { delegated: true; value: T | null };

async function tryDelegateNullableReplacementRead<T>(
  sessionAccessToken: string | null | undefined,
  run: (baseUrl: string, token: string) => Promise<T | null>,
): Promise<DelegateNullableReadResult<T>> {
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
    const value = await run(getReplacementApiUrl(), token);
    return { delegated: true, value };
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

export async function tryDelegateMostActiveClient(
  sessionAccessToken?: string | null,
): Promise<DelegateNullableReadResult<unknown>> {
  return tryDelegateNullableReplacementRead(sessionAccessToken, (baseUrl, token) =>
    fetchReplacementMostActiveClient(baseUrl, token),
  );
}

export async function tryDelegateInactiveClientsCount(
  sessionAccessToken?: string | null,
) {
  return tryDelegateReplacementRead(sessionAccessToken, (baseUrl, token) =>
    fetchReplacementInactiveClientsCount(baseUrl, token),
  );
}

export async function tryDelegateAverageDaysToPayment(
  sessionAccessToken?: string | null,
) {
  return tryDelegateReplacementRead(sessionAccessToken, (baseUrl, token) =>
    fetchReplacementAverageDaysToPayment(baseUrl, token),
  );
}

export async function tryDelegateAverageInvoiceSize(
  sessionAccessToken?: string | null,
) {
  return tryDelegateReplacementRead(sessionAccessToken, (baseUrl, token) =>
    fetchReplacementAverageInvoiceSize(baseUrl, token),
  );
}

export async function tryDelegateTopRevenueClient(
  sessionAccessToken?: string | null,
): Promise<DelegateNullableReadResult<unknown>> {
  return tryDelegateNullableReplacementRead(sessionAccessToken, (baseUrl, token) =>
    fetchReplacementTopRevenueClient(baseUrl, token),
  );
}

export async function tryDelegateNewCustomersCount(
  sessionAccessToken?: string | null,
) {
  return tryDelegateReplacementRead(sessionAccessToken, (baseUrl, token) =>
    fetchReplacementNewCustomersCount(baseUrl, token),
  );
}

export async function tryDelegateNotificationsList(
  input: ReplacementNotificationsListQuery,
  sessionAccessToken?: string | null,
) {
  return tryDelegateReplacementRead(sessionAccessToken, (baseUrl, token) =>
    fetchReplacementNotificationsList(baseUrl, token, input),
  );
}

export type DelegateNotificationUpdateStatusResult =
  | { delegated: false }
  | { delegated: true; notification: unknown | null };

export async function tryDelegateNotificationUpdateStatus(
  activityId: string,
  status: "unread" | "read" | "archived",
  sessionAccessToken?: string | null,
): Promise<DelegateNotificationUpdateStatusResult> {
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
    const notification = await fetchReplacementNotificationUpdateStatus(
      getReplacementApiUrl(),
      token,
      activityId,
      status,
    );
    return { delegated: true, notification };
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

export type DelegateNotificationsUpdateAllResult =
  | { delegated: false }
  | { delegated: true; notifications: unknown[] };

export async function tryDelegateNotificationsUpdateAll(
  status: "unread" | "read" | "archived",
  sessionAccessToken?: string | null,
): Promise<DelegateNotificationsUpdateAllResult> {
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
    const notifications = await fetchReplacementNotificationsUpdateAll(
      getReplacementApiUrl(),
      token,
      status,
    );
    return { delegated: true, notifications };
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

export type DelegateUserUpdateResult =
  | { delegated: false }
  | { delegated: true; user: unknown | null };

export async function tryDelegateUserUpdate(
  input: Record<string, unknown>,
  sessionAccessToken?: string | null,
): Promise<DelegateUserUpdateResult> {
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
    const user = await fetchReplacementUserUpdate(
      getReplacementApiUrl(),
      token,
      input,
    );
    return { delegated: true, user };
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

export type DelegateTeamUpdateResult =
  | { delegated: false }
  | { delegated: true; team: unknown | null };

export async function tryDelegateTeamUpdate(
  input: Record<string, unknown>,
  sessionAccessToken?: string | null,
): Promise<DelegateTeamUpdateResult> {
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
    const team = await fetchReplacementTeamUpdate(
      getReplacementApiUrl(),
      token,
      input,
    );
    return { delegated: true, team };
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

export type DelegateTagMutationResult =
  | { delegated: false }
  | { delegated: true; tag: { id: string; name: string } | null };

export async function tryDelegateTagCreate(
  name: string,
  sessionAccessToken?: string | null,
): Promise<DelegateTagMutationResult> {
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
    const tag = await fetchReplacementTagCreate(
      getReplacementApiUrl(),
      token,
      name,
    );
    return { delegated: true, tag };
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

export async function tryDelegateTagUpdate(
  id: string,
  name: string,
  sessionAccessToken?: string | null,
): Promise<DelegateTagMutationResult> {
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
    const tag = await fetchReplacementTagUpdate(
      getReplacementApiUrl(),
      token,
      id,
      name,
    );
    return { delegated: true, tag };
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

export async function tryDelegateTagDelete(
  id: string,
  sessionAccessToken?: string | null,
): Promise<DelegateTagMutationResult> {
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
    const tag = await fetchReplacementTagDelete(
      getReplacementApiUrl(),
      token,
      id,
    );
    return { delegated: true, tag };
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

export type DelegateDocumentTagCreateResult =
  | { delegated: false }
  | {
      delegated: true;
      tag: { id: string; name: string; slug: string } | null;
    };

export async function tryDelegateDocumentTagCreate(
  name: string,
  slug: string,
  sessionAccessToken?: string | null,
): Promise<DelegateDocumentTagCreateResult> {
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
    const tag = await fetchReplacementDocumentTagCreate(
      getReplacementApiUrl(),
      token,
      name,
      slug,
    );
    return { delegated: true, tag };
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

export type DelegateDocumentTagDeleteResult =
  | { delegated: false }
  | { delegated: true; tag: { id: string } | null };

export async function tryDelegateDocumentTagDelete(
  id: string,
  sessionAccessToken?: string | null,
): Promise<DelegateDocumentTagDeleteResult> {
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
    const tag = await fetchReplacementDocumentTagDelete(
      getReplacementApiUrl(),
      token,
      id,
    );
    return { delegated: true, tag };
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

export type DelegateDocumentTagAssignmentResult =
  | { delegated: false }
  | {
      delegated: true;
      assignment: {
        documentId: string;
        tagId: string;
        teamId: string;
      } | null;
    };

export async function tryDelegateDocumentTagAssignmentCreate(
  documentId: string,
  tagId: string,
  sessionAccessToken?: string | null,
): Promise<DelegateDocumentTagAssignmentResult> {
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
    const assignment = await fetchReplacementDocumentTagAssignmentCreate(
      getReplacementApiUrl(),
      token,
      documentId,
      tagId,
    );
    return { delegated: true, assignment };
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

export async function tryDelegateDocumentTagAssignmentDelete(
  documentId: string,
  tagId: string,
  sessionAccessToken?: string | null,
): Promise<DelegateDocumentTagAssignmentResult> {
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
    const assignment = await fetchReplacementDocumentTagAssignmentDelete(
      getReplacementApiUrl(),
      token,
      documentId,
      tagId,
    );
    return { delegated: true, assignment };
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

export type DelegateTransactionTagCreateResult =
  | { delegated: false }
  | { delegated: true; rows: unknown };

export async function tryDelegateTransactionTagCreate(
  transactionId: string,
  tagId: string,
  sessionAccessToken?: string | null,
): Promise<DelegateTransactionTagCreateResult> {
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
    const rows = await fetchReplacementTransactionTagCreate(
      getReplacementApiUrl(),
      token,
      transactionId,
      tagId,
    );
    return { delegated: true, rows };
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

export type DelegateTransactionTagDeleteResult =
  | { delegated: false }
  | { delegated: true; result: Record<string, unknown> };

export async function tryDelegateTransactionTagDelete(
  transactionId: string,
  tagId: string,
  sessionAccessToken?: string | null,
): Promise<DelegateTransactionTagDeleteResult> {
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
    const result = await fetchReplacementTransactionTagDelete(
      getReplacementApiUrl(),
      token,
      transactionId,
      tagId,
    );
    return { delegated: true, result };
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

export type DelegateCustomerDeleteResult =
  | { delegated: false }
  | { delegated: true; customer: unknown | null };

export async function tryDelegateCustomerDelete(
  id: string,
  sessionAccessToken?: string | null,
): Promise<DelegateCustomerDeleteResult> {
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
    const customer = await fetchReplacementCustomerDelete(
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

export type DelegateCategoryByIdResult =
  | { delegated: false }
  | { delegated: true; category: unknown | null };

export async function tryDelegateTransactionCategoriesGetById(
  id: string,
  sessionAccessToken?: string | null,
): Promise<DelegateCategoryByIdResult> {
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
    const category = await fetchReplacementCategoryById(
      getReplacementApiUrl(),
      token,
      id,
    );
    return { delegated: true, category };
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

export async function tryDelegateSearchInvoiceNumber(
  query: string,
  sessionAccessToken?: string | null,
): Promise<DelegateNullableReadResult<{ invoiceNumber: string }>> {
  return tryDelegateNullableReplacementRead(sessionAccessToken, (baseUrl, token) =>
    fetchReplacementSearchInvoiceNumber(baseUrl, token, query),
  );
}

export async function tryDelegateNotificationSettingsGet(
  input: { notificationType?: string; channel?: string },
  sessionAccessToken?: string | null,
) {
  return tryDelegateReplacementRead(sessionAccessToken, (baseUrl, token) =>
    fetchReplacementNotificationSettings(baseUrl, token, input),
  );
}

export async function tryDelegateDocumentsCheckAttachments(
  id: string,
  sessionAccessToken?: string | null,
) {
  return tryDelegateReplacementRead(sessionAccessToken, (baseUrl, token) =>
    fetchReplacementDocumentCheckAttachments(baseUrl, token, id),
  );
}

export type DelegateDocumentDeleteResult =
  | { delegated: false }
  | { delegated: true; document: { id: string; pathTokens: string[] | null } | null };

export async function tryDelegateDocumentsDelete(
  id: string,
  sessionAccessToken?: string | null,
): Promise<DelegateDocumentDeleteResult> {
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
    const document = await fetchReplacementDocumentDelete(
      getReplacementApiUrl(),
      token,
      id,
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

export async function tryDelegateApiKeysGet(
  sessionAccessToken?: string | null,
) {
  return tryDelegateReplacementRead(sessionAccessToken, (baseUrl, token) =>
    fetchReplacementApiKeys(baseUrl, token),
  );
}

export async function tryDelegateTeamConnectionStatus(
  sessionAccessToken?: string | null,
) {
  return tryDelegateReplacementRead(sessionAccessToken, (baseUrl, token) =>
    fetchReplacementTeamConnectionStatus(baseUrl, token),
  );
}

export async function tryDelegateTransactionsUpdateMany(
  input: Record<string, unknown>,
  sessionAccessToken?: string | null,
) {
  return tryDelegateReplacementRead(sessionAccessToken, (baseUrl, token) =>
    fetchReplacementTransactionsUpdateMany(baseUrl, token, input),
  );
}

export type DelegateInboxUpdateResult =
  | { delegated: false }
  | { delegated: true; item: MiddayInboxByIdShape | null };

export async function tryDelegateInboxUpdate(
  id: string,
  body: Record<string, unknown>,
  sessionAccessToken?: string | null,
): Promise<DelegateInboxUpdateResult> {
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
    const item = await fetchReplacementInboxUpdate(
      getReplacementApiUrl(),
      token,
      id,
      body,
    );
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

export type DelegateInvoiceUpdateResult =
  | { delegated: false }
  | { delegated: true; invoice: unknown | null };

export async function tryDelegateInvoiceUpdate(
  input: ReplacementInvoiceUpdateInput,
  sessionAccessToken?: string | null,
): Promise<DelegateInvoiceUpdateResult> {
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
    const invoice = await fetchReplacementInvoiceUpdate(
      getReplacementApiUrl(),
      token,
      input,
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

export async function tryDelegateTeamMembers(
  sessionAccessToken?: string | null,
) {
  return tryDelegateReplacementRead(sessionAccessToken, (baseUrl, token) =>
    fetchReplacementTeamMembers(baseUrl, token),
  );
}

export async function tryDelegateTeamList(
  sessionAccessToken?: string | null,
) {
  return tryDelegateReplacementRead(sessionAccessToken, (baseUrl, token) =>
    fetchReplacementTeamList(baseUrl, token),
  );
}

export async function tryDelegateTeamInvites(
  sessionAccessToken?: string | null,
) {
  return tryDelegateReplacementRead(sessionAccessToken, (baseUrl, token) =>
    fetchReplacementTeamInvites(baseUrl, token),
  );
}

export async function tryDelegateAppsGet(
  sessionAccessToken?: string | null,
) {
  return tryDelegateReplacementRead(sessionAccessToken, (baseUrl, token) =>
    fetchReplacementAppsGet(baseUrl, token),
  );
}

export async function tryDelegateOAuthApplicationsList(
  sessionAccessToken?: string | null,
) {
  return tryDelegateReplacementRead(sessionAccessToken, (baseUrl, token) =>
    fetchReplacementOAuthApplicationsList(baseUrl, token),
  );
}

export async function tryDelegateInboxAccountsGet(
  sessionAccessToken?: string | null,
) {
  return tryDelegateReplacementRead(sessionAccessToken, (baseUrl, token) =>
    fetchReplacementInboxAccountsGet(baseUrl, token),
  );
}

export async function tryDelegateTransactionsDeleteMany(
  ids: string[],
  sessionAccessToken?: string | null,
) {
  return tryDelegateReplacementRead(sessionAccessToken, (baseUrl, token) =>
    fetchReplacementTransactionsDeleteMany(baseUrl, token, ids),
  );
}

export type DelegateInboxMatchResult =
  | { delegated: false }
  | { delegated: true; item: MiddayInboxByIdShape | null };

export async function tryDelegateInboxMatch(
  id: string,
  transactionId: string,
  sessionAccessToken?: string | null,
): Promise<DelegateInboxMatchResult> {
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
    const item = await fetchReplacementInboxMatch(
      getReplacementApiUrl(),
      token,
      id,
      transactionId,
    );
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

export async function tryDelegateInboxDelete(
  id: string,
  sessionAccessToken?: string | null,
) {
  return tryDelegateReplacementRead(sessionAccessToken, (baseUrl, token) =>
    fetchReplacementInboxDelete(baseUrl, token, id),
  );
}

export async function tryDelegateInboxDeleteMany(
  ids: string[],
  sessionAccessToken?: string | null,
) {
  return tryDelegateReplacementRead(sessionAccessToken, (baseUrl, token) =>
    fetchReplacementInboxDeleteMany(baseUrl, token, ids),
  );
}

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
  fetchReplacementTrackerEntriesUpsert,
  fetchReplacementTrackerEntryDelete,
  fetchReplacementInvoiceDelete,
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
  fetchReplacementCustomerUpsert,
  fetchReplacementNotificationSettingUpsert,
  fetchReplacementNotificationSettingsBulkUpdate,
  type ReplacementCustomerUpsertInput,
  fetchReplacementCategoryById,
  fetchReplacementSearchInvoiceNumber,
  fetchReplacementNotificationSettings,
  fetchReplacementDocumentCheckAttachments,
  fetchReplacementDocumentDelete,
  fetchReplacementApiKeys,
  fetchReplacementTeamConnectionStatus,
  fetchReplacementInboxUpdate,
  fetchReplacementInvoiceUpdate,
  fetchReplacementInvoiceDraft,
  fetchReplacementInvoiceDuplicate,
  fetchReplacementInvoiceProducts,
  fetchReplacementInvoiceProductById,
  fetchReplacementInvoiceProductDelete,
  fetchReplacementInvoiceProductIncrementUsage,
  fetchReplacementInvoiceProductCreate,
  fetchReplacementInvoiceProductUpsert,
  fetchReplacementInvoiceProductUpdate,
  fetchReplacementInvoiceProductSaveLineItem,
  type ReplacementInvoiceProductCreateInput,
  type ReplacementInvoiceProductUpsertInput,
  type ReplacementInvoiceProductUpdateInput,
  type ReplacementSaveLineItemAsProductInput,
  fetchReplacementInvoiceTemplates,
  fetchReplacementInvoiceTemplateById,
  fetchReplacementInvoiceTemplateCount,
  fetchReplacementInvoiceTemplateCreate,
  fetchReplacementInvoiceTemplateUpsert,
  fetchReplacementInvoiceTemplateSetDefault,
  fetchReplacementInvoiceTemplateDelete,
  type ReplacementInvoiceProductsQuery,
  fetchReplacementCategoryCreate,
  fetchReplacementCategoryUpdate,
  fetchReplacementCategoryDelete,
  type ReplacementCategoryCreateInput,
  type ReplacementCategoryUpdateInput,
  fetchReplacementAppsGet,
  fetchReplacementAppsDisconnect,
  fetchReplacementAppsUpdate,
  fetchReplacementAppsUpdateSettings,
  fetchReplacementAppsRemoveWhatsApp,
  fetchReplacementAppsCreatePlatformLinkToken,
  fetchReplacementInboxCreate,
  fetchReplacementInvoiceDefaultSettingsData,
  fetchReplacementBankAccountGetById,
  fetchReplacementInboxAccountDelete,
  fetchReplacementCustomerStartEnrichment,
  fetchReplacementDocumentProcessingStatus,
  fetchReplacementDocumentsProcessingStatus,
  fetchReplacementAppByAppId,
  fetchReplacementTeamCreateInvites,
  fetchReplacementInboxAccountById,
  type ReplacementAppsUpdateInput,
  type ReplacementAppsUpdateSettingsInput,
  type ReplacementRemoveWhatsAppInput,
  type ReplacementPlatformLinkTokenInput,
  type ReplacementInboxCreateInput,
  type ReplacementInvoiceDefaultSettingsData,
  fetchReplacementInboxBlocklist,
  fetchReplacementInboxBlocklistCreate,
  fetchReplacementInboxBlocklistDelete,
  type ReplacementInboxBlocklistCreateInput,
  fetchReplacementApiKeyDelete,
  fetchReplacementReportCreate,
  type ReplacementReportCreateInput,
  fetchReplacementTeamAcceptInvite,
  fetchReplacementTeamDeclineInvite,
  fetchReplacementTeamDeleteInvite,
  fetchReplacementTeamDeleteMember,
  fetchReplacementTeamUpdateMember,
  type ReplacementTeamMemberInput,
  type ReplacementTeamUpdateMemberInput,
  fetchReplacementShortLinkGet,
  fetchReplacementShortLinkCreate,
  type ReplacementShortLinkCreateInput,
  fetchReplacementInvoiceRecurringList,
  fetchReplacementInvoiceRecurringGet,
  fetchReplacementInvoiceRecurringPause,
  fetchReplacementInvoiceRecurringResume,
  fetchReplacementInvoiceRecurringDelete,
  fetchReplacementInvoiceRecurringUpcoming,
  fetchReplacementInvoiceRecurringCreate,
  fetchReplacementInvoiceRecurringUpdate,
  type ReplacementInvoiceRecurringCreateInput,
  type ReplacementInvoiceRecurringListQuery,
  fetchReplacementAccountingDisconnect,
  fetchReplacementTeamLeave,
  fetchReplacementBankAccountCreate,
  fetchReplacementBankAccountUpdate,
  fetchReplacementBankAccountDelete,
  type ReplacementBankAccountCreateInput,
  type ReplacementBankAccountUpdateInput,
  fetchReplacementInstitutionsGet,
  fetchReplacementInstitutionGetById,
  fetchReplacementInstitutionUpdateUsage,
  type ReplacementInstitutionsQuery,
  fetchReplacementOAuthAuthorized,
  fetchReplacementOAuthRevokeAccess,
  fetchReplacementAttachmentsCreateMany,
  fetchReplacementAttachmentDelete,
  type ReplacementAttachmentInput,
  fetchReplacementBankConnectionReconnect,
  type ReplacementBankConnectionReconnectInput,
  fetchReplacementOAuthApplicationsList,
  fetchReplacementOAuthApplicationGet,
  fetchReplacementOAuthApplicationCreate,
  fetchReplacementOAuthApplicationUpdate,
  fetchReplacementOAuthApplicationDelete,
  fetchReplacementOAuthApplicationRegenerateSecret,
  fetchReplacementTrackerProjectUpsert,
  fetchReplacementTrackerProjectDelete,
  type ReplacementTrackerProjectUpsertInput,
  type ReplacementOAuthAppCreateInput,
  type ReplacementOAuthAppUpdateInput,
  fetchReplacementInboxAccountsGet,
  fetchReplacementTransactionsDeleteMany,
  fetchReplacementInboxMatch,
  fetchReplacementInboxConfirmMatch,
  fetchReplacementInboxDeclineMatch,
  fetchReplacementInboxUnmatch,
  fetchReplacementCustomerInvoiceSummary,
  fetchReplacementCustomerCancelEnrichment,
  fetchReplacementCustomerClearEnrichment,
  fetchReplacementMoveToReview,
  fetchReplacementSimilarTransactions,
  fetchReplacementSearchTransactionMatch,
  fetchReplacementCreateTransaction,
  type ReplacementSearchTransactionMatchQuery,
  type ReplacementCreateTransactionInput,
  fetchReplacementTogglePortal,
  fetchReplacementApplicationInfo,
  fetchReplacementPortalCustomer,
  fetchReplacementPortalInvoices,
  fetchReplacementAvailablePlans,
  fetchReplacementSwitchTeam,
  fetchReplacementNotificationPreferences,
  fetchReplacementBankConnectionDelete,
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
  type ReplacementTrackerUpsertInput,
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

export type DelegateTrackerUpsertResult =
  | { delegated: false }
  | { delegated: true; entries: unknown[] };

export async function tryDelegateTrackerEntriesUpsert(
  input: ReplacementTrackerUpsertInput,
  sessionAccessToken?: string | null,
): Promise<DelegateTrackerUpsertResult> {
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
    const entries = await fetchReplacementTrackerEntriesUpsert(
      getReplacementApiUrl(),
      token,
      input,
    );
    return { delegated: true, entries };
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

export type DelegateIdOnlyResult =
  | { delegated: false }
  | { delegated: true; result: { id: string } | null };

export async function tryDelegateTrackerEntryDelete(
  id: string,
  sessionAccessToken?: string | null,
): Promise<DelegateIdOnlyResult> {
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
    const result = await fetchReplacementTrackerEntryDelete(
      getReplacementApiUrl(),
      token,
      id,
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

export async function tryDelegateInvoiceDelete(
  id: string,
  sessionAccessToken?: string | null,
): Promise<DelegateIdOnlyResult> {
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
    const result = await fetchReplacementInvoiceDelete(
      getReplacementApiUrl(),
      token,
      id,
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

export type DelegateCustomerUpsertResult =
  | { delegated: false }
  | { delegated: true; customer: unknown };

export async function tryDelegateCustomerUpsert(
  input: ReplacementCustomerUpsertInput,
  sessionAccessToken?: string | null,
): Promise<DelegateCustomerUpsertResult> {
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
    const customer = await fetchReplacementCustomerUpsert(
      getReplacementApiUrl(),
      token,
      input,
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

export type DelegateNotificationSettingMutationResult =
  | { delegated: false }
  | { delegated: true; setting: unknown };

export async function tryDelegateNotificationSettingsUpdate(
  input: {
    notificationType: string;
    channel: string;
    enabled: boolean;
  },
  sessionAccessToken?: string | null,
): Promise<DelegateNotificationSettingMutationResult> {
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
    const setting = await fetchReplacementNotificationSettingUpsert(
      getReplacementApiUrl(),
      token,
      input,
    );
    return { delegated: true, setting };
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

export type DelegateNotificationSettingsBulkResult =
  | { delegated: false }
  | { delegated: true; settings: unknown[] };

export async function tryDelegateNotificationSettingsBulkUpdate(
  updates: {
    notificationType: string;
    channel: string;
    enabled: boolean;
  }[],
  sessionAccessToken?: string | null,
): Promise<DelegateNotificationSettingsBulkResult> {
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
    const settings = await fetchReplacementNotificationSettingsBulkUpdate(
      getReplacementApiUrl(),
      token,
      updates,
    );
    return { delegated: true, settings };
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

export type DelegateInvoiceDraftResult =
  | { delegated: false }
  | { delegated: true; invoice: unknown };

export async function tryDelegateInvoiceDraft(
  input: unknown,
  sessionAccessToken?: string | null,
): Promise<DelegateInvoiceDraftResult> {
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
    const invoice = await fetchReplacementInvoiceDraft(
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

export type DelegateInvoiceDuplicateResult =
  | { delegated: false }
  | { delegated: true; invoice: unknown };

export async function tryDelegateInvoiceDuplicate(
  input: { id: string; invoiceNumber: string },
  sessionAccessToken?: string | null,
): Promise<DelegateInvoiceDuplicateResult> {
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
    const invoice = await fetchReplacementInvoiceDuplicate(
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

export async function tryDelegateInvoiceProductsGet(
  params: ReplacementInvoiceProductsQuery,
  sessionAccessToken?: string | null,
) {
  return tryDelegateReplacementRead(sessionAccessToken, (baseUrl, token) =>
    fetchReplacementInvoiceProducts(baseUrl, token, params),
  );
}

export type DelegateInvoiceProductGetByIdResult =
  | { delegated: false }
  | { delegated: true; product: unknown | null };

export async function tryDelegateInvoiceProductGetById(
  id: string,
  sessionAccessToken?: string | null,
): Promise<DelegateInvoiceProductGetByIdResult> {
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
    const product = await fetchReplacementInvoiceProductById(
      getReplacementApiUrl(),
      token,
      id,
    );
    return { delegated: true, product };
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

export type DelegateInvoiceProductDeleteResult =
  | { delegated: false }
  | { delegated: true; deleted: boolean };

export async function tryDelegateInvoiceProductDelete(
  id: string,
  sessionAccessToken?: string | null,
): Promise<DelegateInvoiceProductDeleteResult> {
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
    const deleted = await fetchReplacementInvoiceProductDelete(
      getReplacementApiUrl(),
      token,
      id,
    );
    return { delegated: true, deleted };
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

export type DelegateInvoiceProductIncrementResult =
  | { delegated: false }
  | { delegated: true; result: { success: true } };

export async function tryDelegateInvoiceProductIncrementUsage(
  id: string,
  sessionAccessToken?: string | null,
): Promise<DelegateInvoiceProductIncrementResult> {
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
    const result = await fetchReplacementInvoiceProductIncrementUsage(
      getReplacementApiUrl(),
      token,
      id,
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

export type DelegateInvoiceProductMutationResult =
  | { delegated: false }
  | { delegated: true; product: unknown | null };

export async function tryDelegateInvoiceProductCreate(
  input: ReplacementInvoiceProductCreateInput,
  sessionAccessToken?: string | null,
): Promise<DelegateInvoiceProductMutationResult> {
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
    const product = await fetchReplacementInvoiceProductCreate(
      getReplacementApiUrl(),
      token,
      input,
    );
    return { delegated: true, product };
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

export async function tryDelegateInvoiceProductUpsert(
  input: ReplacementInvoiceProductUpsertInput,
  sessionAccessToken?: string | null,
): Promise<DelegateInvoiceProductMutationResult> {
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
    const product = await fetchReplacementInvoiceProductUpsert(
      getReplacementApiUrl(),
      token,
      input,
    );
    return { delegated: true, product };
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

export async function tryDelegateInvoiceProductUpdate(
  id: string,
  input: ReplacementInvoiceProductUpdateInput,
  sessionAccessToken?: string | null,
): Promise<DelegateInvoiceProductMutationResult> {
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
    const product = await fetchReplacementInvoiceProductUpdate(
      getReplacementApiUrl(),
      token,
      id,
      input,
    );
    return { delegated: true, product };
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

export type DelegateSaveLineItemAsProductResult =
  | { delegated: false }
  | {
      delegated: true;
      result: { product: unknown | null; shouldClearProductId: boolean };
    };

export async function tryDelegateInvoiceProductSaveLineItem(
  input: ReplacementSaveLineItemAsProductInput,
  sessionAccessToken?: string | null,
): Promise<DelegateSaveLineItemAsProductResult> {
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
    const result = await fetchReplacementInvoiceProductSaveLineItem(
      getReplacementApiUrl(),
      token,
      input,
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

export type DelegateAppMutationResult =
  | { delegated: false }
  | { delegated: true; app: unknown | null };

export async function tryDelegateAppsDisconnect(
  appId: string,
  sessionAccessToken?: string | null,
): Promise<DelegateAppMutationResult> {
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
    const app = await fetchReplacementAppsDisconnect(
      getReplacementApiUrl(),
      token,
      appId,
    );
    return { delegated: true, app };
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

export async function tryDelegateAppsUpdate(
  appId: string,
  input: ReplacementAppsUpdateInput,
  sessionAccessToken?: string | null,
): Promise<DelegateAppMutationResult> {
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
    const app = await fetchReplacementAppsUpdate(
      getReplacementApiUrl(),
      token,
      appId,
      input,
    );
    return { delegated: true, app };
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

export async function tryDelegateAppsUpdateSettings(
  appId: string,
  input: ReplacementAppsUpdateSettingsInput,
  sessionAccessToken?: string | null,
): Promise<DelegateAppMutationResult> {
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
    const app = await fetchReplacementAppsUpdateSettings(
      getReplacementApiUrl(),
      token,
      appId,
      input,
    );
    return { delegated: true, app };
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

export async function tryDelegateInvoiceTemplatesList(
  sessionAccessToken?: string | null,
) {
  return tryDelegateReplacementRead(sessionAccessToken, (baseUrl, token) =>
    fetchReplacementInvoiceTemplates(baseUrl, token),
  );
}

export type DelegateInvoiceTemplateGetResult =
  | { delegated: false }
  | { delegated: true; template: unknown | null };

export async function tryDelegateInvoiceTemplateGet(
  id: string,
  sessionAccessToken?: string | null,
): Promise<DelegateInvoiceTemplateGetResult> {
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
    const template = await fetchReplacementInvoiceTemplateById(
      getReplacementApiUrl(),
      token,
      id,
    );
    return { delegated: true, template };
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

export async function tryDelegateInvoiceTemplateCount(
  sessionAccessToken?: string | null,
) {
  return tryDelegateReplacementRead(sessionAccessToken, (baseUrl, token) =>
    fetchReplacementInvoiceTemplateCount(baseUrl, token),
  );
}

export type DelegateInvoiceTemplateCreateResult =
  | { delegated: false }
  | { delegated: true; template: unknown };

export async function tryDelegateInvoiceTemplateCreate(
  input: Record<string, unknown>,
  sessionAccessToken?: string | null,
): Promise<DelegateInvoiceTemplateCreateResult> {
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
    const template = await fetchReplacementInvoiceTemplateCreate(
      getReplacementApiUrl(),
      token,
      input,
    );
    return { delegated: true, template };
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

export type DelegateInvoiceTemplateUpsertResult =
  | { delegated: false }
  | { delegated: true; template: unknown | null };

export async function tryDelegateInvoiceTemplateUpsert(
  input: Record<string, unknown>,
  sessionAccessToken?: string | null,
): Promise<DelegateInvoiceTemplateUpsertResult> {
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
    const template = await fetchReplacementInvoiceTemplateUpsert(
      getReplacementApiUrl(),
      token,
      input,
    );
    return { delegated: true, template };
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

export type DelegateInvoiceTemplateSetDefaultResult =
  | { delegated: false }
  | { delegated: true; template: unknown | null };

export async function tryDelegateInvoiceTemplateSetDefault(
  id: string,
  sessionAccessToken?: string | null,
): Promise<DelegateInvoiceTemplateSetDefaultResult> {
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
    const template = await fetchReplacementInvoiceTemplateSetDefault(
      getReplacementApiUrl(),
      token,
      id,
    );
    return { delegated: true, template };
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

export type DelegateInvoiceTemplateDeleteResult =
  | { delegated: false }
  | { delegated: true; result: unknown };

export async function tryDelegateInvoiceTemplateDelete(
  id: string,
  sessionAccessToken?: string | null,
): Promise<DelegateInvoiceTemplateDeleteResult> {
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
    const result = await fetchReplacementInvoiceTemplateDelete(
      getReplacementApiUrl(),
      token,
      id,
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

export type DelegateCategoryMutationResult =
  | { delegated: false }
  | { delegated: true; category: unknown | null };

export async function tryDelegateTransactionCategoryCreate(
  input: ReplacementCategoryCreateInput,
  sessionAccessToken?: string | null,
): Promise<DelegateCategoryMutationResult> {
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
    const category = await fetchReplacementCategoryCreate(
      getReplacementApiUrl(),
      token,
      input,
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

export async function tryDelegateTransactionCategoryUpdate(
  id: string,
  input: ReplacementCategoryUpdateInput,
  sessionAccessToken?: string | null,
): Promise<DelegateCategoryMutationResult> {
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
    const category = await fetchReplacementCategoryUpdate(
      getReplacementApiUrl(),
      token,
      id,
      input,
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

export async function tryDelegateTransactionCategoryDelete(
  id: string,
  sessionAccessToken?: string | null,
): Promise<DelegateCategoryMutationResult> {
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
    const category = await fetchReplacementCategoryDelete(
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

export async function tryDelegateInboxBlocklistGet(
  sessionAccessToken?: string | null,
) {
  return tryDelegateReplacementRead(sessionAccessToken, (baseUrl, token) =>
    fetchReplacementInboxBlocklist(baseUrl, token),
  );
}

export type DelegateInboxBlocklistMutationResult =
  | { delegated: false }
  | { delegated: true; entry: unknown | null };

export async function tryDelegateInboxBlocklistCreate(
  input: ReplacementInboxBlocklistCreateInput,
  sessionAccessToken?: string | null,
): Promise<DelegateInboxBlocklistMutationResult> {
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
    const entry = await fetchReplacementInboxBlocklistCreate(
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

export async function tryDelegateInboxBlocklistDelete(
  id: string,
  sessionAccessToken?: string | null,
): Promise<DelegateInboxBlocklistMutationResult> {
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
    const entry = await fetchReplacementInboxBlocklistDelete(
      getReplacementApiUrl(),
      token,
      id,
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

export type DelegateApiKeyDeleteResult =
  | { delegated: false }
  | { delegated: true; keyHash: string | undefined };

export async function tryDelegateApiKeyDelete(
  id: string,
  sessionAccessToken?: string | null,
): Promise<DelegateApiKeyDeleteResult> {
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
    const keyHash = await fetchReplacementApiKeyDelete(
      getReplacementApiUrl(),
      token,
      id,
    );
    return { delegated: true, keyHash };
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

export type DelegateReportCreateResult =
  | { delegated: false }
  | { delegated: true; report: unknown };

export async function tryDelegateReportCreate(
  input: ReplacementReportCreateInput,
  sessionAccessToken?: string | null,
): Promise<DelegateReportCreateResult> {
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
    const report = await fetchReplacementReportCreate(
      getReplacementApiUrl(),
      token,
      input,
    );
    return { delegated: true, report };
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

export type DelegateTeamInviteMutationResult =
  | { delegated: false }
  | { delegated: true; result: unknown | null };

export async function tryDelegateTeamAcceptInvite(
  id: string,
  sessionAccessToken?: string | null,
): Promise<DelegateTeamInviteMutationResult> {
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
    const result = await fetchReplacementTeamAcceptInvite(
      getReplacementApiUrl(),
      token,
      id,
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

export async function tryDelegateTeamDeclineInvite(
  id: string,
  sessionAccessToken?: string | null,
): Promise<DelegateTeamInviteMutationResult> {
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
    const result = await fetchReplacementTeamDeclineInvite(
      getReplacementApiUrl(),
      token,
      id,
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

export async function tryDelegateTeamDeleteInvite(
  id: string,
  sessionAccessToken?: string | null,
): Promise<DelegateTeamInviteMutationResult> {
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
    const result = await fetchReplacementTeamDeleteInvite(
      getReplacementApiUrl(),
      token,
      id,
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

export async function tryDelegateTeamDeleteMember(
  input: ReplacementTeamMemberInput,
  sessionAccessToken?: string | null,
): Promise<DelegateTeamInviteMutationResult> {
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
    const result = await fetchReplacementTeamDeleteMember(
      getReplacementApiUrl(),
      token,
      input,
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

export async function tryDelegateTeamUpdateMember(
  input: ReplacementTeamUpdateMemberInput,
  sessionAccessToken?: string | null,
): Promise<DelegateTeamInviteMutationResult> {
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
    const result = await fetchReplacementTeamUpdateMember(
      getReplacementApiUrl(),
      token,
      input,
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

export async function tryDelegateShortLinkGet(shortId: string) {
  return tryDelegateReplacementPublicRead((baseUrl) =>
    fetchReplacementShortLinkGet(baseUrl, shortId),
  );
}

export type DelegateShortLinkCreateResult =
  | { delegated: false }
  | { delegated: true; link: unknown };

export async function tryDelegateShortLinkCreate(
  input: ReplacementShortLinkCreateInput,
  sessionAccessToken?: string | null,
): Promise<DelegateShortLinkCreateResult> {
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
    const link = await fetchReplacementShortLinkCreate(
      getReplacementApiUrl(),
      token,
      input,
    );
    return { delegated: true, link };
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

export async function tryDelegateOAuthApplicationsList(
  sessionAccessToken?: string | null,
) {
  return tryDelegateReplacementRead(sessionAccessToken, (baseUrl, token) =>
    fetchReplacementOAuthApplicationsList(baseUrl, token),
  );
}

export type DelegateOAuthAppResult =
  | { delegated: false }
  | { delegated: true; application: unknown | null };

export async function tryDelegateOAuthApplicationGet(
  id: string,
  sessionAccessToken?: string | null,
): Promise<DelegateOAuthAppResult> {
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
    const application = await fetchReplacementOAuthApplicationGet(
      getReplacementApiUrl(),
      token,
      id,
    );
    return { delegated: true, application };
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

export async function tryDelegateOAuthApplicationCreate(
  input: ReplacementOAuthAppCreateInput,
  sessionAccessToken?: string | null,
): Promise<DelegateOAuthAppResult> {
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
    const application = await fetchReplacementOAuthApplicationCreate(
      getReplacementApiUrl(),
      token,
      input,
    );
    return { delegated: true, application };
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

export async function tryDelegateOAuthApplicationUpdate(
  id: string,
  input: ReplacementOAuthAppUpdateInput,
  sessionAccessToken?: string | null,
): Promise<DelegateOAuthAppResult> {
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
    const application = await fetchReplacementOAuthApplicationUpdate(
      getReplacementApiUrl(),
      token,
      id,
      input,
    );
    return { delegated: true, application };
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

export type DelegateOAuthAppDeleteResult =
  | { delegated: false }
  | { delegated: true; result: { id: string; name: string } | null };

export async function tryDelegateOAuthApplicationDelete(
  id: string,
  sessionAccessToken?: string | null,
): Promise<DelegateOAuthAppDeleteResult> {
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
    const result = await fetchReplacementOAuthApplicationDelete(
      getReplacementApiUrl(),
      token,
      id,
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

export type DelegateOAuthRegenerateSecretResult =
  | { delegated: false }
  | {
      delegated: true;
      result: { id: string; clientId: string; clientSecret: string } | null;
    };

export async function tryDelegateOAuthApplicationRegenerateSecret(
  id: string,
  sessionAccessToken?: string | null,
): Promise<DelegateOAuthRegenerateSecretResult> {
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
    const result = await fetchReplacementOAuthApplicationRegenerateSecret(
      getReplacementApiUrl(),
      token,
      id,
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

export type DelegateTrackerProjectUpsertResult =
  | { delegated: false }
  | { delegated: true; project: unknown | null };

export async function tryDelegateTrackerProjectUpsert(
  input: ReplacementTrackerProjectUpsertInput,
  sessionAccessToken?: string | null,
): Promise<DelegateTrackerProjectUpsertResult> {
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
    const project = await fetchReplacementTrackerProjectUpsert(
      getReplacementApiUrl(),
      token,
      input,
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

export type DelegateTrackerProjectDeleteResult =
  | { delegated: false }
  | { delegated: true; result: { id: string } | null };

export async function tryDelegateTrackerProjectDelete(
  id: string,
  sessionAccessToken?: string | null,
): Promise<DelegateTrackerProjectDeleteResult> {
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
    const result = await fetchReplacementTrackerProjectDelete(
      getReplacementApiUrl(),
      token,
      id,
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

export type DelegateInboxConfirmMatchResult =
  | { delegated: false }
  | { delegated: true; item: MiddayInboxByIdShape | null };

export async function tryDelegateInboxConfirmMatch(
  input: {
    suggestionId: string;
    inboxId: string;
    transactionId: string;
  },
  sessionAccessToken?: string | null,
): Promise<DelegateInboxConfirmMatchResult> {
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
    const item = await fetchReplacementInboxConfirmMatch(
      getReplacementApiUrl(),
      token,
      input,
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

export type DelegateInboxDeclineMatchResult =
  | { delegated: false }
  | { delegated: true; result: { ok: true } };

export async function tryDelegateInboxDeclineMatch(
  input: { suggestionId: string; inboxId: string },
  sessionAccessToken?: string | null,
): Promise<DelegateInboxDeclineMatchResult> {
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
    const result = await fetchReplacementInboxDeclineMatch(
      getReplacementApiUrl(),
      token,
      input,
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

export type DelegateInboxUnmatchResult =
  | { delegated: false }
  | { delegated: true; result: unknown[] | null };

export async function tryDelegateInboxUnmatch(
  id: string,
  sessionAccessToken?: string | null,
): Promise<DelegateInboxUnmatchResult> {
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
    const result = await fetchReplacementInboxUnmatch(
      getReplacementApiUrl(),
      token,
      id,
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

export type DelegateCustomerInvoiceSummaryResult =
  | { delegated: false }
  | { delegated: true; summary: unknown };

export async function tryDelegateCustomerInvoiceSummary(
  customerId: string,
  sessionAccessToken?: string | null,
): Promise<DelegateCustomerInvoiceSummaryResult> {
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
    const summary = await fetchReplacementCustomerInvoiceSummary(
      getReplacementApiUrl(),
      token,
      customerId,
    );
    return { delegated: true, summary };
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

export type DelegateCustomerEnrichmentResult =
  | { delegated: false }
  | { delegated: true; result: unknown };

export async function tryDelegateCustomerCancelEnrichment(
  customerId: string,
  sessionAccessToken?: string | null,
): Promise<DelegateCustomerEnrichmentResult> {
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
    const result = await fetchReplacementCustomerCancelEnrichment(
      getReplacementApiUrl(),
      token,
      customerId,
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

export async function tryDelegateCustomerClearEnrichment(
  customerId: string,
  sessionAccessToken?: string | null,
): Promise<DelegateCustomerEnrichmentResult> {
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
    const result = await fetchReplacementCustomerClearEnrichment(
      getReplacementApiUrl(),
      token,
      customerId,
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

export type DelegateMoveToReviewResult =
  | { delegated: false }
  | { delegated: true; result: { success: true } };

export async function tryDelegateMoveToReview(
  transactionId: string,
  sessionAccessToken?: string | null,
): Promise<DelegateMoveToReviewResult> {
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
    const result = await fetchReplacementMoveToReview(
      getReplacementApiUrl(),
      token,
      transactionId,
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

export type DelegateSimilarTransactionsResult =
  | { delegated: false }
  | { delegated: true; rows: unknown[] };

export async function tryDelegateSimilarTransactions(
  input: { name: string; categorySlug?: string; transactionId?: string },
  sessionAccessToken?: string | null,
): Promise<DelegateSimilarTransactionsResult> {
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
    const rows = await fetchReplacementSimilarTransactions(
      getReplacementApiUrl(),
      token,
      input,
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

export type DelegateSearchTransactionMatchResult =
  | { delegated: false }
  | { delegated: true; rows: unknown[] };

export async function tryDelegateSearchTransactionMatch(
  input: ReplacementSearchTransactionMatchQuery,
  sessionAccessToken?: string | null,
): Promise<DelegateSearchTransactionMatchResult> {
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
    const rows = await fetchReplacementSearchTransactionMatch(
      getReplacementApiUrl(),
      token,
      input,
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

export type DelegateCreateTransactionResult =
  | { delegated: false }
  | { delegated: true; transaction: unknown };

export async function tryDelegateCreateTransaction(
  input: ReplacementCreateTransactionInput,
  sessionAccessToken?: string | null,
): Promise<DelegateCreateTransactionResult> {
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
    const transaction = await fetchReplacementCreateTransaction(
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

export type DelegateTogglePortalResult =
  | { delegated: false }
  | { delegated: true; result: unknown };

export async function tryDelegateTogglePortal(
  input: { customerId: string; enabled: boolean },
  sessionAccessToken?: string | null,
): Promise<DelegateTogglePortalResult> {
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
    const result = await fetchReplacementTogglePortal(
      getReplacementApiUrl(),
      token,
      input,
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

export type DelegateApplicationInfoResult =
  | { delegated: false }
  | { delegated: true; info: unknown };

export async function tryDelegateApplicationInfo(
  input: {
    clientId: string;
    redirectUri: string;
    scope: string;
    state?: string;
  },
  sessionAccessToken?: string | null,
): Promise<DelegateApplicationInfoResult> {
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
    const info = await fetchReplacementApplicationInfo(
      getReplacementApiUrl(),
      token,
      input,
    );
    return { delegated: true, info };
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

export type DelegatePortalCustomerResult =
  | { delegated: false }
  | { delegated: true; result: unknown | null };

export async function tryDelegatePortalCustomer(
  portalId: string,
): Promise<DelegatePortalCustomerResult> {
  if (!shouldDelegateToReplacementBackend()) {
    return { delegated: false };
  }

  try {
    const result = await fetchReplacementPortalCustomer(
      getReplacementApiUrl(),
      portalId,
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

export type DelegatePortalInvoicesResult =
  | { delegated: false }
  | { delegated: true; result: unknown };

export async function tryDelegatePortalInvoices(
  portalId: string,
  query: { cursor?: string | null; pageSize?: number },
): Promise<DelegatePortalInvoicesResult> {
  if (!shouldDelegateToReplacementBackend()) {
    return { delegated: false };
  }

  try {
    const result = await fetchReplacementPortalInvoices(
      getReplacementApiUrl(),
      portalId,
      query,
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

export type DelegateAvailablePlansResult =
  | { delegated: false }
  | { delegated: true; plans: unknown };

export async function tryDelegateAvailablePlans(
  sessionAccessToken?: string | null,
): Promise<DelegateAvailablePlansResult> {
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
    const plans = await fetchReplacementAvailablePlans(
      getReplacementApiUrl(),
      token,
    );
    return { delegated: true, plans };
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

export type DelegateSwitchTeamResult =
  | { delegated: false }
  | { delegated: true; result: unknown };

export async function tryDelegateSwitchTeam(
  teamId: string,
  sessionAccessToken?: string | null,
): Promise<DelegateSwitchTeamResult> {
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
    const result = await fetchReplacementSwitchTeam(
      getReplacementApiUrl(),
      token,
      teamId,
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

export async function tryDelegateNotificationPreferences(
  sessionAccessToken?: string | null,
) {
  return tryDelegateReplacementRead(sessionAccessToken, (baseUrl, token) =>
    fetchReplacementNotificationPreferences(baseUrl, token),
  );
}

export type DelegateBankConnectionDeleteResult =
  | { delegated: false }
  | { delegated: true; result: unknown };

export async function tryDelegateBankConnectionDelete(
  id: string,
  sessionAccessToken?: string | null,
): Promise<DelegateBankConnectionDeleteResult> {
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
    const result = await fetchReplacementBankConnectionDelete(
      getReplacementApiUrl(),
      token,
      id,
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

export async function tryDelegateInvoiceRecurringList(
  query: ReplacementInvoiceRecurringListQuery,
  sessionAccessToken?: string | null,
) {
  return tryDelegateReplacementRead(sessionAccessToken, (baseUrl, token) =>
    fetchReplacementInvoiceRecurringList(baseUrl, token, query),
  );
}

export async function tryDelegateInvoiceRecurringGet(
  id: string,
  sessionAccessToken?: string | null,
) {
  return tryDelegateReplacementRead(sessionAccessToken, (baseUrl, token) =>
    fetchReplacementInvoiceRecurringGet(baseUrl, token, id),
  );
}

export type DelegateInvoiceRecurringMutationResult =
  | { delegated: false }
  | { delegated: true; recurring: unknown; jobIds: string[] };

export async function tryDelegateInvoiceRecurringPause(
  id: string,
  sessionAccessToken?: string | null,
): Promise<DelegateInvoiceRecurringMutationResult> {
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
    const result = await fetchReplacementInvoiceRecurringPause(
      getReplacementApiUrl(),
      token,
      id,
    );
    return {
      delegated: true,
      recurring: result.recurring,
      jobIds: result.jobIds,
    };
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

export type DelegateInvoiceRecurringResumeResult =
  | { delegated: false }
  | { delegated: true; recurring: unknown };

export async function tryDelegateInvoiceRecurringResume(
  id: string,
  sessionAccessToken?: string | null,
): Promise<DelegateInvoiceRecurringResumeResult> {
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
    const recurring = await fetchReplacementInvoiceRecurringResume(
      getReplacementApiUrl(),
      token,
      id,
    );
    return { delegated: true, recurring };
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

export async function tryDelegateInvoiceRecurringDelete(
  id: string,
  sessionAccessToken?: string | null,
): Promise<DelegateInvoiceRecurringMutationResult> {
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
    const result = await fetchReplacementInvoiceRecurringDelete(
      getReplacementApiUrl(),
      token,
      id,
    );
    return {
      delegated: true,
      recurring: result.recurring,
      jobIds: result.jobIds,
    };
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

export async function tryDelegateInvoiceRecurringUpcoming(
  id: string,
  limit: number | undefined,
  sessionAccessToken?: string | null,
) {
  return tryDelegateReplacementRead(sessionAccessToken, (baseUrl, token) =>
    fetchReplacementInvoiceRecurringUpcoming(baseUrl, token, id, limit),
  );
}

export type DelegateInvoiceRecurringWriteResult =
  | { delegated: false }
  | { delegated: true; recurring: unknown };

export async function tryDelegateInvoiceRecurringCreate(
  input: ReplacementInvoiceRecurringCreateInput,
  sessionAccessToken?: string | null,
): Promise<DelegateInvoiceRecurringWriteResult> {
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
    const recurring = await fetchReplacementInvoiceRecurringCreate(
      getReplacementApiUrl(),
      token,
      input,
    );
    return { delegated: true, recurring };
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

export async function tryDelegateInvoiceRecurringUpdate(
  id: string,
  input: Record<string, unknown>,
  sessionAccessToken?: string | null,
): Promise<DelegateInvoiceRecurringWriteResult> {
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
    const recurring = await fetchReplacementInvoiceRecurringUpdate(
      getReplacementApiUrl(),
      token,
      id,
      input,
    );
    return { delegated: true, recurring };
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

export type DelegateAccountingDisconnectResult =
  | { delegated: false }
  | { delegated: true; result: { success: true } };

export async function tryDelegateAccountingDisconnect(
  providerId: string,
  sessionAccessToken?: string | null,
): Promise<DelegateAccountingDisconnectResult> {
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
    const result = await fetchReplacementAccountingDisconnect(
      getReplacementApiUrl(),
      token,
      providerId,
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

export type DelegateTeamLeaveResult =
  | { delegated: false }
  | { delegated: true; result: unknown };

export async function tryDelegateTeamLeave(
  teamId: string,
  sessionAccessToken?: string | null,
): Promise<DelegateTeamLeaveResult> {
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
    const result = await fetchReplacementTeamLeave(
      getReplacementApiUrl(),
      token,
      teamId,
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

export type DelegateBankAccountMutationResult =
  | { delegated: false }
  | { delegated: true; account: unknown | null };

export async function tryDelegateBankAccountCreate(
  input: ReplacementBankAccountCreateInput,
  sessionAccessToken?: string | null,
): Promise<DelegateBankAccountMutationResult> {
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
    const account = await fetchReplacementBankAccountCreate(
      getReplacementApiUrl(),
      token,
      input,
    );
    return { delegated: true, account };
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

export async function tryDelegateBankAccountUpdate(
  id: string,
  input: ReplacementBankAccountUpdateInput,
  sessionAccessToken?: string | null,
): Promise<DelegateBankAccountMutationResult> {
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
    const account = await fetchReplacementBankAccountUpdate(
      getReplacementApiUrl(),
      token,
      id,
      input,
    );
    return { delegated: true, account };
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

export async function tryDelegateBankAccountDelete(
  id: string,
  sessionAccessToken?: string | null,
): Promise<DelegateBankAccountMutationResult> {
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
    const account = await fetchReplacementBankAccountDelete(
      getReplacementApiUrl(),
      token,
      id,
    );
    return { delegated: true, account };
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

export async function tryDelegateInstitutionsGet(
  query: ReplacementInstitutionsQuery,
  sessionAccessToken?: string | null,
) {
  return tryDelegateReplacementRead(sessionAccessToken, (baseUrl, token) =>
    fetchReplacementInstitutionsGet(baseUrl, token, query),
  );
}

export async function tryDelegateInstitutionGetById(
  id: string,
  sessionAccessToken?: string | null,
) {
  return tryDelegateReplacementRead(sessionAccessToken, (baseUrl, token) =>
    fetchReplacementInstitutionGetById(baseUrl, token, id),
  );
}

export type DelegateInstitutionUpdateUsageResult =
  | { delegated: false }
  | { delegated: true; result: unknown };

export async function tryDelegateInstitutionUpdateUsage(
  id: string,
  sessionAccessToken?: string | null,
): Promise<DelegateInstitutionUpdateUsageResult> {
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
    const result = await fetchReplacementInstitutionUpdateUsage(
      getReplacementApiUrl(),
      token,
      id,
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

export async function tryDelegateOAuthAuthorized(
  sessionAccessToken?: string | null,
) {
  return tryDelegateReplacementRead(sessionAccessToken, (baseUrl, token) =>
    fetchReplacementOAuthAuthorized(baseUrl, token),
  );
}

export type DelegateOAuthRevokeAccessResult =
  | { delegated: false }
  | { delegated: true; result: { success: true } };

export async function tryDelegateOAuthRevokeAccess(
  applicationId: string,
  sessionAccessToken?: string | null,
): Promise<DelegateOAuthRevokeAccessResult> {
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
    const result = await fetchReplacementOAuthRevokeAccess(
      getReplacementApiUrl(),
      token,
      applicationId,
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

export type DelegateAttachmentsCreateResult =
  | { delegated: false }
  | { delegated: true; attachments: unknown[] };

export async function tryDelegateAttachmentsCreateMany(
  attachments: ReplacementAttachmentInput[],
  sessionAccessToken?: string | null,
): Promise<DelegateAttachmentsCreateResult> {
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
    const result = await fetchReplacementAttachmentsCreateMany(
      getReplacementApiUrl(),
      token,
      attachments,
    );
    return { delegated: true, attachments: result };
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

export type DelegateAttachmentDeleteResult =
  | { delegated: false }
  | { delegated: true; result: unknown };

export async function tryDelegateAttachmentDelete(
  id: string,
  sessionAccessToken?: string | null,
): Promise<DelegateAttachmentDeleteResult> {
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
    const result = await fetchReplacementAttachmentDelete(
      getReplacementApiUrl(),
      token,
      id,
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

export type DelegateBankConnectionReconnectResult =
  | { delegated: false }
  | { delegated: true; result: unknown | null };

export async function tryDelegateBankConnectionReconnect(
  input: ReplacementBankConnectionReconnectInput,
  sessionAccessToken?: string | null,
): Promise<DelegateBankConnectionReconnectResult> {
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
    const result = await fetchReplacementBankConnectionReconnect(
      getReplacementApiUrl(),
      token,
      input,
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

export type DelegateInboxCreateResult =
  | { delegated: false }
  | { delegated: true; inbox: unknown };

export async function tryDelegateInboxCreate(
  input: ReplacementInboxCreateInput,
  sessionAccessToken?: string | null,
): Promise<DelegateInboxCreateResult> {
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
    const inbox = await fetchReplacementInboxCreate(
      getReplacementApiUrl(),
      token,
      input,
    );
    return { delegated: true, inbox };
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

export async function tryDelegateAppsRemoveWhatsApp(
  input: ReplacementRemoveWhatsAppInput,
  sessionAccessToken?: string | null,
): Promise<DelegateAppMutationResult> {
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
    const app = await fetchReplacementAppsRemoveWhatsApp(
      getReplacementApiUrl(),
      token,
      input,
    );
    return { delegated: true, app };
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

export type DelegatePlatformLinkTokenResult =
  | { delegated: false }
  | { delegated: true; token: unknown };

export async function tryDelegateAppsCreatePlatformLinkToken(
  input: ReplacementPlatformLinkTokenInput,
  sessionAccessToken?: string | null,
): Promise<DelegatePlatformLinkTokenResult> {
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
    const result = await fetchReplacementAppsCreatePlatformLinkToken(
      getReplacementApiUrl(),
      token,
      input,
    );
    return { delegated: true, token: result };
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

export type DelegateInvoiceDefaultSettingsResult =
  | { delegated: false }
  | { delegated: true; data: ReplacementInvoiceDefaultSettingsData };

export async function tryDelegateInvoiceDefaultSettingsData(
  sessionAccessToken?: string | null,
): Promise<DelegateInvoiceDefaultSettingsResult> {
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
    const data = await fetchReplacementInvoiceDefaultSettingsData(
      getReplacementApiUrl(),
      token,
    );
    return { delegated: true, data };
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

export type DelegateBankAccountGetByIdResult =
  | { delegated: false }
  | { delegated: true; account: unknown | null };

export async function tryDelegateBankAccountGetById(
  id: string,
  sessionAccessToken?: string | null,
): Promise<DelegateBankAccountGetByIdResult> {
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
    const account = await fetchReplacementBankAccountGetById(
      getReplacementApiUrl(),
      token,
      id,
    );
    return { delegated: true, account };
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

export type DelegateInboxAccountDeleteResult =
  | { delegated: false }
  | { delegated: true; result: { id: string; scheduleId: string | null } | null };

export async function tryDelegateInboxAccountDelete(
  id: string,
  sessionAccessToken?: string | null,
): Promise<DelegateInboxAccountDeleteResult> {
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
    const result = await fetchReplacementInboxAccountDelete(
      getReplacementApiUrl(),
      token,
      id,
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

export type DelegateCustomerStartEnrichmentResult =
  | { delegated: false }
  | { delegated: true };

export async function tryDelegateCustomerStartEnrichment(
  id: string,
  sessionAccessToken?: string | null,
): Promise<DelegateCustomerStartEnrichmentResult> {
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
    await fetchReplacementCustomerStartEnrichment(
      getReplacementApiUrl(),
      token,
      id,
    );
    return { delegated: true };
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

export type DelegateDocumentProcessingStatusResult =
  | { delegated: false }
  | { delegated: true; result: { id: string; processingStatus: string } };

export async function tryDelegateDocumentProcessingStatus(
  id: string,
  processingStatus: string,
  sessionAccessToken?: string | null,
): Promise<DelegateDocumentProcessingStatusResult> {
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
    const result = await fetchReplacementDocumentProcessingStatus(
      getReplacementApiUrl(),
      token,
      id,
      processingStatus,
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

export type DelegateDocumentsProcessingStatusResult =
  | { delegated: false }
  | { delegated: true; result: unknown[] };

export async function tryDelegateDocumentsProcessingStatus(
  ids: string[],
  processingStatus: string,
  sessionAccessToken?: string | null,
): Promise<DelegateDocumentsProcessingStatusResult> {
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
    const result = await fetchReplacementDocumentsProcessingStatus(
      getReplacementApiUrl(),
      token,
      ids,
      processingStatus,
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

export type DelegateAppByAppIdResult =
  | { delegated: false }
  | { delegated: true; app: unknown | null };

export async function tryDelegateAppByAppId(
  appId: string,
  sessionAccessToken?: string | null,
): Promise<DelegateAppByAppIdResult> {
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
    const app = await fetchReplacementAppByAppId(
      getReplacementApiUrl(),
      token,
      appId,
    );
    return { delegated: true, app };
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

export type DelegateTeamCreateInvitesResult =
  | { delegated: false }
  | {
      delegated: true;
      result: {
        results: Array<{
          email: string | null;
          code?: string | null;
          role?: string | null;
          team?: { id: string; name: string | null } | null;
        }>;
        skippedInvites: Array<{
          email: string;
          reason: "already_member" | "already_invited" | "duplicate";
        }>;
      };
    };

export async function tryDelegateTeamCreateInvites(
  invites: Array<{ email: string; role: "owner" | "member" }>,
  sessionAccessToken?: string | null,
): Promise<DelegateTeamCreateInvitesResult> {
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
    const result = await fetchReplacementTeamCreateInvites(
      getReplacementApiUrl(),
      token,
      { invites },
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

export type DelegateInboxAccountByIdResult =
  | { delegated: false }
  | { delegated: true; account: unknown | null };

export async function tryDelegateInboxAccountById(
  id: string,
  sessionAccessToken?: string | null,
): Promise<DelegateInboxAccountByIdResult> {
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
    const account = await fetchReplacementInboxAccountById(
      getReplacementApiUrl(),
      token,
      id,
    );
    return { delegated: true, account };
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

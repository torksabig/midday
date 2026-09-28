import {
  fetchReplacementAuthMePayload,
  fetchReplacementBankAccounts,
  fetchReplacementCustomerById,
  fetchReplacementCustomersList,
  fetchReplacementDocumentById,
  fetchReplacementDocumentsList,
  fetchReplacementInvoiceById,
  fetchReplacementInvoicesList,
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
  type ReplacementInboxByStatusQuery,
  type ReplacementInboxListQuery,
  type ReplacementInboxSearchQuery,
  type ReplacementTransactionsListQuery,
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

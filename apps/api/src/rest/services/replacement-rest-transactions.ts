import {
  assertLegacyIdentityFallbackAllowed,
  tryDelegateCreateTransaction,
  tryDelegateTransactionUpdate,
  tryDelegateTransactionsDeleteMany,
  tryDelegateTransactionsGet,
  tryDelegateTransactionsGetById,
  tryDelegateTransactionsUpdateMany,
} from "@api/services/replacement-delegation";
import type {
  ReplacementCreateTransactionInput,
  ReplacementTransactionsListQuery,
  ReplacementTransactionUpdateInput,
} from "@midday/replacement-backend";
import { shouldDelegateToReplacementBackend } from "@midday/replacement-backend";
import { extractBearerToken } from "./vault-presigned-url";
import { mapDelegationErrorToHttp } from "./replacement-rest-documents";

export async function fetchTransactionsListForRest(
  params: ReplacementTransactionsListQuery,
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<unknown>,
): Promise<unknown> {
  if (!shouldDelegateToReplacementBackend()) {
    return fetchLegacy();
  }

  const sessionAccessToken = extractBearerToken(authorizationHeader);
  try {
    const delegated = await tryDelegateTransactionsGet(params, sessionAccessToken);
    if (delegated) {
      return delegated;
    }
    assertLegacyIdentityFallbackAllowed();
  } catch (error) {
    mapDelegationErrorToHttp(error);
  }

  return fetchLegacy();
}

export async function fetchTransactionByIdForRest(
  id: string,
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<unknown>,
): Promise<unknown> {
  if (!shouldDelegateToReplacementBackend()) {
    return fetchLegacy();
  }

  const sessionAccessToken = extractBearerToken(authorizationHeader);
  try {
    const delegated = await tryDelegateTransactionsGetById(id, sessionAccessToken);
    if (delegated.delegated) {
      return delegated.transaction;
    }
    assertLegacyIdentityFallbackAllowed();
  } catch (error) {
    mapDelegationErrorToHttp(error);
  }

  return fetchLegacy();
}

export async function createTransactionForRest(
  input: ReplacementCreateTransactionInput,
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<unknown>,
): Promise<unknown> {
  if (!shouldDelegateToReplacementBackend()) {
    return fetchLegacy();
  }

  const sessionAccessToken = extractBearerToken(authorizationHeader);
  try {
    const delegated = await tryDelegateCreateTransaction(input, sessionAccessToken);
    if (delegated.delegated) {
      return delegated.transaction;
    }
    assertLegacyIdentityFallbackAllowed();
  } catch (error) {
    mapDelegationErrorToHttp(error);
  }

  return fetchLegacy();
}

export async function updateTransactionForRest(
  input: ReplacementTransactionUpdateInput,
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<unknown>,
): Promise<unknown> {
  if (!shouldDelegateToReplacementBackend()) {
    return fetchLegacy();
  }

  const sessionAccessToken = extractBearerToken(authorizationHeader);
  try {
    const delegated = await tryDelegateTransactionUpdate(input, sessionAccessToken);
    if (delegated.delegated) {
      return delegated.transaction;
    }
    assertLegacyIdentityFallbackAllowed();
  } catch (error) {
    mapDelegationErrorToHttp(error);
  }

  return fetchLegacy();
}

export async function updateTransactionsForRest(
  input: Record<string, unknown>,
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<unknown>,
): Promise<unknown> {
  if (!shouldDelegateToReplacementBackend()) {
    return fetchLegacy();
  }

  const sessionAccessToken = extractBearerToken(authorizationHeader);
  try {
    const delegated = await tryDelegateTransactionsUpdateMany(
      input,
      sessionAccessToken,
    );
    if (delegated) {
      return delegated;
    }
    assertLegacyIdentityFallbackAllowed();
  } catch (error) {
    mapDelegationErrorToHttp(error);
  }

  return fetchLegacy();
}

export async function deleteTransactionsForRest(
  ids: string[],
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<Array<{ id: string }>>,
): Promise<Array<{ id: string }>> {
  if (!shouldDelegateToReplacementBackend()) {
    return fetchLegacy();
  }

  const sessionAccessToken = extractBearerToken(authorizationHeader);
  try {
    const delegated = await tryDelegateTransactionsDeleteMany(
      ids,
      sessionAccessToken,
    );
    if (delegated) {
      return delegated;
    }
    assertLegacyIdentityFallbackAllowed();
  } catch (error) {
    mapDelegationErrorToHttp(error);
  }

  return fetchLegacy();
}

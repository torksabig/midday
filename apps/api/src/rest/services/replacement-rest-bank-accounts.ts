import {
  assertLegacyIdentityFallbackAllowed,
  tryDelegateBankAccountCreate,
  tryDelegateBankAccountDelete,
  tryDelegateBankAccountGetById,
  tryDelegateBankAccountUpdate,
  tryDelegateBankAccountsGet,
} from "@api/services/replacement-delegation";
import type {
  ReplacementBankAccountCreateInput,
  ReplacementBankAccountUpdateInput,
  ReplacementBankAccountsListQuery,
} from "@midday/replacement-backend";
import { shouldDelegateToReplacementBackend } from "@midday/replacement-backend";
import { mapDelegationErrorToHttp } from "./replacement-rest-documents";
import { extractBearerToken } from "./vault-presigned-url";

export async function fetchBankAccountsListForRest(
  params: ReplacementBankAccountsListQuery,
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<unknown[]>,
): Promise<{ data: unknown[] }> {
  if (!shouldDelegateToReplacementBackend()) {
    const data = await fetchLegacy();
    return { data };
  }

  const sessionAccessToken = extractBearerToken(authorizationHeader);
  try {
    const delegated = await tryDelegateBankAccountsGet(params, sessionAccessToken);
    if (delegated) {
      return { data: delegated };
    }
    assertLegacyIdentityFallbackAllowed();
  } catch (error) {
    mapDelegationErrorToHttp(error);
  }

  const data = await fetchLegacy();
  return { data };
}

export async function fetchBankAccountByIdForRest(
  id: string,
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<unknown>,
): Promise<unknown> {
  if (!shouldDelegateToReplacementBackend()) {
    return fetchLegacy();
  }

  const sessionAccessToken = extractBearerToken(authorizationHeader);
  try {
    const delegated = await tryDelegateBankAccountGetById(id, sessionAccessToken);
    if (delegated.delegated) {
      return delegated.account;
    }
    assertLegacyIdentityFallbackAllowed();
  } catch (error) {
    mapDelegationErrorToHttp(error);
  }

  return fetchLegacy();
}

export async function createBankAccountForRest(
  input: ReplacementBankAccountCreateInput,
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<unknown>,
): Promise<unknown> {
  if (!shouldDelegateToReplacementBackend()) {
    return fetchLegacy();
  }

  const sessionAccessToken = extractBearerToken(authorizationHeader);
  try {
    const delegated = await tryDelegateBankAccountCreate(input, sessionAccessToken);
    if (delegated.delegated) {
      return delegated.account;
    }
    assertLegacyIdentityFallbackAllowed();
  } catch (error) {
    mapDelegationErrorToHttp(error);
  }

  return fetchLegacy();
}

export async function updateBankAccountForRest(
  id: string,
  input: ReplacementBankAccountUpdateInput,
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<unknown>,
): Promise<unknown> {
  if (!shouldDelegateToReplacementBackend()) {
    return fetchLegacy();
  }

  const sessionAccessToken = extractBearerToken(authorizationHeader);
  try {
    const delegated = await tryDelegateBankAccountUpdate(
      id,
      input,
      sessionAccessToken,
    );
    if (delegated.delegated) {
      return delegated.account;
    }
    assertLegacyIdentityFallbackAllowed();
  } catch (error) {
    mapDelegationErrorToHttp(error);
  }

  return fetchLegacy();
}

export async function deleteBankAccountForRest(
  id: string,
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<unknown>,
): Promise<unknown> {
  if (!shouldDelegateToReplacementBackend()) {
    return fetchLegacy();
  }

  const sessionAccessToken = extractBearerToken(authorizationHeader);
  try {
    const delegated = await tryDelegateBankAccountDelete(id, sessionAccessToken);
    if (delegated.delegated) {
      return delegated.account;
    }
    assertLegacyIdentityFallbackAllowed();
  } catch (error) {
    mapDelegationErrorToHttp(error);
  }

  return fetchLegacy();
}

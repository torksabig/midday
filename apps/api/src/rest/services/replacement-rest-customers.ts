import {
  assertLegacyIdentityFallbackAllowed,
  tryDelegateCustomerDelete,
  tryDelegateCustomersGet,
  tryDelegateCustomersGetById,
  tryDelegateCustomerUpsert,
} from "@api/services/replacement-delegation";
import type {
  ReplacementCustomerUpsertInput,
  ReplacementCustomersListQuery,
} from "@midday/replacement-backend";
import { shouldDelegateToReplacementBackend } from "@midday/replacement-backend";
import { extractBearerToken } from "./vault-presigned-url";
import { mapDelegationErrorToHttp } from "./replacement-rest-documents";

export async function fetchCustomersListForRest(
  params: ReplacementCustomersListQuery,
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<unknown>,
): Promise<unknown> {
  if (!shouldDelegateToReplacementBackend()) {
    return fetchLegacy();
  }

  const sessionAccessToken = extractBearerToken(authorizationHeader);
  try {
    const delegated = await tryDelegateCustomersGet(params, sessionAccessToken);
    if (delegated) {
      return delegated;
    }
    assertLegacyIdentityFallbackAllowed();
  } catch (error) {
    mapDelegationErrorToHttp(error);
  }

  return fetchLegacy();
}

export async function fetchCustomerByIdForRest(
  id: string,
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<unknown>,
): Promise<unknown> {
  if (!shouldDelegateToReplacementBackend()) {
    return fetchLegacy();
  }

  const sessionAccessToken = extractBearerToken(authorizationHeader);
  try {
    const delegated = await tryDelegateCustomersGetById(id, sessionAccessToken);
    if (delegated.delegated) {
      return delegated.customer;
    }
    assertLegacyIdentityFallbackAllowed();
  } catch (error) {
    mapDelegationErrorToHttp(error);
  }

  return fetchLegacy();
}

export async function upsertCustomerForRest(
  input: ReplacementCustomerUpsertInput,
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<unknown>,
): Promise<unknown> {
  if (!shouldDelegateToReplacementBackend()) {
    return fetchLegacy();
  }

  const sessionAccessToken = extractBearerToken(authorizationHeader);
  try {
    const delegated = await tryDelegateCustomerUpsert(input, sessionAccessToken);
    if (delegated.delegated) {
      return delegated.customer;
    }
    assertLegacyIdentityFallbackAllowed();
  } catch (error) {
    mapDelegationErrorToHttp(error);
  }

  return fetchLegacy();
}

export async function deleteCustomerForRest(
  id: string,
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<unknown>,
): Promise<unknown> {
  if (!shouldDelegateToReplacementBackend()) {
    return fetchLegacy();
  }

  const sessionAccessToken = extractBearerToken(authorizationHeader);
  try {
    const delegated = await tryDelegateCustomerDelete(id, sessionAccessToken);
    if (delegated.delegated) {
      return delegated.customer;
    }
    assertLegacyIdentityFallbackAllowed();
  } catch (error) {
    mapDelegationErrorToHttp(error);
  }

  return fetchLegacy();
}

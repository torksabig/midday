import {
  assertLegacyIdentityFallbackAllowed,
  tryDelegateInboxDelete,
  tryDelegateInboxGet,
  tryDelegateInboxGetById,
  tryDelegateInboxUpdate,
} from "@api/services/replacement-delegation";
import type { ReplacementInboxListQuery } from "@midday/replacement-backend";
import { shouldDelegateToReplacementBackend } from "@midday/replacement-backend";
import { extractBearerToken } from "./vault-presigned-url";
import { mapDelegationErrorToHttp } from "./replacement-rest-documents";

export async function fetchInboxListForRest(
  params: ReplacementInboxListQuery,
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<unknown>,
): Promise<unknown> {
  if (!shouldDelegateToReplacementBackend()) {
    return fetchLegacy();
  }

  const sessionAccessToken = extractBearerToken(authorizationHeader);
  try {
    const delegated = await tryDelegateInboxGet(params, sessionAccessToken);
    if (delegated) {
      return delegated;
    }
    assertLegacyIdentityFallbackAllowed();
  } catch (error) {
    mapDelegationErrorToHttp(error);
  }

  return fetchLegacy();
}

export async function fetchInboxByIdForRest(
  id: string,
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<unknown>,
): Promise<unknown> {
  if (!shouldDelegateToReplacementBackend()) {
    return fetchLegacy();
  }

  const sessionAccessToken = extractBearerToken(authorizationHeader);
  try {
    const delegated = await tryDelegateInboxGetById(id, sessionAccessToken);
    if (delegated.delegated) {
      return delegated.item;
    }
    assertLegacyIdentityFallbackAllowed();
  } catch (error) {
    mapDelegationErrorToHttp(error);
  }

  return fetchLegacy();
}

export async function updateInboxForRest(
  id: string,
  body: Record<string, unknown>,
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<unknown>,
): Promise<unknown> {
  if (!shouldDelegateToReplacementBackend()) {
    return fetchLegacy();
  }

  const sessionAccessToken = extractBearerToken(authorizationHeader);
  try {
    const delegated = await tryDelegateInboxUpdate(id, body, sessionAccessToken);
    if (delegated.delegated) {
      return delegated.item;
    }
    assertLegacyIdentityFallbackAllowed();
  } catch (error) {
    mapDelegationErrorToHttp(error);
  }

  return fetchLegacy();
}

export async function deleteInboxForRest(
  id: string,
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<{ id: string } | null | undefined>,
): Promise<{ id: string } | null | undefined> {
  if (!shouldDelegateToReplacementBackend()) {
    return fetchLegacy();
  }

  const sessionAccessToken = extractBearerToken(authorizationHeader);
  try {
    const delegated = await tryDelegateInboxDelete(id, sessionAccessToken);
    if (delegated) {
      return { id: delegated.id };
    }
    assertLegacyIdentityFallbackAllowed();
  } catch (error) {
    mapDelegationErrorToHttp(error);
  }

  return fetchLegacy();
}

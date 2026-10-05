import {
  assertLegacyIdentityFallbackAllowed,
  tryDelegateTrackerProjectDelete,
  tryDelegateTrackerProjectGetById,
  tryDelegateTrackerProjectUpsert,
  tryDelegateTrackerProjectsGet,
} from "@api/services/replacement-delegation";
import type {
  ReplacementTrackerProjectUpsertInput,
  ReplacementTrackerProjectsListQuery,
} from "@midday/replacement-backend";
import { shouldDelegateToReplacementBackend } from "@midday/replacement-backend";
import { mapDelegationErrorToHttp } from "./replacement-rest-documents";
import { extractBearerToken } from "./vault-presigned-url";

export async function fetchTrackerProjectsListForRest(
  params: ReplacementTrackerProjectsListQuery,
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<unknown>,
): Promise<unknown> {
  if (!shouldDelegateToReplacementBackend()) {
    return fetchLegacy();
  }

  const sessionAccessToken = extractBearerToken(authorizationHeader);
  try {
    const delegated = await tryDelegateTrackerProjectsGet(
      params,
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

export async function fetchTrackerProjectByIdForRest(
  id: string,
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<unknown>,
): Promise<unknown> {
  if (!shouldDelegateToReplacementBackend()) {
    return fetchLegacy();
  }

  const sessionAccessToken = extractBearerToken(authorizationHeader);
  try {
    const delegated = await tryDelegateTrackerProjectGetById(
      id,
      sessionAccessToken,
    );
    if (delegated.delegated) {
      return delegated.project;
    }
    assertLegacyIdentityFallbackAllowed();
  } catch (error) {
    mapDelegationErrorToHttp(error);
  }

  return fetchLegacy();
}

export async function upsertTrackerProjectForRest(
  input: ReplacementTrackerProjectUpsertInput,
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<unknown>,
): Promise<unknown> {
  if (!shouldDelegateToReplacementBackend()) {
    return fetchLegacy();
  }

  const sessionAccessToken = extractBearerToken(authorizationHeader);
  try {
    const delegated = await tryDelegateTrackerProjectUpsert(
      {
        ...input,
        tags: input.tags ?? null,
      },
      sessionAccessToken,
    );
    if (delegated.delegated) {
      return delegated.project;
    }
    assertLegacyIdentityFallbackAllowed();
  } catch (error) {
    mapDelegationErrorToHttp(error);
  }

  return fetchLegacy();
}

export async function deleteTrackerProjectForRest(
  id: string,
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<unknown>,
): Promise<unknown> {
  if (!shouldDelegateToReplacementBackend()) {
    return fetchLegacy();
  }

  const sessionAccessToken = extractBearerToken(authorizationHeader);
  try {
    const delegated = await tryDelegateTrackerProjectDelete(
      id,
      sessionAccessToken,
    );
    if (delegated.delegated) {
      return delegated.result;
    }
    assertLegacyIdentityFallbackAllowed();
  } catch (error) {
    mapDelegationErrorToHttp(error);
  }

  return fetchLegacy();
}

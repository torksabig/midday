import {
  assertLegacyIdentityFallbackAllowed,
  tryDelegateTagCreate,
  tryDelegateTagDelete,
  tryDelegateTagUpdate,
  tryDelegateTagsGet,
} from "@api/services/replacement-delegation";
import { shouldDelegateToReplacementBackend } from "@midday/replacement-backend";
import { extractBearerToken } from "./vault-presigned-url";
import { mapDelegationErrorToHttp } from "./replacement-rest-documents";

function findTagById(tags: unknown[], id: string): unknown | null {
  for (const tag of tags) {
    if (
      tag &&
      typeof tag === "object" &&
      "id" in tag &&
      (tag as { id: string }).id === id
    ) {
      return tag;
    }
  }
  return null;
}

export async function fetchTagsListForRest(
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<unknown>,
): Promise<unknown> {
  if (!shouldDelegateToReplacementBackend()) {
    return fetchLegacy();
  }

  const sessionAccessToken = extractBearerToken(authorizationHeader);
  try {
    const delegated = await tryDelegateTagsGet(sessionAccessToken);
    if (delegated) {
      return { data: delegated };
    }
    assertLegacyIdentityFallbackAllowed();
  } catch (error) {
    mapDelegationErrorToHttp(error);
  }

  return fetchLegacy();
}

export async function fetchTagByIdForRest(
  id: string,
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<unknown>,
): Promise<unknown> {
  if (!shouldDelegateToReplacementBackend()) {
    return fetchLegacy();
  }

  const sessionAccessToken = extractBearerToken(authorizationHeader);
  try {
    const delegated = await tryDelegateTagsGet(sessionAccessToken);
    if (delegated) {
      return findTagById(delegated, id);
    }
    assertLegacyIdentityFallbackAllowed();
  } catch (error) {
    mapDelegationErrorToHttp(error);
  }

  return fetchLegacy();
}

export async function createTagForRest(
  name: string,
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<unknown>,
): Promise<unknown> {
  if (!shouldDelegateToReplacementBackend()) {
    return fetchLegacy();
  }

  const sessionAccessToken = extractBearerToken(authorizationHeader);
  try {
    const delegated = await tryDelegateTagCreate(name, sessionAccessToken);
    if (delegated.delegated) {
      return delegated.tag;
    }
    assertLegacyIdentityFallbackAllowed();
  } catch (error) {
    mapDelegationErrorToHttp(error);
  }

  return fetchLegacy();
}

export async function updateTagForRest(
  id: string,
  name: string,
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<unknown>,
): Promise<unknown> {
  if (!shouldDelegateToReplacementBackend()) {
    return fetchLegacy();
  }

  const sessionAccessToken = extractBearerToken(authorizationHeader);
  try {
    const delegated = await tryDelegateTagUpdate(id, name, sessionAccessToken);
    if (delegated.delegated) {
      return delegated.tag;
    }
    assertLegacyIdentityFallbackAllowed();
  } catch (error) {
    mapDelegationErrorToHttp(error);
  }

  return fetchLegacy();
}

export async function deleteTagForRest(
  id: string,
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<unknown>,
): Promise<unknown> {
  if (!shouldDelegateToReplacementBackend()) {
    return fetchLegacy();
  }

  const sessionAccessToken = extractBearerToken(authorizationHeader);
  try {
    const delegated = await tryDelegateTagDelete(id, sessionAccessToken);
    if (delegated.delegated) {
      return delegated.tag;
    }
    assertLegacyIdentityFallbackAllowed();
  } catch (error) {
    mapDelegationErrorToHttp(error);
  }

  return fetchLegacy();
}

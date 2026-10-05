import {
  assertLegacyIdentityFallbackAllowed,
  tryDelegateInboxBlocklistCreate,
  tryDelegateInboxBlocklistDelete,
  tryDelegateInboxBlocklistGet,
  tryDelegateInboxConfirmMatch,
  tryDelegateInboxCreate,
  tryDelegateInboxDeclineMatch,
  tryDelegateInboxDelete,
  tryDelegateInboxDeleteMany,
  tryDelegateInboxGet,
  tryDelegateInboxGetById,
  tryDelegateInboxGetByStatus,
  tryDelegateInboxMatch,
  tryDelegateInboxSearch,
  tryDelegateInboxUnmatch,
  tryDelegateInboxUpdate,
} from "@api/services/replacement-delegation";
import type {
  ReplacementInboxBlocklistCreateInput,
  ReplacementInboxCreateInput,
  ReplacementInboxListQuery,
} from "@midday/replacement-backend";
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

export async function fetchInboxSearchForRest(
  params: { q?: string; transactionId?: string; limit?: number },
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<unknown>,
): Promise<unknown> {
  if (!shouldDelegateToReplacementBackend()) {
    return fetchLegacy();
  }

  const sessionAccessToken = extractBearerToken(authorizationHeader);
  try {
    const delegated = await tryDelegateInboxSearch(params, sessionAccessToken);
    if (delegated) {
      return delegated;
    }
    assertLegacyIdentityFallbackAllowed();
  } catch (error) {
    mapDelegationErrorToHttp(error);
  }

  return fetchLegacy();
}

export async function fetchInboxByStatusForRest(
  params: { status?: string },
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<unknown>,
): Promise<unknown> {
  if (!shouldDelegateToReplacementBackend()) {
    return fetchLegacy();
  }

  const sessionAccessToken = extractBearerToken(authorizationHeader);
  try {
    const delegated = await tryDelegateInboxGetByStatus(
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

export async function createInboxForRest(
  input: ReplacementInboxCreateInput,
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<unknown>,
): Promise<unknown> {
  if (!shouldDelegateToReplacementBackend()) {
    return fetchLegacy();
  }

  const sessionAccessToken = extractBearerToken(authorizationHeader);
  try {
    const delegated = await tryDelegateInboxCreate(input, sessionAccessToken);
    if (delegated.delegated) {
      return delegated.inbox;
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

export async function matchInboxForRest(
  id: string,
  transactionId: string,
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<unknown>,
): Promise<unknown> {
  if (!shouldDelegateToReplacementBackend()) {
    return fetchLegacy();
  }

  const sessionAccessToken = extractBearerToken(authorizationHeader);
  try {
    const delegated = await tryDelegateInboxMatch(
      id,
      transactionId,
      sessionAccessToken,
    );
    if (delegated.delegated) {
      return delegated.item;
    }
    assertLegacyIdentityFallbackAllowed();
  } catch (error) {
    mapDelegationErrorToHttp(error);
  }

  return fetchLegacy();
}

export async function unmatchInboxForRest(
  id: string,
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<unknown>,
): Promise<unknown> {
  if (!shouldDelegateToReplacementBackend()) {
    return fetchLegacy();
  }

  const sessionAccessToken = extractBearerToken(authorizationHeader);
  try {
    const delegated = await tryDelegateInboxUnmatch(id, sessionAccessToken);
    if (delegated.delegated) {
      return delegated.result;
    }
    assertLegacyIdentityFallbackAllowed();
  } catch (error) {
    mapDelegationErrorToHttp(error);
  }

  return fetchLegacy();
}

export async function confirmInboxMatchForRest(
  input: {
    suggestionId: string;
    inboxId: string;
    transactionId: string;
  },
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<unknown>,
): Promise<unknown> {
  if (!shouldDelegateToReplacementBackend()) {
    return fetchLegacy();
  }

  const sessionAccessToken = extractBearerToken(authorizationHeader);
  try {
    const delegated = await tryDelegateInboxConfirmMatch(
      input,
      sessionAccessToken,
    );
    if (delegated.delegated) {
      return delegated.item;
    }
    assertLegacyIdentityFallbackAllowed();
  } catch (error) {
    mapDelegationErrorToHttp(error);
  }

  return fetchLegacy();
}

export async function declineInboxMatchForRest(
  input: { suggestionId: string; inboxId: string },
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<void>,
): Promise<void> {
  if (!shouldDelegateToReplacementBackend()) {
    return fetchLegacy();
  }

  const sessionAccessToken = extractBearerToken(authorizationHeader);
  try {
    const delegated = await tryDelegateInboxDeclineMatch(
      input,
      sessionAccessToken,
    );
    if (delegated.delegated) {
      return;
    }
    assertLegacyIdentityFallbackAllowed();
  } catch (error) {
    mapDelegationErrorToHttp(error);
  }

  return fetchLegacy();
}

export async function fetchInboxBlocklistForRest(
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<unknown[]>,
): Promise<unknown[]> {
  if (!shouldDelegateToReplacementBackend()) {
    return fetchLegacy();
  }

  const sessionAccessToken = extractBearerToken(authorizationHeader);
  try {
    const delegated = await tryDelegateInboxBlocklistGet(sessionAccessToken);
    if (delegated) {
      return delegated;
    }
    assertLegacyIdentityFallbackAllowed();
  } catch (error) {
    mapDelegationErrorToHttp(error);
  }

  return fetchLegacy();
}

export async function createInboxBlocklistForRest(
  input: ReplacementInboxBlocklistCreateInput,
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<unknown>,
): Promise<unknown> {
  if (!shouldDelegateToReplacementBackend()) {
    return fetchLegacy();
  }

  const sessionAccessToken = extractBearerToken(authorizationHeader);
  try {
    const delegated = await tryDelegateInboxBlocklistCreate(
      input,
      sessionAccessToken,
    );
    if (delegated.delegated) {
      return delegated.entry;
    }
    assertLegacyIdentityFallbackAllowed();
  } catch (error) {
    mapDelegationErrorToHttp(error);
  }

  return fetchLegacy();
}

export async function deleteInboxBlocklistForRest(
  id: string,
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<unknown>,
): Promise<unknown> {
  if (!shouldDelegateToReplacementBackend()) {
    return fetchLegacy();
  }

  const sessionAccessToken = extractBearerToken(authorizationHeader);
  try {
    const delegated = await tryDelegateInboxBlocklistDelete(
      id,
      sessionAccessToken,
    );
    if (delegated.delegated) {
      return delegated.entry;
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

export async function deleteInboxManyForRest(
  ids: string[],
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<Array<{ id: string }>>,
): Promise<Array<{ id: string }>> {
  if (!shouldDelegateToReplacementBackend()) {
    return fetchLegacy();
  }

  const sessionAccessToken = extractBearerToken(authorizationHeader);
  try {
    const delegated = await tryDelegateInboxDeleteMany(ids, sessionAccessToken);
    if (delegated) {
      return delegated.map((row) => ({ id: row.id }));
    }
    assertLegacyIdentityFallbackAllowed();
  } catch (error) {
    mapDelegationErrorToHttp(error);
  }

  return fetchLegacy();
}

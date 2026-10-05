import {
  assertLegacyIdentityFallbackAllowed,
  tryDelegateTrackerCurrentTimer,
  tryDelegateTrackerEntriesByRange,
  tryDelegateTrackerEntriesUpsert,
  tryDelegateTrackerEntryDelete,
  tryDelegateTrackerStartTimer,
  tryDelegateTrackerStopTimer,
  tryDelegateTrackerTimerStatus,
} from "@api/services/replacement-delegation";
import type {
  ReplacementStartTimerInput,
  ReplacementStopTimerInput,
  ReplacementTrackerEntriesByRangeQuery,
  ReplacementTrackerTimerQuery,
  ReplacementTrackerUpsertInput,
} from "@midday/replacement-backend";
import { shouldDelegateToReplacementBackend } from "@midday/replacement-backend";
import { mapDelegationErrorToHttp } from "./replacement-rest-documents";
import { extractBearerToken } from "./vault-presigned-url";

export function mapTrackerEntriesForRestResponse(items: unknown[]): unknown[] {
  return items.map((item) => {
    if (!item || typeof item !== "object") {
      return item;
    }
    const row = item as Record<string, unknown>;
    if ("trackerProject" in row) {
      const { trackerProject, ...rest } = row;
      return { ...rest, project: trackerProject };
    }
    return item;
  });
}

export async function fetchTrackerEntriesByRangeForRest(
  params: ReplacementTrackerEntriesByRangeQuery,
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<unknown>,
): Promise<unknown> {
  if (!shouldDelegateToReplacementBackend()) {
    return fetchLegacy();
  }

  const sessionAccessToken = extractBearerToken(authorizationHeader);
  try {
    const delegated = await tryDelegateTrackerEntriesByRange(
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

export async function upsertTrackerEntriesForRest(
  input: ReplacementTrackerUpsertInput,
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<unknown[]>,
): Promise<unknown[]> {
  if (!shouldDelegateToReplacementBackend()) {
    return fetchLegacy();
  }

  const sessionAccessToken = extractBearerToken(authorizationHeader);
  try {
    const delegated = await tryDelegateTrackerEntriesUpsert(
      input,
      sessionAccessToken,
    );
    if (delegated.delegated) {
      return mapTrackerEntriesForRestResponse(delegated.entries);
    }
    assertLegacyIdentityFallbackAllowed();
  } catch (error) {
    mapDelegationErrorToHttp(error);
  }

  return fetchLegacy();
}

export async function deleteTrackerEntryForRest(
  id: string,
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<unknown>,
): Promise<unknown> {
  if (!shouldDelegateToReplacementBackend()) {
    return fetchLegacy();
  }

  const sessionAccessToken = extractBearerToken(authorizationHeader);
  try {
    const delegated = await tryDelegateTrackerEntryDelete(id, sessionAccessToken);
    if (delegated.delegated) {
      return delegated.result;
    }
    assertLegacyIdentityFallbackAllowed();
  } catch (error) {
    mapDelegationErrorToHttp(error);
  }

  return fetchLegacy();
}

export async function startTimerForRest(
  input: ReplacementStartTimerInput,
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<unknown>,
): Promise<unknown> {
  if (!shouldDelegateToReplacementBackend()) {
    return fetchLegacy();
  }

  const sessionAccessToken = extractBearerToken(authorizationHeader);
  try {
    const delegated = await tryDelegateTrackerStartTimer(input, sessionAccessToken);
    if (delegated.delegated) {
      return delegated.entry;
    }
    assertLegacyIdentityFallbackAllowed();
  } catch (error) {
    mapDelegationErrorToHttp(error);
  }

  return fetchLegacy();
}

export async function stopTimerForRest(
  input: ReplacementStopTimerInput,
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<unknown>,
): Promise<unknown> {
  if (!shouldDelegateToReplacementBackend()) {
    return fetchLegacy();
  }

  const sessionAccessToken = extractBearerToken(authorizationHeader);
  try {
    const delegated = await tryDelegateTrackerStopTimer(input, sessionAccessToken);
    if (delegated.delegated) {
      return delegated.entry;
    }
    assertLegacyIdentityFallbackAllowed();
  } catch (error) {
    mapDelegationErrorToHttp(error);
  }

  return fetchLegacy();
}

export async function getCurrentTimerForRest(
  params: ReplacementTrackerTimerQuery,
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<unknown>,
): Promise<unknown> {
  if (!shouldDelegateToReplacementBackend()) {
    return fetchLegacy();
  }

  const sessionAccessToken = extractBearerToken(authorizationHeader);
  try {
    const delegated = await tryDelegateTrackerCurrentTimer(
      params,
      sessionAccessToken,
    );
    if (delegated.delegated) {
      return delegated.timer;
    }
    assertLegacyIdentityFallbackAllowed();
  } catch (error) {
    mapDelegationErrorToHttp(error);
  }

  return fetchLegacy();
}

export async function getTimerStatusForRest(
  params: ReplacementTrackerTimerQuery,
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<unknown>,
): Promise<unknown> {
  if (!shouldDelegateToReplacementBackend()) {
    return fetchLegacy();
  }

  const sessionAccessToken = extractBearerToken(authorizationHeader);
  try {
    const delegated = await tryDelegateTrackerTimerStatus(
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

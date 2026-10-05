import {
  assertLegacyIdentityFallbackAllowed,
  tryDelegateNotificationsList,
  tryDelegateNotificationUpdateStatus,
  tryDelegateNotificationsUpdateAll,
} from "@api/services/replacement-delegation";
import type { ReplacementNotificationsListQuery } from "@midday/replacement-backend";
import { shouldDelegateToReplacementBackend } from "@midday/replacement-backend";
import { mapDelegationErrorToHttp } from "./replacement-rest-documents";
import { extractBearerToken } from "./vault-presigned-url";

export async function fetchNotificationsListForRest(
  input: ReplacementNotificationsListQuery,
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<unknown>,
): Promise<unknown> {
  if (!shouldDelegateToReplacementBackend()) {
    return fetchLegacy();
  }

  const sessionAccessToken = extractBearerToken(authorizationHeader);
  try {
    const delegated = await tryDelegateNotificationsList(
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

export async function updateNotificationStatusForRest(
  activityId: string,
  status: "unread" | "read" | "archived",
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<unknown>,
): Promise<unknown> {
  if (!shouldDelegateToReplacementBackend()) {
    return fetchLegacy();
  }

  const sessionAccessToken = extractBearerToken(authorizationHeader);
  try {
    const delegated = await tryDelegateNotificationUpdateStatus(
      activityId,
      status,
      sessionAccessToken,
    );
    if (delegated.delegated) {
      return delegated.notification;
    }
    assertLegacyIdentityFallbackAllowed();
  } catch (error) {
    mapDelegationErrorToHttp(error);
  }

  return fetchLegacy();
}

export async function updateAllNotificationsStatusForRest(
  status: "unread" | "read" | "archived",
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<unknown>,
): Promise<unknown> {
  if (!shouldDelegateToReplacementBackend()) {
    return fetchLegacy();
  }

  const sessionAccessToken = extractBearerToken(authorizationHeader);
  try {
    const delegated = await tryDelegateNotificationsUpdateAll(
      status,
      sessionAccessToken,
    );
    if (delegated.delegated) {
      return delegated.notifications;
    }
    assertLegacyIdentityFallbackAllowed();
  } catch (error) {
    mapDelegationErrorToHttp(error);
  }

  return fetchLegacy();
}

import {
  assertLegacyIdentityFallbackAllowed,
  tryDelegateUserMe,
  tryDelegateUserUpdate,
} from "@api/services/replacement-delegation";
import { shouldDelegateToReplacementBackend } from "@midday/replacement-backend";
import { generateFileKey } from "@midday/encryption";
import { mapDelegationErrorToHttp } from "./replacement-rest-documents";
import { extractBearerToken } from "./vault-presigned-url";

async function enrichUserWithFileKey(user: unknown): Promise<unknown> {
  if (!user || typeof user !== "object") {
    return user;
  }
  const teamId =
    "teamId" in user
      ? ((user as { teamId: string | null }).teamId ?? null)
      : null;
  const fileKey = teamId ? await generateFileKey(teamId) : null;
  return { ...(user as Record<string, unknown>), fileKey };
}

export async function fetchCurrentUserForRest(
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<unknown>,
): Promise<unknown> {
  if (!shouldDelegateToReplacementBackend()) {
    return fetchLegacy();
  }

  const sessionAccessToken = extractBearerToken(authorizationHeader);
  try {
    const delegated = await tryDelegateUserMe(
      async (teamId) => generateFileKey(teamId),
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

export async function updateCurrentUserForRest(
  input: Record<string, unknown>,
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<unknown>,
): Promise<unknown> {
  if (!shouldDelegateToReplacementBackend()) {
    return fetchLegacy();
  }

  const sessionAccessToken = extractBearerToken(authorizationHeader);
  try {
    const delegated = await tryDelegateUserUpdate(input, sessionAccessToken);
    if (delegated.delegated) {
      return enrichUserWithFileKey(delegated.user);
    }
    assertLegacyIdentityFallbackAllowed();
  } catch (error) {
    mapDelegationErrorToHttp(error);
  }

  return fetchLegacy();
}

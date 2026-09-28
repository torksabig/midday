import {
  fetchReplacementAuthMePayload,
  fetchReplacementTeamCurrent,
  fetchReplacementTransactionsList,
  getReplacementApiUrl,
  mapReplacementToTeamCurrent,
  mapReplacementToUserMe,
  replacementDelegationRequiresSuccess,
  resolveReplacementBearerToken,
  shouldDelegateToReplacementBackend,
  type ReplacementTransactionsListQuery,
} from "@midday/replacement-backend";
import { TRPCError } from "@trpc/server";

/** Dual mode only: replacement failed but legacy Drizzle is still allowed. */
export function assertLegacyIdentityFallbackAllowed(): void {
  if (replacementDelegationRequiresSuccess()) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message:
        "Replacement backend delegation failed (legacy fallback disabled in replacement mode)",
    });
  }
}

export async function tryDelegateUserMe(
  generateFileKey: (teamId: string) => Promise<string | null>,
  sessionAccessToken?: string | null,
) {
  if (!shouldDelegateToReplacementBackend()) {
    return null;
  }

  const token = await resolveReplacementBearerToken(
    getReplacementApiUrl(),
    sessionAccessToken,
  );
  if (!token) {
    if (replacementDelegationRequiresSuccess()) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Replacement backend delegation failed: no bearer token",
      });
    }
    return null;
  }

  try {
    const baseUrl = getReplacementApiUrl();
    const payload = await fetchReplacementAuthMePayload(baseUrl, token);
    const fileKey = payload.team.id
      ? await generateFileKey(payload.team.id)
      : null;
    return mapReplacementToUserMe(payload, fileKey);
  } catch (error) {
    if (replacementDelegationRequiresSuccess()) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Replacement backend delegation failed",
        cause: error,
      });
    }
    return null;
  }
}

export async function tryDelegateTeamCurrent(
  sessionAccessToken?: string | null,
) {
  if (!shouldDelegateToReplacementBackend()) {
    return null;
  }

  const token = await resolveReplacementBearerToken(
    getReplacementApiUrl(),
    sessionAccessToken,
  );
  if (!token) {
    if (replacementDelegationRequiresSuccess()) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Replacement backend delegation failed: no bearer token",
      });
    }
    return null;
  }

  try {
    const baseUrl = getReplacementApiUrl();
    const payload = await fetchReplacementTeamCurrent(baseUrl, token);
    return mapReplacementToTeamCurrent(payload);
  } catch (error) {
    if (replacementDelegationRequiresSuccess()) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Replacement backend delegation failed",
        cause: error,
      });
    }
    return null;
  }
}

export async function tryDelegateTransactionsGet(
  input: ReplacementTransactionsListQuery,
  sessionAccessToken?: string | null,
) {
  if (!shouldDelegateToReplacementBackend()) {
    return null;
  }

  const token = await resolveReplacementBearerToken(
    getReplacementApiUrl(),
    sessionAccessToken,
  );
  if (!token) {
    if (replacementDelegationRequiresSuccess()) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Replacement backend delegation failed: no bearer token",
      });
    }
    return null;
  }

  try {
    const baseUrl = getReplacementApiUrl();
    return await fetchReplacementTransactionsList(baseUrl, token, input);
  } catch (error) {
    if (replacementDelegationRequiresSuccess()) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Replacement backend delegation failed",
        cause: error,
      });
    }
    return null;
  }
}

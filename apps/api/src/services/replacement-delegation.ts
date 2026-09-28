import {
  fetchReplacementAuthMePayload,
  fetchReplacementTeamCurrent,
  getReplacementApiUrl,
  mapReplacementToTeamCurrent,
  mapReplacementToUserMe,
  resolveReplacementBearerToken,
  shouldDelegateToReplacementBackend,
} from "@midday/replacement-backend";

export async function tryDelegateUserMe(
  generateFileKey: (teamId: string) => Promise<string | null>,
) {
  if (!shouldDelegateToReplacementBackend()) {
    return null;
  }

  const token = await resolveReplacementBearerToken();
  if (!token) {
    return null;
  }

  try {
    const baseUrl = getReplacementApiUrl();
    const payload = await fetchReplacementAuthMePayload(baseUrl, token);
    const fileKey = payload.team.id
      ? await generateFileKey(payload.team.id)
      : null;
    return mapReplacementToUserMe(payload, fileKey);
  } catch {
    return null;
  }
}

export async function tryDelegateTeamCurrent() {
  if (!shouldDelegateToReplacementBackend()) {
    return null;
  }

  const token = await resolveReplacementBearerToken();
  if (!token) {
    return null;
  }

  try {
    const baseUrl = getReplacementApiUrl();
    const payload = await fetchReplacementTeamCurrent(baseUrl, token);
    return mapReplacementToTeamCurrent(payload);
  } catch {
    return null;
  }
}

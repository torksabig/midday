import { getBackendMode, getReplacementApiUrl, shouldDelegateToReplacementBackend } from "./config";
import {
  type ReplacementAuthMePayload,
  type ReplacementTeamCurrentPayload,
  mapReplacementToTeamCurrent,
  mapReplacementToTransactionsGet,
  mapReplacementToUserMe,
  type MiddayTransactionsGetShape,
} from "./mappers";

export {
  mapReplacementToTeamCurrent,
  mapReplacementToTransactionsGet,
  mapReplacementToUserMe,
  type MiddayTransactionsGetShape,
  type ReplacementAuthMePayload,
  type ReplacementTeamCurrentPayload,
};

const DEFAULT_TIMEOUT_MS = 5_000;

function trimBase(baseUrl: string): string {
  return baseUrl.replace(/\/$/, "");
}

async function replacementFetch<T>(
  url: string,
  token: string,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<T> {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!res.ok) {
    throw new Error(`replacement API ${url} HTTP ${res.status}`);
  }

  return (await res.json()) as T;
}

/** Bearer for delegation: session JWT, explicit env, or demo login when enabled. */
export async function resolveReplacementBearerToken(
  baseUrl = getReplacementApiUrl(),
  sessionAccessToken?: string | null,
): Promise<string | null> {
  const fromSession = sessionAccessToken?.trim();
  if (fromSession) {
    return fromSession;
  }

  const fromEnv = process.env.REPLACEMENT_DELEGATION_TOKEN?.trim();
  if (fromEnv) {
    return fromEnv;
  }

  const useDemo =
    process.env.REPLACEMENT_DELEGATION_USE_DEMO === "1" ||
    process.env.REPLACEMENT_DELEGATION_USE_DEMO === "true";
  if (!useDemo) {
    return null;
  }

  const root = trimBase(baseUrl);
  const loginRes = await fetch(`${root}/api/v1/auth/demo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
  });

  if (!loginRes.ok) {
    return null;
  }

  const body = (await loginRes.json()) as { token?: string };
  return body.token ?? null;
}

export async function fetchReplacementAuthMePayload(
  baseUrl: string,
  token: string,
): Promise<ReplacementAuthMePayload> {
  const root = trimBase(baseUrl);
  const me = await replacementFetch<{ user: ReplacementAuthMePayload["user"]; team: ReplacementAuthMePayload["team"] }>(
    `${root}/api/v1/auth/me`,
    token,
  );

  let settings: ReplacementAuthMePayload["settings"];
  try {
    settings = await replacementFetch<{ currency: string; locale: string }>(
      `${root}/api/v1/settings`,
      token,
    );
  } catch {
    settings = undefined;
  }

  return { ...me, settings };
}

export async function fetchReplacementTeamCurrent(
  baseUrl: string,
  token: string,
): Promise<ReplacementTeamCurrentPayload> {
  const root = trimBase(baseUrl);
  return replacementFetch<ReplacementTeamCurrentPayload>(
    `${root}/api/v1/team/current`,
    token,
  );
}

export type ReplacementTransactionsListQuery = {
  cursor?: string | null;
  pageSize?: number;
  q?: string | null;
};

function buildTransactionsListQuery(
  params: ReplacementTransactionsListQuery,
): string {
  const search = new URLSearchParams();
  if (params.cursor) {
    search.set("cursor", params.cursor);
  }
  if (params.pageSize != null) {
    search.set("pageSize", String(params.pageSize));
  }
  if (params.q) {
    search.set("q", params.q);
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchReplacementTransactionsList(
  baseUrl: string,
  token: string,
  params: ReplacementTransactionsListQuery,
): Promise<MiddayTransactionsGetShape> {
  const root = trimBase(baseUrl);
  const query = buildTransactionsListQuery(params);
  const payload = await replacementFetch<unknown>(
    `${root}/api/v1/transactions${query}`,
    token,
  );
  return mapReplacementToTransactionsGet(payload);
}

export { shouldDelegateToReplacementBackend };

/** When false (dual), callers may fall back to legacy on delegation errors. */
export function replacementDelegationRequiresSuccess(): boolean {
  return getBackendMode() === "replacement";
}

export type ReplacementHealthResult = {
  ok: boolean;
  latencyMs: number;
  status?: number;
  body?: unknown;
  error?: string;
};

export type ReplacementAuthDemoResult = {
  ok: boolean;
  latencyMs: number;
  hasToken: boolean;
  error?: string;
};

function trimTrailingSlash(baseUrl: string): string {
  return baseUrl.replace(/\/$/, "");
}

/** Cheap liveness check against `GET /api/v1/health`. */
export async function probeReplacementHealth(
  baseUrl: string,
  timeoutMs = 3_000,
): Promise<ReplacementHealthResult> {
  const started = Date.now();
  const url = `${trimTrailingSlash(baseUrl)}/api/v1/health`;

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(timeoutMs),
    });
    const latencyMs = Date.now() - started;
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = undefined;
    }

    return {
      ok: res.ok,
      latencyMs,
      status: res.status,
      body,
      error: res.ok ? undefined : `HTTP ${res.status}`,
    };
  } catch (err) {
    return {
      ok: false,
      latencyMs: Date.now() - started,
      error: err instanceof Error ? err.message : "fetch failed",
    };
  }
}

/** End-to-end smoke: demo login + `GET /api/v1/auth/me` (no Midday Supabase). */
export async function probeReplacementAuthDemo(
  baseUrl: string,
  timeoutMs = 5_000,
): Promise<ReplacementAuthDemoResult> {
  const started = Date.now();
  const root = trimTrailingSlash(baseUrl);

  try {
    const loginRes = await fetch(`${root}/api/v1/auth/demo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (!loginRes.ok) {
      return {
        ok: false,
        latencyMs: Date.now() - started,
        hasToken: false,
        error: `demo login HTTP ${loginRes.status}`,
      };
    }

    const loginJson = (await loginRes.json()) as { token?: string };
    const token = loginJson.token;
    if (!token) {
      return {
        ok: false,
        latencyMs: Date.now() - started,
        hasToken: false,
        error: "demo login missing token",
      };
    }

    const meRes = await fetch(`${root}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(timeoutMs),
    });

    return {
      ok: meRes.ok,
      latencyMs: Date.now() - started,
      hasToken: true,
      error: meRes.ok ? undefined : `auth/me HTTP ${meRes.status}`,
    };
  } catch (err) {
    return {
      ok: false,
      latencyMs: Date.now() - started,
      hasToken: false,
      error: err instanceof Error ? err.message : "auth demo failed",
    };
  }
}

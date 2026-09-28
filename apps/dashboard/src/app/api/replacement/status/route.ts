import {
  getBackendMode,
  getReplacementApiUrl,
  probeReplacementAuthDemo,
  probeReplacementHealth,
  shouldProbeReplacementBackend,
} from "@midday/replacement-backend";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const mode = getBackendMode();
  const replacementApiUrl = getReplacementApiUrl();

  const payload: Record<string, unknown> = {
    mode,
    legacy: { dashboard: "ok" },
    replacement: {
      configured: shouldProbeReplacementBackend(),
      apiUrl: replacementApiUrl,
    },
  };

  if (shouldProbeReplacementBackend()) {
    const health = await probeReplacementHealth(replacementApiUrl);
    const auth = health.ok
      ? await probeReplacementAuthDemo(replacementApiUrl)
      : {
          ok: false,
          latencyMs: 0,
          hasToken: false,
          error: "skipped: health check failed",
        };

    payload.replacement = {
      ...(payload.replacement as object),
      health,
      auth,
      reachable: health.ok,
    };
  }

  return NextResponse.json(payload);
}

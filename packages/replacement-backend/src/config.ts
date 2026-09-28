export type BackendMode = "legacy" | "dual" | "replacement";

const BACKEND_MODES: BackendMode[] = ["legacy", "dual", "replacement"];

/** How the dashboard/API should treat the replacement Rust stack. */
export function getBackendMode(): BackendMode {
  const raw = (process.env.MIDDAY_BACKEND_MODE ?? "legacy").toLowerCase();
  if (BACKEND_MODES.includes(raw as BackendMode)) {
    return raw as BackendMode;
  }
  return "legacy";
}

/** Base URL for the clean-room replacement API (sibling `clone` by default). */
export function getReplacementApiUrl(): string {
  const url =
    process.env.REPLACEMENT_API_URL ??
    process.env.NEXT_PUBLIC_REPLACEMENT_API_URL ??
    "http://127.0.0.1:8787";
  return url.replace(/\/$/, "");
}

export function shouldProbeReplacementBackend(): boolean {
  const mode = getBackendMode();
  return mode === "dual" || mode === "replacement";
}

/** True when reads/writes should prefer the replacement API (replacement-only mode). */
export function shouldRouteToReplacementBackend(): boolean {
  return getBackendMode() === "replacement";
}

/** True when tRPC may delegate compatible procedures to the replacement REST API. */
export function shouldDelegateToReplacementBackend(): boolean {
  const mode = getBackendMode();
  return mode === "dual" || mode === "replacement";
}

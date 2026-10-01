import type { components } from "./openapi.generated";
import { RustApiError } from "./overview";

export type DashboardViewer = components["schemas"]["AuthenticatedViewer"];

export const viewerQueryKey = ["rust-api", "auth", "viewer"] as const;

export async function fetchViewer(
  baseUrl: string,
  accessToken: string | null,
): Promise<DashboardViewer> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(`${baseUrl}/api/v1/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return (await response.json()) as DashboardViewer;
}

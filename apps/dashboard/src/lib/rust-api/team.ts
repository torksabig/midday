import type { components } from "./openapi.generated";
import { RustApiError } from "./overview";

export type DashboardTeam = components["schemas"]["DashboardTeam"];

export const teamCurrentQueryKey = ["rust-api", "team", "current"] as const;

export async function fetchCurrentTeam(
  baseUrl: string,
  accessToken: string | null,
): Promise<DashboardTeam> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(`${baseUrl}/api/v1/team/current`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return (await response.json()) as DashboardTeam;
}

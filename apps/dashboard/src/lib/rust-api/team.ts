import type { components } from "./openapi.generated";
import { RustApiError } from "./overview";

export type DashboardTeam = components["schemas"]["DashboardTeam"];
type RawTeamMember = components["schemas"]["TeamMember"];
type RawTeamListItem = components["schemas"]["TeamListItem"];
type RawTeamUpdateResponse = components["schemas"]["TeamUpdateResponse"];

export type TeamMemberUser = {
  id: string;
  fullName: string | null;
  avatarUrl: string | null;
  email: string | null;
};

export type TeamMember = {
  id: string;
  role: string | null;
  teamId: string | null;
  user: TeamMemberUser | null;
};

export type TeamListItem = {
  id: string | null;
  name: string | null;
  plan: string | null;
  role: string | null;
  createdAt: string | null;
  canceledAt: string | null;
  updatedAt: string | null;
  logoUrl: string | null;
};

export type UpdateTeamInput = {
  name?: string | null;
  email?: string | null;
  logoUrl?: string | null;
  baseCurrency?: string | null;
  countryCode?: string | null;
  fiscalYearStartMonth?: number | null;
  exportSettings?: unknown;
  companyType?: string | null;
  heardAbout?: string | null;
};

export type TeamUpdateResult = {
  id: string;
  name: string | null;
  logoUrl: string | null;
  email: string | null;
  inboxId: string | null;
  plan: string | null;
  subscriptionStatus: string | null;
  baseCurrency: string | null;
  countryCode: string | null;
  fiscalYearStartMonth: number | null;
};

export const teamCurrentQueryKey = ["rust-api", "team", "current"] as const;

export function normalizeTeamMember(member: RawTeamMember): TeamMember {
  return {
    id: member.id,
    role: member.role ?? null,
    teamId: member.teamId ?? null,
    user: member.user
      ? {
          id: member.user.id,
          fullName: member.user.fullName ?? null,
          avatarUrl: member.user.avatarUrl ?? null,
          email: member.user.email ?? null,
        }
      : null,
  };
}

export function normalizeTeamListItem(team: RawTeamListItem): TeamListItem {
  return {
    id: team.id ?? null,
    name: team.name ?? null,
    plan: team.plan ?? null,
    role: team.role ?? null,
    createdAt: team.createdAt ?? null,
    canceledAt: team.canceledAt ?? null,
    updatedAt: team.updatedAt ?? null,
    logoUrl: team.logoUrl ?? null,
  };
}

export function normalizeTeamUpdate(
  row: RawTeamUpdateResponse,
): TeamUpdateResult {
  return {
    id: row.id,
    name: row.name ?? null,
    logoUrl: row.logo_url ?? null,
    email: row.email ?? null,
    inboxId: row.inbox_id ?? null,
    plan: row.plan ?? null,
    subscriptionStatus: row.subscription_status ?? null,
    baseCurrency: row.base_currency ?? null,
    countryCode: row.country_code ?? null,
    fiscalYearStartMonth: row.fiscal_year_start_month ?? null,
  };
}

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

export async function fetchTeamMembers(
  baseUrl: string,
  accessToken: string | null,
): Promise<TeamMember[]> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(`${baseUrl}/api/v1/team/members`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  const payload = (await response.json()) as RawTeamMember[];
  return payload.map(normalizeTeamMember);
}

export async function fetchTeamList(
  baseUrl: string,
  accessToken: string | null,
): Promise<TeamListItem[]> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(`${baseUrl}/api/v1/team/list`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  const payload = (await response.json()) as RawTeamListItem[];
  return payload.map(normalizeTeamListItem);
}

export async function updateTeam(
  baseUrl: string,
  accessToken: string | null,
  input: UpdateTeamInput,
): Promise<TeamUpdateResult> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const body: Record<string, unknown> = {};
  if (input.name !== undefined) body.name = input.name;
  if (input.email !== undefined) body.email = input.email;
  if (input.logoUrl !== undefined) body.logoUrl = input.logoUrl;
  if (input.baseCurrency !== undefined) body.baseCurrency = input.baseCurrency;
  if (input.countryCode !== undefined) body.countryCode = input.countryCode;
  if (input.fiscalYearStartMonth !== undefined) {
    body.fiscalYearStartMonth = input.fiscalYearStartMonth;
  }
  if (input.exportSettings !== undefined) {
    body.exportSettings = input.exportSettings;
  }
  if (input.companyType !== undefined) body.companyType = input.companyType;
  if (input.heardAbout !== undefined) body.heardAbout = input.heardAbout;

  const response = await fetch(`${baseUrl}/api/v1/team`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return normalizeTeamUpdate((await response.json()) as RawTeamUpdateResponse);
}

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

export type TeamConnectionStatus = {
  bankConnections: Array<{
    id: string;
    name: string;
    status: string | null;
    expiresAt: string | null;
    logoUrl: string | null;
  }>;
  inboxAccounts: Array<{
    id: string;
    email: string;
    status: string;
    provider: string;
  }>;
};

export type UserInvite = {
  id: string;
  email: string | null;
  code: string | null;
  role: string | null;
  user: {
    id: string;
    fullName: string | null;
    email: string | null;
  } | null;
  team: {
    id: string;
    name: string | null;
    logoUrl: string | null;
  } | null;
};

export type TeamInvite = {
  id: string;
  email: string | null;
  code: string | null;
  role: string | null;
  user: {
    id: string;
    fullName: string | null;
    email: string | null;
  } | null;
  team: {
    id: string;
    name: string | null;
    logoUrl: string | null;
  } | null;
};

export type AcceptTeamInviteInput = { id: string };
export type DeclineTeamInviteInput = { id: string };
export type DeleteTeamInviteInput = { id: string };

export type AcceptTeamInviteResult = {
  id: string;
  role: string | null;
  teamId: string | null;
  email: string | null;
};

export type UpdateTeamMemberInput = {
  userId: string;
  teamId: string;
  role: "owner" | "member" | string;
};

export type DeleteTeamMemberInput = {
  userId: string;
  teamId: string;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

export function normalizeUserInvite(row: unknown): UserInvite {
  const r = asRecord(row) ?? {};
  const user = asRecord(r.user);
  const team = asRecord(r.team);
  return {
    id: String(r.id ?? ""),
    email: asString(r.email),
    code: asString(r.code),
    role: asString(r.role),
    user: user
      ? {
          id: String(user.id ?? ""),
          fullName: asString(user.fullName) ?? asString(user.full_name),
          email: asString(user.email),
        }
      : null,
    team: team
      ? {
          id: String(team.id ?? ""),
          name: asString(team.name),
          logoUrl: asString(team.logoUrl) ?? asString(team.logo_url),
        }
      : null,
  };
}

export function normalizeTeamInvite(row: unknown): TeamInvite {
  return normalizeUserInvite(row);
}

export function normalizeTeamConnectionStatus(
  payload: unknown,
): TeamConnectionStatus {
  const root = asRecord(payload) ?? {};
  const banks = Array.isArray(root.bankConnections) ? root.bankConnections : [];
  const inboxes = Array.isArray(root.inboxAccounts) ? root.inboxAccounts : [];

  return {
    bankConnections: banks.map((row) => {
      const r = asRecord(row) ?? {};
      return {
        id: String(r.id ?? ""),
        name: String(r.name ?? ""),
        status: asString(r.status),
        expiresAt: asString(r.expiresAt) ?? asString(r.expires_at),
        logoUrl: asString(r.logoUrl) ?? asString(r.logo_url),
      };
    }),
    inboxAccounts: inboxes.map((row) => {
      const r = asRecord(row) ?? {};
      return {
        id: String(r.id ?? ""),
        email: String(r.email ?? ""),
        status: String(r.status ?? ""),
        provider: String(r.provider ?? ""),
      };
    }),
  };
}

export async function fetchTeamConnectionStatus(
  baseUrl: string,
  accessToken: string | null,
): Promise<TeamConnectionStatus> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(`${baseUrl}/api/v1/team/connection-status`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return normalizeTeamConnectionStatus(await response.json());
}

export async function fetchUserInvites(
  baseUrl: string,
  accessToken: string | null,
): Promise<UserInvite[]> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(`${baseUrl}/api/v1/user/invites`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  const payload = (await response.json()) as unknown[];
  return payload.map(normalizeUserInvite);
}

export async function fetchTeamInvites(
  baseUrl: string,
  accessToken: string | null,
): Promise<TeamInvite[]> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(`${baseUrl}/api/v1/team/invites`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  const payload = await response.json();
  const rows = Array.isArray(payload) ? payload : [];
  return rows.map(normalizeTeamInvite);
}

export async function acceptTeamInvite(
  baseUrl: string,
  accessToken: string | null,
  input: AcceptTeamInviteInput,
): Promise<AcceptTeamInviteResult> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(`${baseUrl}/api/v1/team/invites/accept`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: input.id }),
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  const row = asRecord(await response.json()) ?? {};
  return {
    id: String(row.id ?? input.id),
    role: asString(row.role),
    teamId: asString(row.teamId) ?? asString(row.team_id),
    email: asString(row.email),
  };
}

export async function declineTeamInvite(
  baseUrl: string,
  accessToken: string | null,
  input: DeclineTeamInviteInput,
): Promise<{ rowCount: number }> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(`${baseUrl}/api/v1/team/invites/decline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: input.id }),
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  const row = asRecord(await response.json()) ?? {};
  const rowCount =
    typeof row.rowCount === "number"
      ? row.rowCount
      : typeof row.row_count === "number"
        ? row.row_count
        : 0;
  return { rowCount };
}

export async function deleteTeamInvite(
  baseUrl: string,
  accessToken: string | null,
  input: DeleteTeamInviteInput,
): Promise<TeamInvite | null> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(
    `${baseUrl}/api/v1/team/invites/${encodeURIComponent(input.id)}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(8_000),
    },
  );

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  const payload = await response.json();
  if (payload == null) return null;
  return normalizeTeamInvite(payload);
}

export async function updateTeamMember(
  baseUrl: string,
  accessToken: string | null,
  input: UpdateTeamMemberInput,
): Promise<unknown> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(`${baseUrl}/api/v1/team/members`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: input.userId,
      teamId: input.teamId,
      role: input.role,
    }),
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return response.json();
}

export async function deleteTeamMember(
  baseUrl: string,
  accessToken: string | null,
  input: DeleteTeamMemberInput,
): Promise<unknown> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(`${baseUrl}/api/v1/team/members`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: input.userId,
      teamId: input.teamId,
    }),
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return response.json();
}

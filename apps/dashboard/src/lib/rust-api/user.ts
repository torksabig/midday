import type { RouterInputs, RouterOutputs } from "@api/trpc/routers/_app";
import type { components } from "./openapi.generated";
import { RustApiError } from "./overview";

type RawUserUpdateResponse = components["schemas"]["UserUpdateResponse"];

export type UpdateUserInput = {
  fullName?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  locale?: string | null;
  timeFormat?: number | null;
  dateFormat?: string | null;
  weekStartsOnMonday?: boolean | null;
  timezone?: string | null;
  timezoneAutoSync?: boolean | null;
};

export type UserUpdateResult = {
  id: string;
  fullName: string | null;
  email: string | null;
  avatarUrl: string | null;
  locale: string | null;
  timeFormat: number | null;
  dateFormat: string | null;
  weekStartsOnMonday: boolean | null;
  timezone: string | null;
  timezoneAutoSync: boolean | null;
  teamId: string | null;
};

export type SwitchTeamInput = RouterInputs["user"]["switchTeam"];
export type SwitchTeamResult = RouterOutputs["user"]["switchTeam"];

async function throwRustApiError(response: Response): Promise<never> {
  let message = `Rust API request failed with HTTP ${response.status}`;
  try {
    const body = (await response.json()) as {
      error?: { message?: string };
      message?: string;
    };
    const apiMessage = body.error?.message ?? body.message;
    if (typeof apiMessage === "string" && apiMessage.trim()) {
      message = apiMessage;
    }
  } catch {
    // keep status fallback
  }
  throw new RustApiError(response.status, message);
}

export function normalizeSwitchTeam(payload: unknown): SwitchTeamResult {
  const row = payload as {
    id?: string;
    teamId?: string | null;
    previousTeamId?: string | null;
  };
  return {
    id: row.id ?? "",
    teamId: row.teamId ?? null,
    previousTeamId: row.previousTeamId ?? null,
  } as SwitchTeamResult;
}

export function normalizeUserUpdate(
  row: RawUserUpdateResponse,
): UserUpdateResult {
  return {
    id: row.id,
    fullName: row.full_name ?? null,
    email: row.email ?? null,
    avatarUrl: row.avatar_url ?? null,
    locale: row.locale ?? null,
    timeFormat: row.time_format ?? null,
    dateFormat: row.date_format ?? null,
    weekStartsOnMonday: row.week_starts_on_monday ?? null,
    timezone: row.timezone ?? null,
    timezoneAutoSync: row.timezone_auto_sync ?? null,
    teamId: row.team_id ?? null,
  };
}

export async function updateUser(
  baseUrl: string,
  accessToken: string | null,
  input: UpdateUserInput,
): Promise<UserUpdateResult> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const body: Record<string, unknown> = {};
  if (input.fullName !== undefined) body.fullName = input.fullName;
  if (input.email !== undefined) body.email = input.email;
  if (input.avatarUrl !== undefined) body.avatarUrl = input.avatarUrl;
  if (input.locale !== undefined) body.locale = input.locale;
  if (input.timeFormat !== undefined) body.timeFormat = input.timeFormat;
  if (input.dateFormat !== undefined) body.dateFormat = input.dateFormat;
  if (input.weekStartsOnMonday !== undefined) {
    body.weekStartsOnMonday = input.weekStartsOnMonday;
  }
  if (input.timezone !== undefined) body.timezone = input.timezone;
  if (input.timezoneAutoSync !== undefined) {
    body.timezoneAutoSync = input.timezoneAutoSync;
  }

  const response = await fetch(`${baseUrl}/api/v1/user`, {
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

  return normalizeUserUpdate((await response.json()) as RawUserUpdateResponse);
}

export async function switchTeam(
  baseUrl: string,
  accessToken: string | null,
  input: SwitchTeamInput,
): Promise<SwitchTeamResult> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(`${baseUrl}/api/v1/user/switch-team`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ teamId: input.teamId }),
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) await throwRustApiError(response);

  return normalizeSwitchTeam(await response.json());
}

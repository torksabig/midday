/** Clone `GET /api/v1/auth/me` + settings subset mapped to Midday `user.me` shape. */
export type ReplacementAuthMePayload = {
  user: { id: string; email: string; name: string };
  team: { id: string; name: string };
  settings?: { currency: string; locale: string };
};

export type MiddayUserMeShape = {
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
  team: {
    id: string;
    name: string;
    logoUrl: string | null;
    email: string | null;
    plan: string;
    subscriptionStatus: string | null;
    inboxId: string | null;
    createdAt: Date | null;
    countryCode: string | null;
    canceledAt: Date | null;
    baseCurrency: string | null;
  } | null;
  fileKey: string | null;
};

export type ReplacementTeamCurrentPayload = {
  id: string;
  name: string;
  base_currency: string;
  locale: string | null;
};

export type MiddayTeamCurrentShape = {
  id: string;
  name: string;
  logoUrl: string | null;
  email: string | null;
  inboxId: string | null;
  plan: string;
  subscriptionStatus: string | null;
  canceledAt: Date | null;
  baseCurrency: string | null;
  countryCode: string | null;
  fiscalYearStartMonth: number | null;
  exportSettings: unknown;
  stripeAccountId: string | null;
  stripeConnectStatus: string | null;
};

export function mapReplacementToUserMe(
  payload: ReplacementAuthMePayload,
  fileKey: string | null,
): MiddayUserMeShape {
  const currency = payload.settings?.currency ?? "USD";
  const locale = payload.settings?.locale ?? null;

  return {
    id: payload.user.id,
    fullName: payload.user.name,
    email: payload.user.email,
    avatarUrl: null,
    locale,
    timeFormat: null,
    dateFormat: null,
    weekStartsOnMonday: null,
    timezone: null,
    timezoneAutoSync: null,
    teamId: payload.team.id,
    team: {
      id: payload.team.id,
      name: payload.team.name,
      logoUrl: null,
      email: null,
      plan: "trial",
      subscriptionStatus: null,
      inboxId: null,
      createdAt: null,
      countryCode: null,
      canceledAt: null,
      baseCurrency: currency,
    },
    fileKey,
  };
}

export function mapReplacementToTeamCurrent(
  payload: ReplacementTeamCurrentPayload,
): MiddayTeamCurrentShape {
  return {
    id: payload.id,
    name: payload.name,
    logoUrl: null,
    email: null,
    inboxId: null,
    plan: "trial",
    subscriptionStatus: null,
    canceledAt: null,
    baseCurrency: payload.base_currency,
    countryCode: null,
    fiscalYearStartMonth: null,
    exportSettings: null,
    stripeAccountId: null,
    stripeConnectStatus: null,
  };
}

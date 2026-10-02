import { expect, test } from "bun:test";
import { normalizeTeamListItem, normalizeTeamMember, normalizeTeamUpdate } from "./team";
import { normalizeUserUpdate } from "./user";

test("normalizes Rust team members for the dashboard", () => {
  expect(
    normalizeTeamMember({
      id: "membership-1",
      role: "owner",
      teamId: "team-1",
      user: {
        id: "user-1",
        fullName: "Ada Lovelace",
        avatarUrl: null,
        email: "ada@example.com",
      },
    }),
  ).toEqual({
    id: "membership-1",
    role: "owner",
    teamId: "team-1",
    user: {
      id: "user-1",
      fullName: "Ada Lovelace",
      avatarUrl: null,
      email: "ada@example.com",
    },
  });
});

test("normalizes Rust team list items for the dashboard", () => {
  expect(
    normalizeTeamListItem({
      id: "team-1",
      name: "Acme",
      plan: "pro",
      role: "owner",
      createdAt: "2026-01-01",
      canceledAt: null,
      updatedAt: "2026-01-01",
      logoUrl: null,
    }),
  ).toEqual({
    id: "team-1",
    name: "Acme",
    plan: "pro",
    role: "owner",
    createdAt: "2026-01-01",
    canceledAt: null,
    updatedAt: "2026-01-01",
    logoUrl: null,
  });
});

test("normalizes snake_case team/user update responses", () => {
  expect(
    normalizeTeamUpdate({
      id: "team-1",
      name: "Acme",
      logo_url: null,
      email: "team@acme.com",
      inbox_id: "inbox-1",
      plan: "pro",
      subscription_status: "active",
      base_currency: "EUR",
      country_code: "FI",
      fiscal_year_start_month: 1,
    }),
  ).toEqual({
    id: "team-1",
    name: "Acme",
    logoUrl: null,
    email: "team@acme.com",
    inboxId: "inbox-1",
    plan: "pro",
    subscriptionStatus: "active",
    baseCurrency: "EUR",
    countryCode: "FI",
    fiscalYearStartMonth: 1,
  });

  expect(
    normalizeUserUpdate({
      id: "user-1",
      full_name: "Ada",
      email: "ada@example.com",
      avatar_url: null,
      locale: "en",
      time_format: 24,
      date_format: "yyyy-MM-dd",
      week_starts_on_monday: true,
      timezone: "UTC",
      timezone_auto_sync: false,
      team_id: "team-1",
    }),
  ).toEqual({
    id: "user-1",
    fullName: "Ada",
    email: "ada@example.com",
    avatarUrl: null,
    locale: "en",
    timeFormat: 24,
    dateFormat: "yyyy-MM-dd",
    weekStartsOnMonday: true,
    timezone: "UTC",
    timezoneAutoSync: false,
    teamId: "team-1",
  });
});

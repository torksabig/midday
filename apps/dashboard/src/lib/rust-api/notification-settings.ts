import type { components } from "./openapi.generated";
import { RustApiError } from "./overview";

type RawNotificationPreference =
  components["schemas"]["NotificationPreference"];
type RawNotificationSetting = components["schemas"]["NotificationSetting"];

export type NotificationChannel = "in_app" | "email" | "push";

export type NotificationPreference = Omit<
  RawNotificationPreference,
  "channels" | "settings"
> & {
  channels: NotificationChannel[];
  settings: {
    channel: NotificationChannel;
    enabled: boolean;
  }[];
};

export type NotificationSetting = Omit<RawNotificationSetting, "channel"> & {
  channel: NotificationChannel;
};

export type UpdateNotificationSettingInput = {
  notificationType: string;
  channel: NotificationChannel;
  enabled: boolean;
};

function requireAccessToken(accessToken: string | null) {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");
}

function normalizeChannel(channel: string): NotificationChannel {
  if (channel === "in_app" || channel === "email" || channel === "push") {
    return channel;
  }
  throw new Error(`Unexpected notification channel: ${channel}`);
}

function normalizePreference(
  preference: RawNotificationPreference,
): NotificationPreference {
  return {
    ...preference,
    channels: preference.channels.map(normalizeChannel),
    settings: preference.settings.map((setting) => ({
      channel: normalizeChannel(setting.channel),
      enabled: setting.enabled,
    })),
  };
}

function normalizeSetting(
  setting: RawNotificationSetting,
): NotificationSetting {
  return {
    ...setting,
    channel: normalizeChannel(setting.channel),
  };
}

export async function fetchNotificationPreferences(
  baseUrl: string,
  accessToken: string | null,
): Promise<NotificationPreference[]> {
  requireAccessToken(accessToken);

  const response = await fetch(
    `${baseUrl}/api/v1/notification-settings/preferences`,
    {
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

  const payload = (await response.json()) as RawNotificationPreference[];
  return payload.map(normalizePreference);
}

export async function updateNotificationSetting(
  baseUrl: string,
  accessToken: string | null,
  input: UpdateNotificationSettingInput,
): Promise<NotificationSetting> {
  requireAccessToken(accessToken);

  const response = await fetch(`${baseUrl}/api/v1/notification-settings`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return normalizeSetting((await response.json()) as RawNotificationSetting);
}

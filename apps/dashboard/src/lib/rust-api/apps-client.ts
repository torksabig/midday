"use client";

import { type QueryKey, queryOptions } from "@tanstack/react-query";
import { getAccessToken } from "@/utils/session";
import {
  type CreatePlatformLinkTokenInput,
  type DisconnectAppInput,
  type InstalledApp,
  type PlatformLinkToken,
  type UpdateAppSettingsInput,
  createPlatformLinkToken,
  disconnectApp,
  fetchApps,
  updateAppSettings,
} from "./apps";

function getRustApiUrl() {
  const url = process.env.NEXT_PUBLIC_RUST_API_URL;

  if (url) return url.replace(/\/$/, "");
  if (process.env.NODE_ENV !== "production") return "http://127.0.0.1:8787";

  throw new Error("NEXT_PUBLIC_RUST_API_URL must be configured");
}

export function appsQueryOptions(queryKey: QueryKey) {
  return queryOptions<InstalledApp[]>({
    queryKey,
    queryFn: async () => fetchApps(getRustApiUrl(), await getAccessToken()),
  });
}

export async function disconnectAppFromRust(input: DisconnectAppInput) {
  return disconnectApp(getRustApiUrl(), await getAccessToken(), input);
}

export async function updateAppSettingsFromRust(input: UpdateAppSettingsInput) {
  return updateAppSettings(getRustApiUrl(), await getAccessToken(), input);
}

export async function createPlatformLinkTokenFromRust(
  input: CreatePlatformLinkTokenInput,
): Promise<PlatformLinkToken> {
  return createPlatformLinkToken(
    getRustApiUrl(),
    await getAccessToken(),
    input,
  );
}

"use client";

import { getAccessToken } from "@/utils/session";
import {
  type SwitchTeamInput,
  type SwitchTeamResult,
  type UpdateUserInput,
  switchTeam,
  updateUser,
} from "./user";

function getRustApiUrl() {
  const url = process.env.NEXT_PUBLIC_RUST_API_URL;

  if (url) return url.replace(/\/$/, "");
  if (process.env.NODE_ENV !== "production") return "http://127.0.0.1:8787";

  throw new Error("NEXT_PUBLIC_RUST_API_URL must be configured");
}

export async function updateUserFromRust(input: UpdateUserInput) {
  return updateUser(getRustApiUrl(), await getAccessToken(), input);
}

export async function switchTeamFromRust(
  input: SwitchTeamInput,
): Promise<SwitchTeamResult> {
  return switchTeam(getRustApiUrl(), await getAccessToken(), input);
}

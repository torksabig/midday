"use client";

import { getAccessToken } from "@/utils/session";
import { fetchAppById } from "./apps";

function getRustApiUrl() {
  const url = process.env.NEXT_PUBLIC_RUST_API_URL;

  if (url) return url.replace(/\/$/, "");
  if (process.env.NODE_ENV !== "production") return "http://127.0.0.1:8787";

  throw new Error("NEXT_PUBLIC_RUST_API_URL must be configured");
}

/** Rust SQL half of `accounting.export` — verify provider app row has config. */
export async function prepareAccountingProviderForExport(
  providerId: string,
): Promise<void> {
  const app = await fetchAppById(
    getRustApiUrl(),
    await getAccessToken(),
    providerId,
  );

  if (!app?.config) {
    throw new Error(
      `${providerId} is not connected. Please connect it first.`,
    );
  }
}

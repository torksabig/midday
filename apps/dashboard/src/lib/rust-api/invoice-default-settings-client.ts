"use client";

import { queryOptions } from "@tanstack/react-query";
import {
  fetchInvoiceDefaultSettings,
  invoiceDefaultSettingsQueryKey,
} from "@/lib/rust-api/invoice-default-settings";
import { getAccessToken } from "@/utils/session";

function getRustApiUrl() {
  const url = process.env.NEXT_PUBLIC_RUST_API_URL;

  if (url) return url.replace(/\/$/, "");
  if (process.env.NODE_ENV !== "production") return "http://127.0.0.1:8787";

  throw new Error("NEXT_PUBLIC_RUST_API_URL must be configured");
}

export function invoiceDefaultSettingsQueryOptions() {
  return queryOptions({
    queryKey: invoiceDefaultSettingsQueryKey,
    queryFn: async () => {
      const accessToken = await getAccessToken();
      return fetchInvoiceDefaultSettings(getRustApiUrl(), accessToken);
    },
  });
}

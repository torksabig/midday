import "server-only";

import { queryOptions } from "@tanstack/react-query";
import {
  fetchInvoiceDefaultSettings,
  invoiceDefaultSettingsQueryKey,
} from "@/lib/rust-api/invoice-default-settings";
import { getServerRequestContext } from "@/trpc/request-context";

function getRustApiUrl() {
  const url =
    process.env.RUST_API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_RUST_API_URL;

  if (url) return url.replace(/\/$/, "");
  if (process.env.NODE_ENV !== "production") return "http://127.0.0.1:8787";

  throw new Error("RUST_API_INTERNAL_URL must be configured");
}

export function invoiceDefaultSettingsServerQueryOptions() {
  return queryOptions({
    queryKey: invoiceDefaultSettingsQueryKey,
    queryFn: async () => {
      const { session } = await getServerRequestContext();
      return fetchInvoiceDefaultSettings(
        getRustApiUrl(),
        session?.access_token ?? null,
      );
    },
  });
}

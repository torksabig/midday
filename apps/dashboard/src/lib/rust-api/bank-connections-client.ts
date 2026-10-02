"use client";

import { type QueryKey, queryOptions } from "@tanstack/react-query";
import { getAccessToken } from "@/utils/session";
import {
  type BankConnectionListItem,
  type BankConnectionsListParams,
  fetchBankConnections,
  type ReconnectBankConnectionInput,
  reconnectBankConnection,
} from "./bank-connections";

export type { BankConnectionListItem };

function getRustApiUrl() {
  const url = process.env.NEXT_PUBLIC_RUST_API_URL;

  if (url) return url.replace(/\/$/, "");
  if (process.env.NODE_ENV !== "production") return "http://127.0.0.1:8787";

  throw new Error("NEXT_PUBLIC_RUST_API_URL must be configured");
}

async function fetchBrowserBankConnections(
  params: BankConnectionsListParams,
): Promise<BankConnectionListItem[]> {
  return fetchBankConnections(getRustApiUrl(), await getAccessToken(), params);
}

export function bankConnectionsQueryOptions(
  queryKey: QueryKey,
  params: BankConnectionsListParams = {},
) {
  return queryOptions<BankConnectionListItem[]>({
    queryKey,
    queryFn: () => fetchBrowserBankConnections(params),
  });
}

export async function reconnectBankConnectionFromRust(
  input: ReconnectBankConnectionInput,
) {
  return reconnectBankConnection(
    getRustApiUrl(),
    await getAccessToken(),
    input,
  );
}

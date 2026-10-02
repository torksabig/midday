import "server-only";

import { type QueryKey, queryOptions } from "@tanstack/react-query";
import { getServerRequestContext } from "@/trpc/request-context";
import {
  type BankConnectionListItem,
  type BankConnectionsListParams,
  fetchBankConnections,
  type ReconnectBankConnectionInput,
  reconnectBankConnection,
} from "./bank-connections";

function getRustApiUrl() {
  const url =
    process.env.RUST_API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_RUST_API_URL;

  if (url) return url.replace(/\/$/, "");
  if (process.env.NODE_ENV !== "production") return "http://127.0.0.1:8787";

  throw new Error("RUST_API_INTERNAL_URL must be configured");
}

export function bankConnectionsServerQueryOptions(
  queryKey: QueryKey,
  params: BankConnectionsListParams = {},
) {
  return queryOptions({
    queryKey,
    queryFn: async (): Promise<BankConnectionListItem[]> => {
      const { session } = await getServerRequestContext();
      return fetchBankConnections(
        getRustApiUrl(),
        session?.access_token ?? null,
        params,
      );
    },
  });
}

export async function reconnectBankConnectionFromRustServer(
  input: ReconnectBankConnectionInput,
) {
  const { session } = await getServerRequestContext();
  return reconnectBankConnection(
    getRustApiUrl(),
    session?.access_token ?? null,
    input,
  );
}

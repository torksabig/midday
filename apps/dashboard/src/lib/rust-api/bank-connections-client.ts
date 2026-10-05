"use client";

import { type QueryKey, queryOptions } from "@tanstack/react-query";
import { getAccessToken } from "@/utils/session";
import {
  type BankConnectionListItem,
  type BankConnectionsListParams,
  deleteBankConnection,
  fetchBankConnections,
  type ReconnectBankConnectionInput,
  reconnectBankConnection,
} from "./bank-connections";

export type EnqueueDeleteConnectionInput = {
  referenceId: string | null;
  provider: "gocardless" | "teller" | "plaid" | "enablebanking";
  accessToken: string | null;
};

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

export async function deleteBankConnectionFromRust(id: string) {
  return deleteBankConnection(getRustApiUrl(), await getAccessToken(), id);
}

export async function deleteBankConnectionWithProviderCleanup(
  input: {
    id: string;
    fallbackProvider?: EnqueueDeleteConnectionInput["provider"];
  },
  enqueueDeleteConnection: (
    payload: EnqueueDeleteConnectionInput,
  ) => Promise<unknown>,
) {
  const data = await deleteBankConnectionFromRust(input.id);
  if (!data) {
    throw new Error("Bank connection not found");
  }

  const provider = (data.provider ??
    input.fallbackProvider) as EnqueueDeleteConnectionInput["provider"] | null;
  if (provider) {
    await enqueueDeleteConnection({
      referenceId: data.referenceId,
      provider,
      accessToken: data.accessToken,
    });
  }

  return data;
}

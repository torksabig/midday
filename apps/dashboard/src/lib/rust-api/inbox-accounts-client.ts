"use client";

import { type QueryKey, queryOptions } from "@tanstack/react-query";
import { getAccessToken } from "@/utils/session";
import {
  type DeleteInboxAccountResult,
  type InboxAccount,
  deleteInboxAccount,
  fetchInboxAccountById,
  fetchInboxAccounts,
} from "./inbox-accounts";

function getRustApiUrl() {
  const url = process.env.NEXT_PUBLIC_RUST_API_URL;

  if (url) return url.replace(/\/$/, "");
  if (process.env.NODE_ENV !== "production") return "http://127.0.0.1:8787";

  throw new Error("NEXT_PUBLIC_RUST_API_URL must be configured");
}

export function inboxAccountsQueryOptions(queryKey: QueryKey) {
  return queryOptions<InboxAccount[]>({
    queryKey,
    queryFn: async () =>
      fetchInboxAccounts(getRustApiUrl(), await getAccessToken()),
  });
}

export async function deleteInboxAccountFromRust(
  id: string,
): Promise<DeleteInboxAccountResult | null> {
  return deleteInboxAccount(getRustApiUrl(), await getAccessToken(), id);
}

export async function fetchInboxAccountByIdFromRust(
  id: string,
): Promise<InboxAccount | null> {
  return fetchInboxAccountById(getRustApiUrl(), await getAccessToken(), id);
}

export async function deleteInboxAccountWithScheduleCleanup(
  input: { id: string },
  enqueueSchedule: (scheduleId: string) => Promise<unknown>,
): Promise<DeleteInboxAccountResult | null> {
  const data = await deleteInboxAccountFromRust(input.id);
  if (data?.scheduleId) {
    await enqueueSchedule(data.scheduleId);
  }
  return data;
}

"use client";

import { type QueryKey, queryOptions } from "@tanstack/react-query";
import { getAccessToken } from "@/utils/session";
import {
  type GetUpcomingParams,
  type InvoiceRecurringDetail,
  type InvoiceRecurringList,
  type InvoiceRecurringResume,
  type InvoiceRecurringUpcoming,
  type ListInvoiceRecurringParams,
  fetchInvoiceRecurringById,
  fetchInvoiceRecurringList,
  fetchInvoiceRecurringUpcoming,
  resumeInvoiceRecurring,
} from "./invoice-recurring";

function getRustApiUrl() {
  const url = process.env.NEXT_PUBLIC_RUST_API_URL;

  if (url) return url.replace(/\/$/, "");
  if (process.env.NODE_ENV !== "production") return "http://127.0.0.1:8787";

  throw new Error("NEXT_PUBLIC_RUST_API_URL must be configured");
}

export function invoiceRecurringListQueryOptions(
  queryKey: QueryKey,
  params: ListInvoiceRecurringParams = {},
) {
  return queryOptions<InvoiceRecurringList>({
    queryKey,
    queryFn: async () =>
      fetchInvoiceRecurringList(getRustApiUrl(), await getAccessToken(), params),
  });
}

export function invoiceRecurringByIdQueryOptions(
  queryKey: QueryKey,
  id: string,
  options: { enabled?: boolean } = {},
) {
  return queryOptions<InvoiceRecurringDetail>({
    queryKey,
    queryFn: async () =>
      fetchInvoiceRecurringById(getRustApiUrl(), await getAccessToken(), id),
    enabled: options.enabled,
  });
}

export function invoiceRecurringUpcomingQueryOptions(
  queryKey: QueryKey,
  params: GetUpcomingParams,
  options: { enabled?: boolean } = {},
) {
  return queryOptions<InvoiceRecurringUpcoming>({
    queryKey,
    queryFn: async () =>
      fetchInvoiceRecurringUpcoming(
        getRustApiUrl(),
        await getAccessToken(),
        params,
      ),
    enabled: options.enabled,
  });
}

export async function resumeInvoiceRecurringFromRust(input: {
  id: string;
}): Promise<InvoiceRecurringResume> {
  return resumeInvoiceRecurring(
    getRustApiUrl(),
    await getAccessToken(),
    input.id,
  );
}

"use client";

import {
  infiniteQueryOptions,
  type QueryKey,
  queryOptions,
} from "@tanstack/react-query";
import { getAccessToken } from "@/utils/session";
import {
  type Invoice,
  type InvoicePaymentStatus,
  type InvoiceSummary,
  type InvoiceSummaryParams,
  type InvoicesList,
  type InvoicesListParams,
  fetchInvoiceById,
  fetchInvoicePaymentStatus,
  fetchInvoiceSummary,
  fetchInvoicesList,
} from "./invoices";

function getRustApiUrl() {
  const url = process.env.NEXT_PUBLIC_RUST_API_URL;

  if (url) return url.replace(/\/$/, "");
  if (process.env.NODE_ENV !== "production") return "http://127.0.0.1:8787";

  throw new Error("NEXT_PUBLIC_RUST_API_URL must be configured");
}

export function invoicesInfiniteQueryOptions(
  queryKey: QueryKey,
  params: InvoicesListParams,
) {
  return infiniteQueryOptions({
    queryKey,
    queryFn: async ({ pageParam }): Promise<InvoicesList> =>
      fetchInvoicesList(getRustApiUrl(), await getAccessToken(), {
        ...params,
        cursor: pageParam ?? undefined,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.meta.cursor ?? undefined,
  });
}

export function invoiceByIdQueryOptions(
  queryKey: QueryKey,
  id: string,
  options: { enabled?: boolean; staleTime?: number } = {},
) {
  return queryOptions<Invoice | null>({
    queryKey,
    queryFn: async () =>
      fetchInvoiceById(getRustApiUrl(), await getAccessToken(), id),
    enabled: options.enabled,
    staleTime: options.staleTime,
  });
}

export function invoicePaymentStatusQueryOptions(queryKey: QueryKey) {
  return queryOptions<InvoicePaymentStatus>({
    queryKey,
    queryFn: async () =>
      fetchInvoicePaymentStatus(getRustApiUrl(), await getAccessToken()),
  });
}

export function invoiceSummaryQueryOptions(
  queryKey: QueryKey,
  params: InvoiceSummaryParams = {},
) {
  return queryOptions<InvoiceSummary>({
    queryKey,
    queryFn: async () =>
      fetchInvoiceSummary(getRustApiUrl(), await getAccessToken(), params),
  });
}

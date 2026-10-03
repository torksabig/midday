"use client";

import {
  infiniteQueryOptions,
  type QueryKey,
  queryOptions,
} from "@tanstack/react-query";
import { getAccessToken } from "@/utils/session";
import {
  type AverageInvoiceSize,
  type DraftInvoiceInput,
  type DuplicateInvoiceInput,
  type Invoice,
  type InvoicePaymentStatus,
  type InvoiceSummary,
  type InvoiceSummaryParams,
  type InvoicesList,
  type InvoicesListParams,
  type MostActiveClient,
  type SearchInvoiceNumberHit,
  type TopRevenueClient,
  type UpdateInvoiceInput,
  deleteInvoice,
  draftInvoice,
  duplicateInvoice,
  fetchInvoiceAverageDaysToPayment,
  fetchInvoiceAverageInvoiceSize,
  fetchInvoiceById,
  fetchInvoiceInactiveClientsCount,
  fetchInvoiceMostActiveClient,
  fetchInvoiceNewCustomersCount,
  fetchInvoicePaymentStatus,
  fetchInvoiceSummary,
  fetchInvoiceTopRevenueClient,
  fetchInvoicesList,
  fetchSearchInvoiceNumber,
  updateInvoice,
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

export function invoiceMostActiveClientQueryOptions(queryKey: QueryKey) {
  return queryOptions<MostActiveClient>({
    queryKey,
    queryFn: async () =>
      fetchInvoiceMostActiveClient(getRustApiUrl(), await getAccessToken()),
  });
}

export function invoiceInactiveClientsCountQueryOptions(queryKey: QueryKey) {
  return queryOptions<number>({
    queryKey,
    queryFn: async () =>
      fetchInvoiceInactiveClientsCount(getRustApiUrl(), await getAccessToken()),
  });
}

export function invoiceTopRevenueClientQueryOptions(queryKey: QueryKey) {
  return queryOptions<TopRevenueClient>({
    queryKey,
    queryFn: async () =>
      fetchInvoiceTopRevenueClient(getRustApiUrl(), await getAccessToken()),
  });
}

export function invoiceNewCustomersCountQueryOptions(queryKey: QueryKey) {
  return queryOptions<number>({
    queryKey,
    queryFn: async () =>
      fetchInvoiceNewCustomersCount(getRustApiUrl(), await getAccessToken()),
  });
}

export function searchInvoiceNumberQueryOptions(
  queryKey: QueryKey,
  query: string,
  options: { enabled?: boolean; gcTime?: number } = {},
) {
  return queryOptions<SearchInvoiceNumberHit>({
    queryKey,
    queryFn: async () =>
      fetchSearchInvoiceNumber(getRustApiUrl(), await getAccessToken(), query),
    enabled: options.enabled,
    gcTime: options.gcTime,
  });
}

export function invoiceAverageDaysToPaymentQueryOptions(queryKey: QueryKey) {
  return queryOptions<number>({
    queryKey,
    queryFn: async () =>
      fetchInvoiceAverageDaysToPayment(getRustApiUrl(), await getAccessToken()),
  });
}

export function invoiceAverageInvoiceSizeQueryOptions(queryKey: QueryKey) {
  return queryOptions<AverageInvoiceSize>({
    queryKey,
    queryFn: async () =>
      fetchInvoiceAverageInvoiceSize(getRustApiUrl(), await getAccessToken()),
  });
}

export async function draftInvoiceFromRust(input: DraftInvoiceInput) {
  return draftInvoice(getRustApiUrl(), await getAccessToken(), input);
}

export async function updateInvoiceFromRust(input: UpdateInvoiceInput) {
  return updateInvoice(getRustApiUrl(), await getAccessToken(), input);
}

export async function deleteInvoiceFromRust(input: { id: string } | string) {
  const id = typeof input === "string" ? input : input.id;
  return deleteInvoice(getRustApiUrl(), await getAccessToken(), id);
}

export async function duplicateInvoiceFromRust(input: DuplicateInvoiceInput) {
  return duplicateInvoice(getRustApiUrl(), await getAccessToken(), input);
}

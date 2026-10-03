import "server-only";

import {
  infiniteQueryOptions,
  type QueryKey,
  queryOptions,
} from "@tanstack/react-query";
import { getServerRequestContext } from "@/trpc/request-context";
import {
  type AverageInvoiceSize,
  type Invoice,
  type InvoicePaymentStatus,
  type InvoiceSummary,
  type InvoiceSummaryParams,
  type InvoicesList,
  type InvoicesListParams,
  type MostActiveClient,
  type TopRevenueClient,
  fetchInvoiceAverageDaysToPayment,
  fetchInvoiceAverageInvoiceSize,
  fetchInvoiceByToken,
  fetchInvoiceInactiveClientsCount,
  fetchInvoiceMostActiveClient,
  fetchInvoiceNewCustomersCount,
  fetchInvoicePaymentStatus,
  fetchInvoiceSummary,
  fetchInvoiceTopRevenueClient,
  fetchInvoicesList,
} from "./invoices";

function getRustApiUrl() {
  const url =
    process.env.RUST_API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_RUST_API_URL;

  if (url) return url.replace(/\/$/, "");
  if (process.env.NODE_ENV !== "production") return "http://127.0.0.1:8787";

  throw new Error("RUST_API_INTERNAL_URL must be configured");
}

export function invoicesServerInfiniteQueryOptions(
  queryKey: QueryKey,
  params: InvoicesListParams,
) {
  return infiniteQueryOptions({
    queryKey,
    queryFn: async ({ pageParam }): Promise<InvoicesList> => {
      const { session } = await getServerRequestContext();
      return fetchInvoicesList(
        getRustApiUrl(),
        session?.access_token ?? null,
        {
          ...params,
          cursor: pageParam ?? undefined,
        },
      );
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.meta.cursor ?? undefined,
  });
}

export function invoicePaymentStatusServerQueryOptions(queryKey: QueryKey) {
  return queryOptions({
    queryKey,
    queryFn: async (): Promise<InvoicePaymentStatus> => {
      const { session } = await getServerRequestContext();
      return fetchInvoicePaymentStatus(
        getRustApiUrl(),
        session?.access_token ?? null,
      );
    },
  });
}

export function invoiceSummaryServerQueryOptions(
  queryKey: QueryKey,
  params: InvoiceSummaryParams = {},
) {
  return queryOptions({
    queryKey,
    queryFn: async (): Promise<InvoiceSummary> => {
      const { session } = await getServerRequestContext();
      return fetchInvoiceSummary(
        getRustApiUrl(),
        session?.access_token ?? null,
        params,
      );
    },
  });
}

export function invoiceMostActiveClientServerQueryOptions(queryKey: QueryKey) {
  return queryOptions({
    queryKey,
    queryFn: async (): Promise<MostActiveClient> => {
      const { session } = await getServerRequestContext();
      return fetchInvoiceMostActiveClient(
        getRustApiUrl(),
        session?.access_token ?? null,
      );
    },
  });
}

export function invoiceInactiveClientsCountServerQueryOptions(
  queryKey: QueryKey,
) {
  return queryOptions({
    queryKey,
    queryFn: async (): Promise<number> => {
      const { session } = await getServerRequestContext();
      return fetchInvoiceInactiveClientsCount(
        getRustApiUrl(),
        session?.access_token ?? null,
      );
    },
  });
}

export function invoiceTopRevenueClientServerQueryOptions(queryKey: QueryKey) {
  return queryOptions({
    queryKey,
    queryFn: async (): Promise<TopRevenueClient> => {
      const { session } = await getServerRequestContext();
      return fetchInvoiceTopRevenueClient(
        getRustApiUrl(),
        session?.access_token ?? null,
      );
    },
  });
}

export function invoiceNewCustomersCountServerQueryOptions(queryKey: QueryKey) {
  return queryOptions({
    queryKey,
    queryFn: async (): Promise<number> => {
      const { session } = await getServerRequestContext();
      return fetchInvoiceNewCustomersCount(
        getRustApiUrl(),
        session?.access_token ?? null,
      );
    },
  });
}

export function invoiceAverageDaysToPaymentServerQueryOptions(
  queryKey: QueryKey,
) {
  return queryOptions({
    queryKey,
    queryFn: async (): Promise<number> => {
      const { session } = await getServerRequestContext();
      return fetchInvoiceAverageDaysToPayment(
        getRustApiUrl(),
        session?.access_token ?? null,
      );
    },
  });
}

export function invoiceAverageInvoiceSizeServerQueryOptions(
  queryKey: QueryKey,
) {
  return queryOptions({
    queryKey,
    queryFn: async (): Promise<AverageInvoiceSize> => {
      const { session } = await getServerRequestContext();
      return fetchInvoiceAverageInvoiceSize(
        getRustApiUrl(),
        session?.access_token ?? null,
      );
    },
  });
}

/** Public — no auth. Midday `invoice.getInvoiceByToken`. */
export function invoiceByTokenServerQueryOptions(
  queryKey: QueryKey,
  token: string,
) {
  return queryOptions({
    queryKey,
    queryFn: async (): Promise<Invoice | null> =>
      fetchInvoiceByToken(getRustApiUrl(), token),
  });
}

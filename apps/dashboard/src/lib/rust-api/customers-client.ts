"use client";

import {
  infiniteQueryOptions,
  type QueryKey,
  queryOptions,
} from "@tanstack/react-query";
import { getAccessToken } from "@/utils/session";
import {
  type Customer,
  type CustomersList,
  type CustomersListParams,
  fetchCustomerById,
  fetchCustomerInvoiceSummary,
  fetchCustomersList,
} from "./customers";

function getRustApiUrl() {
  const url = process.env.NEXT_PUBLIC_RUST_API_URL;

  if (url) return url.replace(/\/$/, "");
  if (process.env.NODE_ENV !== "production") return "http://127.0.0.1:8787";

  throw new Error("NEXT_PUBLIC_RUST_API_URL must be configured");
}

export function customersInfiniteQueryOptions(
  queryKey: QueryKey,
  params: CustomersListParams,
) {
  return infiniteQueryOptions({
    queryKey,
    queryFn: async ({ pageParam }): Promise<CustomersList> =>
      fetchCustomersList(getRustApiUrl(), await getAccessToken(), {
        ...params,
        cursor: pageParam ?? undefined,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.meta.cursor ?? undefined,
  });
}

export function customersQueryOptions(
  queryKey: QueryKey,
  params: CustomersListParams = {},
) {
  return queryOptions<CustomersList>({
    queryKey,
    queryFn: async () =>
      fetchCustomersList(getRustApiUrl(), await getAccessToken(), params),
  });
}

export function customerByIdQueryOptions(
  queryKey: QueryKey,
  id: string,
  options: { enabled?: boolean; staleTime?: number } = {},
) {
  return queryOptions<Customer | null>({
    queryKey,
    queryFn: async () =>
      fetchCustomerById(getRustApiUrl(), await getAccessToken(), id),
    enabled: options.enabled,
    staleTime: options.staleTime,
  });
}

export function customerInvoiceSummaryQueryOptions(
  queryKey: QueryKey,
  id: string,
  options: { enabled?: boolean } = {},
) {
  return queryOptions<Record<string, unknown>>({
    queryKey,
    queryFn: async () =>
      fetchCustomerInvoiceSummary(getRustApiUrl(), await getAccessToken(), id),
    enabled: options.enabled,
  });
}

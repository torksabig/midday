"use client";

import {
  infiniteQueryOptions,
  type QueryKey,
  queryOptions,
} from "@tanstack/react-query";
import { getAccessToken } from "@/utils/session";
import {
  type Customer,
  type CustomerInvoiceSummary,
  type CustomersList,
  type CustomersListParams,
  type PortalCustomerById,
  type PortalInvoicesPage,
  type PortalInvoicesParams,
  cancelCustomerEnrichment,
  clearCustomerEnrichment,
  startCustomerEnrichment,
  deleteCustomer,
  fetchCustomerById,
  fetchCustomerByPortalId,
  fetchCustomerInvoiceSummary,
  fetchCustomersList,
  fetchPortalInvoices,
  toggleCustomerPortal,
  type ToggleCustomerPortalInput,
  upsertCustomer,
  type UpsertCustomerInput,
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
  return queryOptions<CustomerInvoiceSummary>({
    queryKey,
    queryFn: async () =>
      fetchCustomerInvoiceSummary(getRustApiUrl(), await getAccessToken(), id),
    enabled: options.enabled,
  });
}

export async function fetchCustomerByIdFromRust(id: string) {
  return fetchCustomerById(getRustApiUrl(), await getAccessToken(), id);
}

export async function upsertCustomerFromRust(input: UpsertCustomerInput) {
  return upsertCustomer(getRustApiUrl(), await getAccessToken(), input);
}

export async function deleteCustomerFromRust(input: { id: string } | string) {
  const id = typeof input === "string" ? input : input.id;
  return deleteCustomer(getRustApiUrl(), await getAccessToken(), id);
}

export async function toggleCustomerPortalFromRust(
  input: ToggleCustomerPortalInput,
) {
  return toggleCustomerPortal(getRustApiUrl(), await getAccessToken(), input);
}

export async function startCustomerEnrichmentFromRust(
  input: { id: string } | string,
) {
  const id = typeof input === "string" ? input : input.id;
  return startCustomerEnrichment(getRustApiUrl(), await getAccessToken(), id);
}

export async function cancelCustomerEnrichmentFromRust(
  input: { id: string } | string,
) {
  const id = typeof input === "string" ? input : input.id;
  return cancelCustomerEnrichment(getRustApiUrl(), await getAccessToken(), id);
}

export async function clearCustomerEnrichmentFromRust(
  input: { id: string } | string,
) {
  const id = typeof input === "string" ? input : input.id;
  return clearCustomerEnrichment(getRustApiUrl(), await getAccessToken(), id);
}

export function customerByPortalIdQueryOptions(
  queryKey: QueryKey,
  portalId: string,
) {
  return queryOptions<PortalCustomerById>({
    queryKey,
    queryFn: async () => fetchCustomerByPortalId(getRustApiUrl(), portalId),
  });
}

export function portalInvoicesInfiniteQueryOptions(
  queryKey: QueryKey,
  params: { portalId: string } & PortalInvoicesParams,
) {
  return infiniteQueryOptions({
    queryKey,
    queryFn: async ({ pageParam }): Promise<PortalInvoicesPage> =>
      fetchPortalInvoices(getRustApiUrl(), params.portalId, {
        pageSize: params.pageSize,
        cursor: pageParam ?? undefined,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.meta.cursor ?? undefined,
  });
}

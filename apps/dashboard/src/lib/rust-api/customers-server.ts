import "server-only";

import {
  infiniteQueryOptions,
  type QueryKey,
  queryOptions,
} from "@tanstack/react-query";
import { getServerRequestContext } from "@/trpc/request-context";
import {
  type Customer,
  type CustomersList,
  type CustomersListParams,
  type PortalCustomerById,
  type PortalInvoicesPage,
  type PortalInvoicesParams,
  fetchCustomerById,
  fetchCustomerByPortalId,
  fetchCustomersList,
  fetchPortalInvoices,
} from "./customers";

function getRustApiUrl() {
  const url =
    process.env.RUST_API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_RUST_API_URL;

  if (url) return url.replace(/\/$/, "");
  if (process.env.NODE_ENV !== "production") return "http://127.0.0.1:8787";

  throw new Error("RUST_API_INTERNAL_URL must be configured");
}

export function customersServerInfiniteQueryOptions(
  queryKey: QueryKey,
  params: CustomersListParams,
) {
  return infiniteQueryOptions({
    queryKey,
    queryFn: async ({ pageParam }): Promise<CustomersList> => {
      const { session } = await getServerRequestContext();
      return fetchCustomersList(
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

export function customerByIdServerQueryOptions(queryKey: QueryKey, id: string) {
  return queryOptions({
    queryKey,
    queryFn: async (): Promise<Customer | null> => {
      const { session } = await getServerRequestContext();
      return fetchCustomerById(
        getRustApiUrl(),
        session?.access_token ?? null,
        id,
      );
    },
  });
}

export function customerByPortalIdServerQueryOptions(
  queryKey: QueryKey,
  portalId: string,
) {
  return queryOptions({
    queryKey,
    queryFn: async (): Promise<PortalCustomerById> =>
      fetchCustomerByPortalId(getRustApiUrl(), portalId),
  });
}

export function portalInvoicesServerInfiniteQueryOptions(
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

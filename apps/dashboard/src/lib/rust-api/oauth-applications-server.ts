import "server-only";

import { type QueryKey, queryOptions } from "@tanstack/react-query";
import { getServerRequestContext } from "@/trpc/request-context";
import {
  type GetOAuthApplicationInfoInput,
  type OAuthApplicationInfo,
  type OAuthApplicationsAuthorized,
  type OAuthApplicationsList,
  fetchAuthorizedOAuthApplications,
  fetchOAuthApplicationInfo,
  fetchOAuthApplications,
} from "./oauth-applications";

function getRustApiUrl() {
  const url =
    process.env.RUST_API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_RUST_API_URL;

  if (url) return url.replace(/\/$/, "");
  if (process.env.NODE_ENV !== "production") return "http://127.0.0.1:8787";

  throw new Error("RUST_API_INTERNAL_URL must be configured");
}

export function oauthApplicationsServerQueryOptions(queryKey: QueryKey) {
  return queryOptions({
    queryKey,
    queryFn: async (): Promise<OAuthApplicationsList> => {
      const { session } = await getServerRequestContext();
      return fetchOAuthApplications(
        getRustApiUrl(),
        session?.access_token ?? null,
      );
    },
  });
}

export function authorizedOAuthApplicationsServerQueryOptions(
  queryKey: QueryKey,
) {
  return queryOptions({
    queryKey,
    queryFn: async (): Promise<OAuthApplicationsAuthorized> => {
      const { session } = await getServerRequestContext();
      return fetchAuthorizedOAuthApplications(
        getRustApiUrl(),
        session?.access_token ?? null,
      );
    },
  });
}

export function oauthApplicationInfoServerQueryOptions(
  queryKey: QueryKey,
  input: GetOAuthApplicationInfoInput,
) {
  return queryOptions({
    queryKey,
    queryFn: async (): Promise<OAuthApplicationInfo> => {
      const { session } = await getServerRequestContext();
      return fetchOAuthApplicationInfo(
        getRustApiUrl(),
        session?.access_token ?? null,
        input,
      );
    },
  });
}

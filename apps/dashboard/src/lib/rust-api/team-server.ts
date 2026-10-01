import "server-only";

import { queryOptions } from "@tanstack/react-query";
import { getServerRequestContext } from "@/trpc/request-context";
import { fetchCurrentTeam, teamCurrentQueryKey } from "./team";

function getRustApiUrl() {
  const url =
    process.env.RUST_API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_RUST_API_URL;

  if (url) return url.replace(/\/$/, "");
  if (process.env.NODE_ENV !== "production") return "http://127.0.0.1:8787";

  throw new Error("RUST_API_INTERNAL_URL must be configured");
}

export function teamCurrentServerQueryOptions() {
  return queryOptions({
    queryKey: teamCurrentQueryKey,
    queryFn: async () => {
      const { session } = await getServerRequestContext();
      return fetchCurrentTeam(getRustApiUrl(), session?.access_token ?? null);
    },
    staleTime: 6 * 60 * 60 * 1000,
  });
}

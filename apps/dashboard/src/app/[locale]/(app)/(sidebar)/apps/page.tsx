import type { Metadata } from "next";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import { Suspense } from "react";
import { Apps } from "@/components/apps";
import { AppsSkeleton } from "@/components/apps.skeleton";
import { AppsHeader } from "@/components/apps-header";
import { ErrorFallback } from "@/components/error-fallback";
import { appsServerQueryOptions } from "@/lib/rust-api/apps-server";
import { inboxAccountsServerQueryOptions } from "@/lib/rust-api/inbox-accounts-server";
import {
  authorizedOAuthApplicationsServerQueryOptions,
  oauthApplicationsServerQueryOptions,
} from "@/lib/rust-api/oauth-applications-server";
import {
  batchPrefetch,
  getQueryClient,
  HydrateClient,
  trpc,
} from "@/trpc/server";

export const metadata: Metadata = {
  title: "Apps | Midday",
};

export default async function Page() {
  const _queryClient = getQueryClient();

  batchPrefetch([
    appsServerQueryOptions(trpc.apps.get.queryKey()),
    oauthApplicationsServerQueryOptions(trpc.oauthApplications.list.queryKey()),
    authorizedOAuthApplicationsServerQueryOptions(
      trpc.oauthApplications.authorized.queryKey(),
    ),
    inboxAccountsServerQueryOptions(trpc.inboxAccounts.get.queryKey()),
    trpc.invoicePayments.stripeStatus.queryOptions(),
    trpc.connectors.list.queryOptions(),
  ] as Parameters<typeof batchPrefetch>[0]);

  return (
    <HydrateClient>
      <div className="mt-4">
        <AppsHeader />

        <ErrorBoundary errorComponent={ErrorFallback}>
          <Suspense fallback={<AppsSkeleton />}>
            <Apps />
          </Suspense>
        </ErrorBoundary>
      </div>
    </HydrateClient>
  );
}

import type { Metadata } from "next";
import { ConnectedAccounts } from "@/components/connected-accounts";
import { bankAccountsServerQueryOptions } from "@/lib/rust-api/bank-accounts-server";
import { getQueryClient, prefetch, trpc } from "@/trpc/server";

export const metadata: Metadata = {
  title: "Bank Connections | Midday",
};

export default async function Page() {
  prefetch(trpc.bankConnections.get.queryOptions());
  void getQueryClient().prefetchQuery(
    bankAccountsServerQueryOptions(
      trpc.bankAccounts.get.queryKey({ manual: true }),
      { manual: true },
    ),
  );

  return (
    <div className="space-y-12">
      <ConnectedAccounts />
    </div>
  );
}

import type { Metadata } from "next";
import { ConnectedAccounts } from "@/components/connected-accounts";
import { bankAccountsServerQueryOptions } from "@/lib/rust-api/bank-accounts-server";
import { bankConnectionsServerQueryOptions } from "@/lib/rust-api/bank-connections-server";
import { getQueryClient, trpc } from "@/trpc/server";

export const metadata: Metadata = {
  title: "Bank Connections | Midday",
};

export default async function Page() {
  void getQueryClient().prefetchQuery(
    bankConnectionsServerQueryOptions(trpc.bankConnections.get.queryKey()),
  );
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

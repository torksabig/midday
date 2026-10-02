import type { Metadata } from "next";
import { InboxBlocklistSettings } from "@/components/inbox/inbox-blocklist-settings";
import { InboxConnectedAccounts } from "@/components/inbox/inbox-connected-accounts";
import { InboxEmailSettings } from "@/components/inbox/inbox-email-settings";
import { inboxBlocklistServerQueryOptions } from "@/lib/rust-api/inbox-server";
import { prefetch, trpc } from "@/trpc/server";

export const metadata: Metadata = {
  title: "Inbox Settings | Midday",
};

export default async function Page() {
  prefetch(trpc.inboxAccounts.get.queryOptions());
  prefetch(
    inboxBlocklistServerQueryOptions(trpc.inbox.blocklist.get.queryKey()),
  );

  return (
    <div className="max-w-[800px]">
      <main className="mt-8">
        <div className="space-y-12">
          <InboxEmailSettings />
          <InboxBlocklistSettings />
          <InboxConnectedAccounts />
        </div>
      </main>
    </div>
  );
}

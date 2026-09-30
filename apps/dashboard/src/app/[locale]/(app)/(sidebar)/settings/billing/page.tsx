import type { Metadata } from "next";
import { ManageSubscription } from "@/components/manage-subscription";
import { Orders } from "@/components/orders";
import { getQueryClient, prefetch, trpc } from "@/trpc/server";

export const metadata: Metadata = {
  title: "Billing | Midday",
};

export default async function Billing() {
  const queryClient = getQueryClient();
  const user = await queryClient.fetchQuery(trpc.user.me.queryOptions());

  const team = user?.team;

  prefetch(
    trpc.billing.orders.infiniteQueryOptions(
      {
        pageSize: 15,
      },
      {
        getNextPageParam: ({ meta }) => meta?.cursor,
      },
    ),
  );

  return (
    <div className="space-y-12">
      {team?.plan !== "trial" && <ManageSubscription />}

      {(team?.plan !== "trial" || team?.canceledAt !== null) && <Orders />}
    </div>
  );
}

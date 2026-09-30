import type { Metadata } from "next";
import { OverviewView } from "@/components/widgets";
import { overviewSummaryServerQueryOptions } from "@/lib/rust-api/overview-server";
import { getQueryClient, HydrateClient } from "@/trpc/server";

export const metadata: Metadata = {
  title: "Overview | Midday",
};

export default function Overview() {
  void getQueryClient()
    .prefetchQuery(overviewSummaryServerQueryOptions())
    .catch(() => {
      // The client query renders the existing overview skeleton on failure.
    });

  return (
    <HydrateClient>
      <OverviewView />
    </HydrateClient>
  );
}

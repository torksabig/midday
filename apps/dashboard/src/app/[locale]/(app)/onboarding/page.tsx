import { getCountryCode, getCurrency } from "@midday/location";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OnboardingPage } from "@/components/onboarding/onboarding-page";
import { teamListServerQueryOptions } from "@/lib/rust-api/team-server";
import { viewerServerQueryOptions } from "@/lib/rust-api/viewer-server";
import { getQueryClient, HydrateClient, trpc } from "@/trpc/server";

export const metadata: Metadata = {
  title: "Onboarding | Midday",
};

export default async function Page() {
  const queryClient = getQueryClient();

  const user = await queryClient
    .fetchQuery(viewerServerQueryOptions())
    .catch(() => redirect("/login"));

  if (!user) {
    redirect("/login");
  }

  const teams = await queryClient.fetchQuery(
    teamListServerQueryOptions(trpc.team.list.queryKey()),
  );
  const hasOtherTeams = (teams?.length ?? 0) > 1;

  const currency = getCurrency();
  const countryCode = getCountryCode();

  return (
    <HydrateClient>
      <OnboardingPage
        defaultCurrencyPromise={currency}
        defaultCountryCodePromise={countryCode}
        hasOtherTeams={hasOtherTeams}
        user={{
          id: user.id,
          fullName: user.fullName,
          avatarUrl: user.avatarUrl ?? null,
          teamId: user.teamId,
        }}
      />
    </HydrateClient>
  );
}

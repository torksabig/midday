import type { Metadata } from "next";
import { BaseCurrency } from "@/components/base-currency/base-currency";
import { CompanyCountry } from "@/components/company-country";
import { CompanyEmail } from "@/components/company-email";
import { CompanyFiscalYear } from "@/components/company-fiscal-year";
import { CompanyLogo } from "@/components/company-logo";
import { CompanyName } from "@/components/company-name";
import { DeleteTeam } from "@/components/delete-team";
import { ExportAllData } from "@/components/export-all-data";
import { TeamIdSection } from "@/components/team-id-section";
import { teamCurrentServerQueryOptions } from "@/lib/rust-api/team-server";
import { getQueryClient, HydrateClient } from "@/trpc/server";

export const metadata: Metadata = {
  title: "Team Settings | Midday",
};

export default async function Account() {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(teamCurrentServerQueryOptions()).catch(() => {
    // Avoid unhandled promise rejections from fire-and-forget prefetches.
  });

  return (
    <HydrateClient>
      <div className="space-y-12">
        <CompanyLogo />
        <CompanyName />
        <CompanyEmail />
        <CompanyCountry />
        <BaseCurrency />
        <CompanyFiscalYear />
        <TeamIdSection />
        <ExportAllData />
        <DeleteTeam />
      </div>
    </HydrateClient>
  );
}

import type { Metadata } from "next";
import { CreateApiKeyModal } from "@/components/modals/create-api-key-modal";
import { DeleteApiKeyModal } from "@/components/modals/delete-api-key-modal";
import { EditApiKeyModal } from "@/components/modals/edit-api-key-modal";
import { OAuthSecretModal } from "@/components/modals/oauth-secret-modal";
import { OAuthApplicationCreateSheet } from "@/components/sheets/oauth-application-create-sheet";
import { OAuthApplicationEditSheet } from "@/components/sheets/oauth-application-edit-sheet";
import { DataTable } from "@/components/tables/api-keys";
import { OAuthDataTable } from "@/components/tables/oauth-applications";
import { apiKeysServerQueryOptions } from "@/lib/rust-api/api-keys-server";
import { oauthApplicationsServerQueryOptions } from "@/lib/rust-api/oauth-applications-server";
import { batchPrefetch, trpc } from "@/trpc/server";

export const metadata: Metadata = {
  title: "Developer | Midday",
};

export default async function Page() {
  batchPrefetch([
    apiKeysServerQueryOptions(trpc.apiKeys.get.queryKey()),
    oauthApplicationsServerQueryOptions(trpc.oauthApplications.list.queryKey()),
  ] as Parameters<typeof batchPrefetch>[0]);

  return (
    <>
      <div className="space-y-12">
        <DataTable />
        <OAuthDataTable />
      </div>

      <EditApiKeyModal />
      <DeleteApiKeyModal />
      <CreateApiKeyModal />
      <OAuthSecretModal />
      <OAuthApplicationCreateSheet />
      <OAuthApplicationEditSheet />
    </>
  );
}

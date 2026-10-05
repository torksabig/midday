"use client";

import { type QueryKey, queryOptions } from "@tanstack/react-query";
import { getAccessToken } from "@/utils/session";
import {
  type AuthorizeOAuthApplicationInput,
  type AuthorizeOAuthApplicationResult,
  type CreateOAuthApplicationInput,
  type DeleteOAuthApplicationInput,
  type GetOAuthApplicationInfoInput,
  type OAuthApplicationCreate,
  type OAuthApplicationDelete,
  type OAuthApplicationDetail,
  type OAuthApplicationInfo,
  type OAuthApplicationRegenerateSecret,
  type OAuthApplicationRevokeAccess,
  type OAuthApplicationUpdate,
  type OAuthApplicationsAuthorized,
  type OAuthApplicationsList,
  type RegenerateOAuthSecretInput,
  type RevokeOAuthAccessInput,
  type UpdateOAuthApprovalStatusInput,
  type UpdateOAuthApprovalStatusResult,
  type UpdateOAuthApplicationInput,
  authorizeOAuthApplication,
  buildOAuthAuthorizeRedirectUrl,
  createOAuthApplication,
  deleteOAuthApplication,
  fetchAuthorizedOAuthApplications,
  fetchOAuthApplicationById,
  fetchOAuthApplicationInfo,
  fetchOAuthApplications,
  regenerateOAuthApplicationSecret,
  revokeOAuthApplicationAccess,
  updateOAuthApplication,
  updateOAuthApplicationApprovalStatus,
} from "./oauth-applications";

function getRustApiUrl() {
  const url = process.env.NEXT_PUBLIC_RUST_API_URL;

  if (url) return url.replace(/\/$/, "");
  if (process.env.NODE_ENV !== "production") return "http://127.0.0.1:8787";

  throw new Error("NEXT_PUBLIC_RUST_API_URL must be configured");
}

export function oauthApplicationsQueryOptions(queryKey: QueryKey) {
  return queryOptions<OAuthApplicationsList>({
    queryKey,
    queryFn: async () =>
      fetchOAuthApplications(getRustApiUrl(), await getAccessToken()),
  });
}

export function oauthApplicationByIdQueryOptions(
  queryKey: QueryKey,
  id: string,
  options: { enabled?: boolean } = {},
) {
  return queryOptions<OAuthApplicationDetail>({
    queryKey,
    queryFn: async () =>
      fetchOAuthApplicationById(getRustApiUrl(), await getAccessToken(), id),
    enabled: options.enabled,
  });
}

export function authorizedOAuthApplicationsQueryOptions(queryKey: QueryKey) {
  return queryOptions<OAuthApplicationsAuthorized>({
    queryKey,
    queryFn: async () =>
      fetchAuthorizedOAuthApplications(
        getRustApiUrl(),
        await getAccessToken(),
      ),
  });
}

export function oauthApplicationInfoQueryOptions(
  queryKey: QueryKey,
  input: GetOAuthApplicationInfoInput,
) {
  return queryOptions<OAuthApplicationInfo>({
    queryKey,
    queryFn: async () =>
      fetchOAuthApplicationInfo(
        getRustApiUrl(),
        await getAccessToken(),
        input,
      ),
  });
}

export async function createOAuthApplicationFromRust(
  input: CreateOAuthApplicationInput,
): Promise<OAuthApplicationCreate> {
  return createOAuthApplication(
    getRustApiUrl(),
    await getAccessToken(),
    input,
  );
}

export async function updateOAuthApplicationFromRust(
  input: UpdateOAuthApplicationInput,
): Promise<OAuthApplicationUpdate> {
  return updateOAuthApplication(
    getRustApiUrl(),
    await getAccessToken(),
    input,
  );
}

export async function deleteOAuthApplicationFromRust(
  input: DeleteOAuthApplicationInput,
): Promise<OAuthApplicationDelete> {
  return deleteOAuthApplication(
    getRustApiUrl(),
    await getAccessToken(),
    input,
  );
}

export async function regenerateOAuthApplicationSecretFromRust(
  input: RegenerateOAuthSecretInput,
): Promise<OAuthApplicationRegenerateSecret> {
  return regenerateOAuthApplicationSecret(
    getRustApiUrl(),
    await getAccessToken(),
    input,
  );
}

export async function revokeOAuthApplicationAccessFromRust(
  input: RevokeOAuthAccessInput,
): Promise<OAuthApplicationRevokeAccess> {
  return revokeOAuthApplicationAccess(
    getRustApiUrl(),
    await getAccessToken(),
    input,
  );
}

export async function authorizeOAuthApplicationFromRust(
  input: AuthorizeOAuthApplicationInput,
): Promise<AuthorizeOAuthApplicationResult> {
  const rust = await authorizeOAuthApplication(
    getRustApiUrl(),
    await getAccessToken(),
    input,
  );
  return { redirect_url: buildOAuthAuthorizeRedirectUrl(input, rust) };
}

export type OAuthAuthorizeWithInstallEmailOptions = {
  input: AuthorizeOAuthApplicationInput;
  enqueueInstallEmail: (payload: {
    email: string;
    teamName: string;
    appName: string;
  }) => Promise<unknown>;
  fallbackUserEmail?: string | null;
};

export async function authorizeOAuthApplicationWithInstallEmail({
  input,
  enqueueInstallEmail,
  fallbackUserEmail,
}: OAuthAuthorizeWithInstallEmailOptions): Promise<AuthorizeOAuthApplicationResult> {
  const rust = await authorizeOAuthApplication(
    getRustApiUrl(),
    await getAccessToken(),
    input,
  );

  if (
    input.decision === "allow" &&
    !rust.hasAuthorizedBefore &&
    rust.teamName &&
    (rust.userEmail || fallbackUserEmail)
  ) {
    await enqueueInstallEmail({
      email: rust.userEmail ?? fallbackUserEmail!,
      teamName: rust.teamName,
      appName: rust.application.name,
    });
  }

  return { redirect_url: buildOAuthAuthorizeRedirectUrl(input, rust) };
}

export async function updateOAuthApprovalStatusFromRust(
  input: UpdateOAuthApprovalStatusInput,
): Promise<UpdateOAuthApprovalStatusResult> {
  return updateOAuthApplicationApprovalStatus(
    getRustApiUrl(),
    await getAccessToken(),
    input,
  );
}

export type OAuthApprovalStatusWithReviewEmailOptions = {
  input: UpdateOAuthApprovalStatusInput;
  enqueueReviewEmail: (payload: {
    applicationName: string;
    developerName?: string;
    teamName: string;
    userEmail: string;
  }) => Promise<unknown>;
  teamName: string;
  userEmail: string;
  developerName?: string | null;
};

export async function updateOAuthApprovalStatusWithReviewEmail({
  input,
  enqueueReviewEmail,
  teamName,
  userEmail,
  developerName,
}: OAuthApprovalStatusWithReviewEmailOptions): Promise<UpdateOAuthApprovalStatusResult> {
  const result = await updateOAuthApplicationApprovalStatus(
    getRustApiUrl(),
    await getAccessToken(),
    input,
  );

  if (input.status === "pending") {
    await enqueueReviewEmail({
      applicationName: result.name,
      developerName: developerName ?? undefined,
      teamName,
      userEmail,
    });
  }

  return result;
}

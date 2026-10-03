"use client";

import { type QueryKey, queryOptions } from "@tanstack/react-query";
import { getAccessToken } from "@/utils/session";
import {
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
  type UpdateOAuthApplicationInput,
  createOAuthApplication,
  deleteOAuthApplication,
  fetchAuthorizedOAuthApplications,
  fetchOAuthApplicationById,
  fetchOAuthApplicationInfo,
  fetchOAuthApplications,
  regenerateOAuthApplicationSecret,
  revokeOAuthApplicationAccess,
  updateOAuthApplication,
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

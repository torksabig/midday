import type { RouterInputs } from "@api/trpc/routers/_app";
import type {
  OAuthApplicationCreate,
  OAuthApplicationDelete,
  OAuthApplicationDetail,
  OAuthApplicationInfo,
  OAuthApplicationItem,
  OAuthApplicationRegenerateSecret,
  OAuthApplicationRevokeAccess,
  OAuthApplicationsAuthorized,
  OAuthApplicationsList,
  OAuthApplicationUpdate,
} from "./delegated-trpc-shapes";
import { RustApiError } from "./overview";

export type {
  OAuthApplicationCreate,
  OAuthApplicationDelete,
  OAuthApplicationDetail,
  OAuthApplicationInfo,
  OAuthApplicationItem,
  OAuthApplicationRegenerateSecret,
  OAuthApplicationRevokeAccess,
  OAuthApplicationsAuthorized,
  OAuthApplicationsList,
  OAuthApplicationUpdate,
} from "./delegated-trpc-shapes";

export type AuthorizeOAuthApplicationInput =
  RouterInputs["oauthApplications"]["authorize"];
export type AuthorizeOAuthApplicationResult = Record<string, unknown>;
export type UpdateOAuthApprovalStatusInput =
  RouterInputs["oauthApplications"]["updateApprovalStatus"];
export type UpdateOAuthApprovalStatusResult = OAuthApplicationItem;

export type CreateOAuthApplicationInput =
  RouterInputs["oauthApplications"]["create"];
export type UpdateOAuthApplicationInput =
  RouterInputs["oauthApplications"]["update"];
export type DeleteOAuthApplicationInput =
  RouterInputs["oauthApplications"]["delete"];
export type RegenerateOAuthSecretInput =
  RouterInputs["oauthApplications"]["regenerateSecret"];
export type RevokeOAuthAccessInput =
  RouterInputs["oauthApplications"]["revokeAccess"];
export type GetOAuthApplicationInfoInput =
  RouterInputs["oauthApplications"]["getApplicationInfo"];

function snakeToCamelKey(key: string): string {
  return key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
}

export function deepCamelCaseKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(deepCamelCaseKeys);
  }
  if (value && typeof value === "object" && !(value instanceof Date)) {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nested]) => [
        snakeToCamelKey(key),
        deepCamelCaseKeys(nested),
      ]),
    );
  }
  return value;
}

async function throwRustApiError(response: Response): Promise<never> {
  let message = `Rust API request failed with HTTP ${response.status}`;
  try {
    const body = (await response.json()) as {
      error?: { message?: string };
      message?: string;
    };
    const apiMessage = body.error?.message ?? body.message;
    if (typeof apiMessage === "string" && apiMessage.trim()) {
      message = apiMessage;
    }
  } catch {
    // keep status fallback
  }
  throw new RustApiError(response.status, message);
}

export function normalizeOAuthApplication(
  payload: Record<string, unknown>,
): OAuthApplicationItem {
  return deepCamelCaseKeys(payload) as OAuthApplicationItem;
}

export function normalizeOAuthApplicationsList(
  payload: unknown,
): OAuthApplicationsList {
  const row = deepCamelCaseKeys(payload) as {
    data?: OAuthApplicationItem[];
  };
  return { data: row.data ?? [] };
}

export function normalizeOAuthApplicationDetail(
  payload: Record<string, unknown>,
): OAuthApplicationDetail {
  return deepCamelCaseKeys(payload) as OAuthApplicationDetail;
}

export function normalizeOAuthApplicationCreate(
  payload: Record<string, unknown>,
): OAuthApplicationCreate {
  return deepCamelCaseKeys(payload) as OAuthApplicationCreate;
}

export function normalizeOAuthApplicationDelete(
  _payload: unknown,
): OAuthApplicationDelete {
  return { success: true };
}

export function normalizeOAuthApplicationRegenerateSecret(
  payload: Record<string, unknown>,
): OAuthApplicationRegenerateSecret {
  return deepCamelCaseKeys(payload) as OAuthApplicationRegenerateSecret;
}

export function normalizeOAuthApplicationsAuthorized(
  payload: unknown,
): OAuthApplicationsAuthorized {
  const row = deepCamelCaseKeys(payload) as {
    data?: OAuthApplicationsAuthorized["data"];
  };
  return { data: row.data ?? [] };
}

export function normalizeOAuthApplicationRevokeAccess(
  payload: unknown,
): OAuthApplicationRevokeAccess {
  const row = deepCamelCaseKeys(payload) as { success?: boolean };
  return { success: row.success ?? true };
}

export function normalizeOAuthApplicationInfo(
  payload: Record<string, unknown>,
): OAuthApplicationInfo {
  return deepCamelCaseKeys(payload) as OAuthApplicationInfo;
}

export async function fetchOAuthApplications(
  baseUrl: string,
  accessToken: string | null,
): Promise<OAuthApplicationsList> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(`${baseUrl}/api/v1/oauth-applications`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) await throwRustApiError(response);

  return normalizeOAuthApplicationsList(await response.json());
}

export async function fetchOAuthApplicationById(
  baseUrl: string,
  accessToken: string | null,
  id: string,
): Promise<OAuthApplicationDetail> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(
    `${baseUrl}/api/v1/oauth-applications/${encodeURIComponent(id)}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(8_000),
    },
  );

  if (!response.ok) await throwRustApiError(response);

  return normalizeOAuthApplicationDetail(
    (await response.json()) as Record<string, unknown>,
  );
}

export async function createOAuthApplication(
  baseUrl: string,
  accessToken: string | null,
  input: CreateOAuthApplicationInput,
): Promise<OAuthApplicationCreate> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(`${baseUrl}/api/v1/oauth-applications`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) await throwRustApiError(response);

  return normalizeOAuthApplicationCreate(
    (await response.json()) as Record<string, unknown>,
  );
}

export async function updateOAuthApplication(
  baseUrl: string,
  accessToken: string | null,
  input: UpdateOAuthApplicationInput,
): Promise<OAuthApplicationUpdate> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const { id, ...body } = input;
  const response = await fetch(
    `${baseUrl}/api/v1/oauth-applications/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8_000),
    },
  );

  if (!response.ok) await throwRustApiError(response);

  return normalizeOAuthApplicationDetail(
    (await response.json()) as Record<string, unknown>,
  ) as OAuthApplicationUpdate;
}

export async function deleteOAuthApplication(
  baseUrl: string,
  accessToken: string | null,
  input: DeleteOAuthApplicationInput,
): Promise<OAuthApplicationDelete> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const id = typeof input === "string" ? input : input.id;
  const response = await fetch(
    `${baseUrl}/api/v1/oauth-applications/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(8_000),
    },
  );

  if (!response.ok) await throwRustApiError(response);

  return normalizeOAuthApplicationDelete(await response.json());
}

export async function regenerateOAuthApplicationSecret(
  baseUrl: string,
  accessToken: string | null,
  input: RegenerateOAuthSecretInput,
): Promise<OAuthApplicationRegenerateSecret> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const id = typeof input === "string" ? input : input.id;
  const response = await fetch(
    `${baseUrl}/api/v1/oauth-applications/${encodeURIComponent(id)}/regenerate-secret`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(8_000),
    },
  );

  if (!response.ok) await throwRustApiError(response);

  return normalizeOAuthApplicationRegenerateSecret(
    (await response.json()) as Record<string, unknown>,
  );
}

export async function fetchAuthorizedOAuthApplications(
  baseUrl: string,
  accessToken: string | null,
): Promise<OAuthApplicationsAuthorized> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(
    `${baseUrl}/api/v1/oauth-applications/authorized`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(8_000),
    },
  );

  if (!response.ok) await throwRustApiError(response);

  return normalizeOAuthApplicationsAuthorized(await response.json());
}

export async function revokeOAuthApplicationAccess(
  baseUrl: string,
  accessToken: string | null,
  input: RevokeOAuthAccessInput,
): Promise<OAuthApplicationRevokeAccess> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const applicationId =
    typeof input === "string" ? input : input.applicationId;
  const response = await fetch(
    `${baseUrl}/api/v1/oauth-applications/authorized/${encodeURIComponent(applicationId)}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(8_000),
    },
  );

  if (!response.ok) await throwRustApiError(response);

  return normalizeOAuthApplicationRevokeAccess(await response.json());
}

export type OAuthAuthorizeRustResult = {
  decision: "allow" | "deny";
  code?: string;
  application: { id: string; name: string };
  teamName?: string | null;
  userEmail?: string | null;
  hasAuthorizedBefore?: boolean;
};

export function normalizeOAuthAuthorizeRustResult(
  payload: unknown,
): OAuthAuthorizeRustResult {
  const row = deepCamelCaseKeys(payload) as OAuthAuthorizeRustResult;
  if (row.decision !== "allow" && row.decision !== "deny") {
    throw new RustApiError(500, "OAuth authorize payload missing decision");
  }
  if (!row.application?.id || !row.application?.name) {
    throw new RustApiError(500, "OAuth authorize payload missing application");
  }
  return row;
}

export function buildOAuthAuthorizeRedirectUrl(
  input: Pick<
    AuthorizeOAuthApplicationInput,
    "redirectUri" | "state" | "decision"
  >,
  rust: OAuthAuthorizeRustResult,
): string {
  const redirectUrl = new URL(input.redirectUri);

  if (rust.decision === "deny" || input.decision === "deny") {
    redirectUrl.searchParams.set("error", "access_denied");
    redirectUrl.searchParams.set("error_description", "User denied access");
    if (input.state) {
      redirectUrl.searchParams.set("state", input.state);
    }
    return redirectUrl.toString();
  }

  if (!rust.code) {
    throw new RustApiError(500, "Failed to create authorization code");
  }

  redirectUrl.searchParams.set("code", rust.code);
  if (input.state) {
    redirectUrl.searchParams.set("state", input.state);
  }
  return redirectUrl.toString();
}

export async function authorizeOAuthApplication(
  baseUrl: string,
  accessToken: string | null,
  input: AuthorizeOAuthApplicationInput,
): Promise<OAuthAuthorizeRustResult> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(`${baseUrl}/api/v1/oauth-applications/authorize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) await throwRustApiError(response);

  return normalizeOAuthAuthorizeRustResult(await response.json());
}

export function normalizeOAuthApprovalStatusResult(
  payload: unknown,
): UpdateOAuthApprovalStatusResult {
  const row = deepCamelCaseKeys(payload) as {
    result?: UpdateOAuthApprovalStatusResult;
  };
  if (row.result && typeof row.result === "object") {
    return row.result;
  }
  return deepCamelCaseKeys(payload) as UpdateOAuthApprovalStatusResult;
}

export async function updateOAuthApplicationApprovalStatus(
  baseUrl: string,
  accessToken: string | null,
  input: UpdateOAuthApprovalStatusInput,
): Promise<UpdateOAuthApprovalStatusResult> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const { id, status } = input;
  const response = await fetch(
    `${baseUrl}/api/v1/oauth-applications/${encodeURIComponent(id)}/approval-status`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
      signal: AbortSignal.timeout(8_000),
    },
  );

  if (!response.ok) await throwRustApiError(response);

  return normalizeOAuthApprovalStatusResult(await response.json());
}

export async function fetchOAuthApplicationInfo(
  baseUrl: string,
  accessToken: string | null,
  input: GetOAuthApplicationInfoInput,
): Promise<OAuthApplicationInfo> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const params = new URLSearchParams({
    clientId: input.clientId,
    redirectUri: input.redirectUri,
    scope: input.scope,
  });
  if (input.state) params.set("state", input.state);

  const response = await fetch(
    `${baseUrl}/api/v1/oauth-applications/application-info?${params}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(8_000),
    },
  );

  if (!response.ok) await throwRustApiError(response);

  return normalizeOAuthApplicationInfo(
    (await response.json()) as Record<string, unknown>,
  );
}

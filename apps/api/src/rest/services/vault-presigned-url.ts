import {
  assertLegacyIdentityFallbackAllowed,
  tryDelegateDocumentSignedUrl,
} from "@api/services/replacement-delegation";
import { shouldDelegateToReplacementBackend } from "@midday/replacement-backend";

export type VaultPresignedUrlResult = {
  url: string;
  expiresAt: string;
  fileName: string | null;
};

export function formatVaultPresignedUrlResult(
  signedUrl: string,
  expireIn: number,
  fileName: string | null,
): VaultPresignedUrlResult {
  return {
    url: signedUrl,
    expiresAt: new Date(Date.now() + expireIn * 1000).toISOString(),
    fileName,
  };
}

/** Normalize vault object path from Drizzle arrays or Rust string paths. */
export function normalizeVaultObjectPath(
  path: string | string[] | null | undefined,
): string | null {
  if (path == null) return null;
  if (Array.isArray(path)) {
    return path.length > 0 ? path.join("/") : null;
  }
  const trimmed = path.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Replacement-mode vault presigned URL via Rust `POST /api/v1/documents/signed-url`.
 * Returns `"legacy"` when dual/legacy mode should use Supabase on Node.
 */
export async function fetchReplacementVaultPresignedUrl(
  filePath: string,
  expireIn: number,
  fileName: string | null,
  sessionAccessToken?: string | null,
): Promise<VaultPresignedUrlResult | "legacy"> {
  if (!shouldDelegateToReplacementBackend()) {
    return "legacy";
  }

  const delegated = await tryDelegateDocumentSignedUrl(
    filePath,
    expireIn,
    sessionAccessToken,
  );

  if (delegated.delegated) {
    return formatVaultPresignedUrlResult(
      delegated.data.signedUrl,
      expireIn,
      fileName,
    );
  }

  assertLegacyIdentityFallbackAllowed();
  return "legacy";
}

export function extractBearerToken(
  authorizationHeader: string | undefined,
): string | null {
  if (!authorizationHeader) return null;
  const match = authorizationHeader.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() ?? null;
}

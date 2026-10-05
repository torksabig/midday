import {
  assertLegacyIdentityFallbackAllowed,
  tryDelegateDocumentsDelete,
  tryDelegateDocumentsGet,
  tryDelegateDocumentsGetById,
} from "@api/services/replacement-delegation";
import type { ReplacementDocumentsListQuery } from "@midday/replacement-backend";
import { shouldDelegateToReplacementBackend } from "@midday/replacement-backend";
import { TRPCError } from "@trpc/server";
import { HTTPException } from "hono/http-exception";
import { extractBearerToken } from "./vault-presigned-url";

export function mapDelegationErrorToHttp(error: unknown): never {
  if (error instanceof TRPCError) {
    const status =
      error.code === "NOT_FOUND"
        ? 404
        : error.code === "UNAUTHORIZED"
          ? 401
          : error.code === "FORBIDDEN"
            ? 403
            : 500;
    throw new HTTPException(status, { message: error.message });
  }
  throw error;
}

export async function fetchDocumentsListForRest(
  params: ReplacementDocumentsListQuery,
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<unknown>,
): Promise<unknown> {
  if (!shouldDelegateToReplacementBackend()) {
    return fetchLegacy();
  }

  const sessionAccessToken = extractBearerToken(authorizationHeader);
  try {
    const delegated = await tryDelegateDocumentsGet(params, sessionAccessToken);
    if (delegated) {
      return delegated;
    }
    assertLegacyIdentityFallbackAllowed();
  } catch (error) {
    mapDelegationErrorToHttp(error);
  }

  return fetchLegacy();
}

export async function fetchDocumentByIdForRest(
  id: string,
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<unknown>,
): Promise<unknown> {
  if (!shouldDelegateToReplacementBackend()) {
    return fetchLegacy();
  }

  const sessionAccessToken = extractBearerToken(authorizationHeader);
  try {
    const delegated = await tryDelegateDocumentsGetById(
      id,
      null,
      sessionAccessToken,
    );
    if (delegated.delegated) {
      return delegated.document;
    }
    assertLegacyIdentityFallbackAllowed();
  } catch (error) {
    mapDelegationErrorToHttp(error);
  }

  return fetchLegacy();
}

export async function deleteDocumentForRest(
  id: string,
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<{ id: string } | null | undefined>,
): Promise<{ id: string } | null | undefined> {
  if (!shouldDelegateToReplacementBackend()) {
    return fetchLegacy();
  }

  const sessionAccessToken = extractBearerToken(authorizationHeader);
  try {
    const delegated = await tryDelegateDocumentsDelete(id, sessionAccessToken);
    if (delegated.delegated) {
      return delegated.document ? { id: delegated.document.id } : null;
    }
    assertLegacyIdentityFallbackAllowed();
  } catch (error) {
    mapDelegationErrorToHttp(error);
  }

  return fetchLegacy();
}

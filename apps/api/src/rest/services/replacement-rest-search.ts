import {
  assertLegacyIdentityFallbackAllowed,
  tryDelegateSearchGlobal,
} from "@api/services/replacement-delegation";
import type { ReplacementGlobalSearchQuery } from "@midday/replacement-backend";
import { shouldDelegateToReplacementBackend } from "@midday/replacement-backend";
import { mapDelegationErrorToHttp } from "./replacement-rest-documents";
import { extractBearerToken } from "./vault-presigned-url";

export type GlobalSearchRestInput = {
  searchTerm?: string;
  language?: string;
  limit: number;
  itemsPerTableLimit: number;
  relevanceThreshold: number;
};

function buildDelegatedGlobalSearchQuery(
  input: GlobalSearchRestInput,
): ReplacementGlobalSearchQuery {
  const { searchTerm } = input;
  const shouldUseLLMFilters =
    !!searchTerm && searchTerm.trim().split(/\s+/).length > 1;

  const relevanceThreshold = shouldUseLLMFilters
    ? 0.01
    : input.relevanceThreshold;

  return {
    searchTerm: searchTerm ?? null,
    language: input.language ?? null,
    limit: input.limit,
    itemsPerTableLimit: input.itemsPerTableLimit,
    relevanceThreshold,
  };
}

export async function globalSearchForRest(
  input: GlobalSearchRestInput,
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<unknown>,
): Promise<unknown> {
  if (!shouldDelegateToReplacementBackend()) {
    return fetchLegacy();
  }

  const sessionAccessToken = extractBearerToken(authorizationHeader);
  try {
    const delegated = await tryDelegateSearchGlobal(
      buildDelegatedGlobalSearchQuery(input),
      sessionAccessToken,
    );
    if (delegated) {
      return delegated;
    }
    assertLegacyIdentityFallbackAllowed();
  } catch (error) {
    mapDelegationErrorToHttp(error);
  }

  return fetchLegacy();
}

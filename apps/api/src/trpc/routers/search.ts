import {
  globalSearchSchema,
  searchAttachmentsSchema,
} from "@api/schemas/search";
import {
  assertNoLegacyFallback,
  tryDelegateSearchAttachments,
  tryDelegateSearchGlobal,
} from "@api/services/replacement-delegation";
import { createTRPCRouter, protectedProcedure } from "@api/trpc/init";

/** Stage 4: dashboard uses Rust directly; keep AppRouter for queryKey/RouterOutputs only. */
export const searchRouter = createTRPCRouter({
  global: protectedProcedure
    .input(globalSearchSchema)
    .query(async ({ input, ctx: { accessToken } }) => {
      const { searchTerm } = input;

      const shouldUseLLMFilters =
        !!searchTerm && searchTerm.trim().split(/\s+/).length > 1;

      const relevanceThreshold = shouldUseLLMFilters
        ? 0.01
        : input.relevanceThreshold;

      const delegated = await tryDelegateSearchGlobal(
        {
          searchTerm: searchTerm ?? null,
          language: input.language ?? null,
          limit: input.limit,
          itemsPerTableLimit: input.itemsPerTableLimit,
          relevanceThreshold,
        },
        accessToken,
      );
      if (delegated) {
        return delegated;
      }
      return assertNoLegacyFallback("search.global");
    }),

  attachments: protectedProcedure
    .input(searchAttachmentsSchema)
    .query(async ({ input, ctx: { accessToken } }) => {
      const { q, transactionId, limit = 30 } = input;

      const delegated = await tryDelegateSearchAttachments(
        {
          q: q ?? null,
          transactionId: transactionId ?? null,
          limit,
        },
        accessToken,
      );
      if (delegated) {
        return delegated;
      }
      return assertNoLegacyFallback("search.attachments");
    }),
});

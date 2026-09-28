import {
  globalSearchSchema,
  searchAttachmentsSchema,
} from "@api/schemas/search";
import {
  assertNoLegacyFallback,
  tryDelegateSearchGlobal,
  tryDelegateSearchAttachments,
} from "@api/services/replacement-delegation";
import { createTRPCRouter, protectedProcedure } from "@api/trpc/init";
import { generateLLMFilters } from "@api/utils/search-filters";
import { shouldDelegateToReplacementBackend } from "@midday/replacement-backend";
import {
  getInboxSearch,
  getInvoices,
  globalSearchQuery,
  globalSemanticSearchQuery,
} from "@midday/db/queries";

export const searchRouter = createTRPCRouter({
  global: protectedProcedure
    .input(globalSearchSchema)
    .query(async ({ input, ctx: { db, teamId, accessToken } }) => {
      const { searchTerm } = input;

      // Determine if we should fall back to LLM-generated filters:
      // we only do this when the user provides a multi-word query.
      const shouldUseLLMFilters =
        !!searchTerm && searchTerm.trim().split(/\s+/).length > 1;

      const relevanceThreshold = shouldUseLLMFilters
        ? 0.01
        : input.relevanceThreshold;

      let results: Awaited<ReturnType<typeof globalSearchQuery>>;

      if (shouldDelegateToReplacementBackend()) {
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
        if (delegated === null) {
          // AP-20: search is 100% delegated — no dual FTS Drizzle fallback
          assertNoLegacyFallback("search.global");
        }
        results = delegated;
      } else {
        results = await globalSearchQuery(db, {
          teamId: teamId!,
          ...input,
          searchTerm: searchTerm,
          relevanceThreshold,
        });
      }

      // LLM semantic enhancement stays in apps/api (not a Rust FTS substitute)
      if (shouldUseLLMFilters && !results.length) {
        const filters = await generateLLMFilters(searchTerm);

        const semanticResults = await globalSemanticSearchQuery(db, {
          teamId: teamId!,
          itemsPerTableLimit: input.itemsPerTableLimit,
          ...filters,
        });

        return semanticResults;
      }

      return results;
    }),

  attachments: protectedProcedure
    .input(searchAttachmentsSchema)
    .query(async ({ input, ctx: { db, teamId, accessToken } }) => {
      const { q, transactionId, limit = 30 } = input;

      if (shouldDelegateToReplacementBackend()) {
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
        // AP-20: search is 100% delegated — no dual Drizzle fallback
        assertNoLegacyFallback("search.attachments");
      }

      const [inboxResults, invoiceResults] = await Promise.all([
        getInboxSearch(db, {
          teamId: teamId!,
          q: q ?? undefined,
          transactionId: transactionId ?? undefined,
          limit: limit,
        }),
        getInvoices(db, {
          teamId: teamId!,
          q: q ?? undefined,
          statuses: ["unpaid", "overdue", "paid"],
          pageSize: limit,
          sort: null,
        }),
      ]);

      // Transform inbox results
      const inboxItems =
        inboxResults.map((item) => ({
          type: "inbox" as const,
          id: item.id,
          fileName: item.fileName ?? null,
          filePath: item.filePath ?? [],
          displayName: item.displayName ?? null,
          amount: item.amount ?? null,
          currency: item.currency ?? null,
          contentType: item.contentType ?? null,
          date: item.date ?? null,
          size: item.size ?? null,
          description: item.description ?? null,
          status: item.status ?? null,
          website: item.website ?? null,
          baseAmount: item.baseAmount ?? null,
          baseCurrency: item.baseCurrency ?? null,
          taxAmount: item.taxAmount ?? null,
          taxRate: item.taxRate ?? null,
          taxType: item.taxType ?? null,
          createdAt: item.createdAt,
        })) ?? [];

      // Transform invoice results
      const invoices =
        invoiceResults.data.map((invoice) => ({
          type: "invoice" as const,
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber ?? null,
          customerName: invoice.customerName ?? null,
          amount: invoice.amount ?? null,
          currency: invoice.currency ?? null,
          filePath: invoice.filePath ?? [],
          dueDate: invoice.dueDate ?? null,
          status: invoice.status,
          size: invoice.fileSize ?? null,
          createdAt: invoice.createdAt,
        })) ?? [];

      // Combine and return results
      return [...inboxItems, ...invoices];
    }),
});

import { anthropic } from "@ai-sdk/anthropic";
import {
  createTransactionSchema,
  deleteTransactionsSchema,
  exportTransactionsSchema,
  generateCsvMappingResponseSchema,
  generateCsvMappingSchema,
  getSimilarTransactionsSchema,
  getTransactionByIdSchema,
  getTransactionsSchema,
  importTransactionsSchema,
  moveToReviewSchema,
  searchTransactionMatchSchema,
  updateTransactionSchema,
  updateTransactionsSchema,
} from "@api/schemas/transactions";
import {
  assertLegacyIdentityFallbackAllowed,
  tryDelegateTransactionsGet,
  tryDelegateTransactionsGetById,
  tryDelegateTransactionsGetReviewCount,
  tryDelegateTransactionUpdate,
  tryDelegateTransactionsUpdateMany,
} from "@api/services/replacement-delegation";
import { createTRPCRouter, protectedProcedure } from "@api/trpc/init";
import { shouldDelegateToReplacementBackend } from "@midday/replacement-backend";
import {
  createTransaction,
  deleteTransactions,
  getBankAccountById,
  getSimilarTransactions,
  getTransactionById,
  getTransactions,
  getTransactionsReadyForExportCount,
  moveTransactionToReview,
  searchTransactionMatch,
  updateBankAccount,
  updateTransaction,
  updateTransactions,
} from "@midday/db/queries";
import {
  buildCsvMappingPrompt,
  compactSampleRows,
  formatAmountValue,
  selectPromptColumns,
} from "@midday/import";
import { triggerJob } from "@midday/job-client";
import { TRPCError } from "@trpc/server";
import { generateObject } from "ai";

const csvMappingInFlight = new Map<
  string,
  Promise<{
    date?: string;
    description?: string;
    counterparty?: string;
    amount?: string;
    balance?: string;
    currency?: string;
  }>
>();

export const transactionsRouter = createTRPCRouter({
  get: protectedProcedure
    .input(getTransactionsSchema)
    .query(async ({ input, ctx: { db, teamId, accessToken } }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateTransactionsGet(
          {
            cursor: input.cursor,
            pageSize: input.pageSize,
            q: input.q,
            sort: input.sort,
            statuses: input.statuses,
            start: input.start,
            end: input.end,
            categories: input.categories,
            accounts: input.accounts,
            tags: input.tags,
            exported: input.exported,
            fulfilled: input.fulfilled,
            assignees: input.assignees,
            attachments: input.attachments,
            recurring: input.recurring,
            amountRange: input.amountRange,
            amount: input.amount,
            type: input.type,
            manual: input.manual,
          },
          accessToken,
        );
        if (delegated) {
          return delegated;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return getTransactions(db, {
        ...input,
        exported: input.exported ?? undefined,
        fulfilled: input.fulfilled ?? undefined,
        teamId: teamId!,
      });
    }),

  getById: protectedProcedure
    .input(getTransactionByIdSchema)
    .query(async ({ input, ctx: { db, teamId, accessToken } }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateTransactionsGetById(
          input.id,
          accessToken,
        );
        if (delegated.delegated) {
          return delegated.transaction;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return getTransactionById(db, {
        id: input.id,
        teamId: teamId!,
      });
    }),

  deleteMany: protectedProcedure
    .input(deleteTransactionsSchema)
    .mutation(async ({ input, ctx: { db, teamId } }) => {
      return deleteTransactions(db, { ids: input, teamId: teamId! });
    }),

  getReviewCount: protectedProcedure.query(
    async ({ ctx: { db, teamId, accessToken } }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateTransactionsGetReviewCount(
          accessToken,
        );
        if (delegated != null) {
          return delegated;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return getTransactionsReadyForExportCount(db, teamId!);
    },
  ),

  update: protectedProcedure
    .input(updateTransactionSchema)
    .mutation(async ({ input, ctx: { db, teamId, session, accessToken } }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateTransactionUpdate(
          input,
          accessToken,
        );
        if (delegated.delegated) {
          return delegated.transaction;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return updateTransaction(db, {
        ...input,
        userId: session.user.id,
        teamId: teamId!,
      });
    }),

  updateMany: protectedProcedure
    .input(updateTransactionsSchema)
    .mutation(async ({ input, ctx: { db, teamId, session, accessToken } }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateTransactionsUpdateMany(
          { ...input },
          accessToken,
        );
        if (delegated) {
          return delegated;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return updateTransactions(db, {
        ...input,
        userId: session.user.id,
        teamId: teamId!,
      });
    }),

  getSimilarTransactions: protectedProcedure
    .input(getSimilarTransactionsSchema)
    .query(async ({ input, ctx: { db, teamId } }) => {
      return getSimilarTransactions(db, {
        name: input.name,
        categorySlug: input.categorySlug,
        frequency: input.frequency,
        teamId: teamId!,
        transactionId: input.transactionId,
      });
    }),

  searchTransactionMatch: protectedProcedure
    .input(searchTransactionMatchSchema)
    .query(async ({ input, ctx: { db, teamId } }) => {
      return searchTransactionMatch(db, {
        query: input.query,
        teamId: teamId!,
        inboxId: input.inboxId,
        maxResults: input.maxResults,
        minConfidenceScore: input.minConfidenceScore,
        includeAlreadyMatched: input.includeAlreadyMatched,
      });
    }),

  create: protectedProcedure
    .input(createTransactionSchema)
    .mutation(async ({ input, ctx: { db, teamId } }) => {
      const transaction = await createTransaction(db, {
        ...input,
        teamId: teamId!,
      });

      if (transaction?.id) {
        await triggerJob(
          "enrich-transactions",
          {
            transactionIds: [transaction.id],
            teamId: teamId!,
          },
          "transactions",
        );

        await triggerJob(
          "match-transactions-bidirectional",
          {
            teamId: teamId!,
            newTransactionIds: [transaction.id],
          },
          "inbox",
        );
      }

      return transaction;
    }),

  export: protectedProcedure
    .input(exportTransactionsSchema)
    .mutation(async ({ input, ctx: { teamId, session } }) => {
      if (!teamId) {
        throw new Error("Team not found");
      }

      return triggerJob(
        "export-transactions",
        {
          teamId,
          userId: session.user.id,
          userEmail: session.user.email ?? undefined,
          locale: input.locale,
          transactionIds: input.transactionIds,
          dateFormat: input.dateFormat,
          exportSettings: input.exportSettings,
        },
        "transactions",
      );
    }),

  import: protectedProcedure
    .input(importTransactionsSchema)
    .mutation(async ({ input, ctx: { db, teamId } }) => {
      if (!teamId) {
        throw new Error("Team not found");
      }

      // Only update balance/currency for manual accounts (backfill into connected accounts keeps bank-synced balance)
      const account = await getBankAccountById(db, {
        id: input.bankAccountId,
        teamId,
      });

      if (!account) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Bank account not found",
        });
      }

      if (account.manual) {
        const parsedBalance = input.currentBalance
          ? formatAmountValue({ amount: input.currentBalance })
          : null;

        const balance =
          parsedBalance !== null && Number.isFinite(parsedBalance)
            ? parsedBalance
            : null;

        await updateBankAccount(db, {
          id: input.bankAccountId,
          teamId,
          currency: input.currency,
          balance: balance ?? undefined,
        });
      }

      return triggerJob(
        "import-transactions",
        {
          filePath: input.filePath,
          bankAccountId: input.bankAccountId,
          currency: input.currency,
          mappings: input.mappings,
          teamId,
          inverted: input.inverted,
        },
        "transactions",
      );
    }),

  moveToReview: protectedProcedure
    .input(moveToReviewSchema)
    .mutation(async ({ input, ctx: { db, teamId } }) => {
      if (!teamId) {
        throw new Error("Team not found");
      }

      await moveTransactionToReview(db, {
        transactionId: input.transactionId,
        teamId,
      });

      return { success: true };
    }),

  generateCsvMapping: protectedProcedure
    .input(generateCsvMappingSchema)
    .mutation(async ({ input, ctx: { teamId } }) => {
      const requestStartedAt = Date.now();
      const promptColumns = selectPromptColumns(input.fieldColumns);
      const sampleRows = compactSampleRows(input.firstRows, promptColumns);
      const prompt = buildCsvMappingPrompt(promptColumns, sampleRows);
      const requestKey = JSON.stringify({
        teamId,
        columns: promptColumns,
        sampleRows,
      });

      const inFlight = csvMappingInFlight.get(requestKey);
      if (inFlight) {
        console.info("CSV mapping reusing in-flight request", {
          mode: "object",
          columnsCount: promptColumns.length,
          sampleRowsCount: sampleRows.length,
        });
        return inFlight;
      }

      const mappingPromise = (async () => {
        try {
          const { object } = await generateObject({
            model: anthropic("claude-3-haiku-20240307"),
            schema: generateCsvMappingResponseSchema,
            prompt,
          });

          return generateCsvMappingResponseSchema.parse(object);
        } catch (error) {
          console.error("Error generating CSV mapping:", {
            mode: "object",
            durationMs: Date.now() - requestStartedAt,
            error,
          });
          throw error;
        } finally {
          csvMappingInFlight.delete(requestKey);
        }
      })();

      csvMappingInFlight.set(requestKey, mappingPromise);

      return mappingPromise;
    }),
});

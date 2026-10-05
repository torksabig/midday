import {
  confirmMatchSchema,
  createInboxBlocklistSchema,
  createInboxItemSchema,
  declineMatchSchema,
  deleteInboxBlocklistSchema,
  deleteInboxManySchema,
  deleteInboxSchema,
  getInboxBlocklistSchema,
  getInboxByIdSchema,
  getInboxByStatusSchema,
  getInboxSchema,
  matchTransactionSchema,
  enqueueProcessAttachmentsSchema,
  enqueueRetryMatchingSchema,
  processAttachmentsSchema,
  retryMatchingSchema,
  searchInboxSchema,
  unmatchTransactionSchema,
  updateInboxSchema,
} from "@api/schemas/inbox";
import {
  assertLegacyIdentityFallbackAllowed,
  tryDelegateInboxCheckAttachments,
  tryDelegateInboxGet,
  tryDelegateInboxGetById,
  tryDelegateInboxGetByStatus,
  tryDelegateInboxSearch,
  tryDelegateInboxUpdate,
  tryDelegateInboxMatch,
  tryDelegateInboxConfirmMatch,
  tryDelegateInboxDeclineMatch,
  tryDelegateInboxUnmatch,
  tryDelegateInboxDelete,
  tryDelegateInboxDeleteMany,
  tryDelegateInboxBlocklistGet,
  tryDelegateInboxBlocklistCreate,
  tryDelegateInboxBlocklistDelete,
  tryDelegateInboxCreate,
} from "@api/services/replacement-delegation";
import { createTRPCRouter, protectedProcedure } from "@api/trpc/init";
import { shouldDelegateToReplacementBackend } from "@midday/replacement-backend";
import {
  checkInboxAttachments,
  confirmSuggestedMatch,
  createInbox,
  createInboxBlocklist,
  declineSuggestedMatch,
  deleteInbox,
  deleteInboxBlocklist,
  deleteInboxMany,
  getInbox,
  getInboxBlocklist,
  getInboxById,
  getInboxByStatus,
  getInboxSearch,
  matchTransaction,
  unmatchTransaction,
  updateInbox,
} from "@midday/db/queries";
import { triggerJob } from "@midday/job-client";
import { logger } from "@midday/logger";
import { remove } from "@midday/supabase/storage";
import type { z } from "zod";

type ProcessAttachmentsInput = z.infer<typeof processAttachmentsSchema>;

async function enqueueInboxProcessAttachmentJobs(
  teamId: string,
  input: ProcessAttachmentsInput,
) {
  const jobResults = await Promise.all(
    input.map((item) =>
      triggerJob(
        "process-attachment",
        {
          filePath: item.filePath,
          mimetype: item.mimetype,
          size: item.size,
          teamId,
          referenceId: item.referenceId,
          website: item.website,
          senderEmail: item.senderEmail,
          inboxAccountId: item.inboxAccountId,
        },
        "inbox",
      ),
    ),
  );

  if (input.length > 0) {
    try {
      await triggerJob(
        "notification",
        {
          type: "inbox_new",
          teamId,
          totalCount: input.length,
          inboxType: "upload",
        },
        "notifications",
      );
    } catch (error) {
      logger.warn("Failed to trigger inbox_new notification", {
        teamId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return {
    jobs: jobResults.map((result) => ({ id: result.id })),
  };
}

async function enqueueInboxRetryMatchingJob(teamId: string, inboxId: string) {
  const result = await triggerJob(
    "batch-process-matching",
    {
      teamId,
      inboxIds: [inboxId],
    },
    "inbox",
  );

  return { jobId: result.id };
}

export const inboxRouter = createTRPCRouter({
  get: protectedProcedure
    .input(getInboxSchema.optional())
    .query(async ({ ctx: { db, teamId, accessToken }, input }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateInboxGet(
          {
            cursor: input?.cursor,
            order: input?.order,
            sort: input?.sort,
            pageSize: input?.pageSize,
            q: input?.q,
            status: input?.status,
            tab: input?.tab,
          },
          accessToken,
        );
        if (delegated) {
          return delegated;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return getInbox(db, {
        teamId: teamId!,
        ...input,
      });
    }),

  getById: protectedProcedure
    .input(getInboxByIdSchema)
    .query(async ({ ctx: { db, teamId, accessToken }, input }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateInboxGetById(input.id, accessToken);
        if (delegated.delegated) {
          return delegated.item;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return getInboxById(db, {
        id: input.id,
        teamId: teamId!,
      });
    }),

  checkAttachments: protectedProcedure
    .input(deleteInboxSchema)
    .query(async ({ ctx: { db, teamId, accessToken }, input }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateInboxCheckAttachments(
          input.id,
          accessToken,
        );
        if (delegated) {
          return delegated;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return checkInboxAttachments(db, {
        id: input.id,
        teamId: teamId!,
      });
    }),

  delete: protectedProcedure
    .input(deleteInboxSchema)
    .mutation(async ({ ctx: { db, supabase, teamId, accessToken }, input }) => {
      let result: Awaited<ReturnType<typeof deleteInbox>> | {
        id: string;
        filePath: string[] | null;
      } | null = null;

      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateInboxDelete(input.id, accessToken);
        if (delegated) {
          result = delegated;
        } else {
          assertLegacyIdentityFallbackAllowed();
        }
      }

      if (!result) {
        result = await deleteInbox(db, {
          id: input.id,
          teamId: teamId!,
        });
      }

      if (result?.filePath && result.filePath.length > 0) {
        try {
          await remove(supabase, {
            bucket: "vault",
            path: result.filePath,
          });
        } catch (error) {
          logger.error("Failed to delete file from storage", {
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    }),

  deleteMany: protectedProcedure
    .input(deleteInboxManySchema)
    .mutation(async ({ ctx: { db, supabase, teamId, accessToken }, input }) => {
      let results: Array<{ id: string; filePath: string[] | null }> | null =
        null;

      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateInboxDeleteMany(input, accessToken);
        if (delegated) {
          results = delegated;
        } else {
          assertLegacyIdentityFallbackAllowed();
        }
      }

      if (!results) {
        results = await deleteInboxMany(db, {
          ids: input,
          teamId: teamId!,
        });
      }

      await Promise.all(
        results
          .filter((result) => result?.filePath && result.filePath.length > 0)
          .map(async (result) => {
            try {
              await remove(supabase, {
                bucket: "vault",
                path: result.filePath!,
              });
            } catch (error) {
              logger.error("Failed to delete file from storage", {
                inboxId: result.id,
                error: error instanceof Error ? error.message : String(error),
              });
            }
          }),
      );

      return results;
    }),

  create: protectedProcedure
    .input(createInboxItemSchema)
    .mutation(async ({ ctx: { db, teamId, accessToken }, input }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateInboxCreate(
          {
            displayName: input.filename,
            filePath: input.filePath,
            fileName: input.filename,
            contentType: input.mimetype,
            size: input.size,
            status: "processing",
          },
          accessToken,
        );
        if (delegated.delegated) {
          return delegated.inbox;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return createInbox(db, {
        displayName: input.filename,
        teamId: teamId!,
        filePath: input.filePath,
        fileName: input.filename,
        contentType: input.mimetype,
        size: input.size,
        status: "processing",
      });
    }),

  /** Job-only half after dashboard Rust `POST /api/v1/inbox` (create item). */
  enqueueProcessAttachments: protectedProcedure
    .input(enqueueProcessAttachmentsSchema)
    .mutation(async ({ ctx: { teamId }, input }) => {
      return enqueueInboxProcessAttachmentJobs(teamId!, input);
    }),

  /** Non-dashboard callers; dashboard uses Rust create + `enqueueProcessAttachments`. */
  processAttachments: protectedProcedure
    .input(processAttachmentsSchema)
    .mutation(async ({ ctx: { teamId }, input }) => {
      return enqueueInboxProcessAttachmentJobs(teamId!, input);
    }),

  search: protectedProcedure
    .input(searchInboxSchema)
    .query(async ({ ctx: { db, teamId, accessToken }, input }) => {
      const { q, transactionId, limit = 10 } = input;

      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateInboxSearch(
          { q, transactionId, limit },
          accessToken,
        );
        if (delegated) {
          return delegated;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return getInboxSearch(db, {
        teamId: teamId!,
        q,
        transactionId,
        limit,
      });
    }),

  update: protectedProcedure
    .input(updateInboxSchema)
    .mutation(async ({ ctx: { db, teamId, accessToken }, input }) => {
      const { id, ...fields } = input;
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateInboxUpdate(id, fields, accessToken);
        if (delegated.delegated) {
          return delegated.item;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return updateInbox(db, { ...input, teamId: teamId! });
    }),

  matchTransaction: protectedProcedure
    .input(matchTransactionSchema)
    .mutation(async ({ ctx: { db, teamId, accessToken }, input }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateInboxMatch(
          input.id,
          input.transactionId,
          accessToken,
        );
        if (delegated.delegated) {
          return delegated.item;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return matchTransaction(db, { ...input, teamId: teamId! });
    }),

  unmatchTransaction: protectedProcedure
    .input(unmatchTransactionSchema)
    .mutation(async ({ ctx: { db, teamId, session, accessToken }, input }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateInboxUnmatch(input.id, accessToken);
        if (delegated.delegated) {
          return delegated.result;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return unmatchTransaction(db, {
        id: input.id,
        teamId: teamId!,
        userId: session.user.id,
      });
    }),

  // Get inbox items by status
  getByStatus: protectedProcedure
    .input(getInboxByStatusSchema)
    .query(async ({ ctx: { db, teamId, accessToken }, input }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateInboxGetByStatus(
          { status: input.status },
          accessToken,
        );
        if (delegated) {
          return delegated;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return getInboxByStatus(db, {
        teamId: teamId!,
        status: input.status,
      });
    }),

  // Confirm a match suggestion
  confirmMatch: protectedProcedure
    .input(confirmMatchSchema)
    .mutation(async ({ ctx: { db, teamId, session, accessToken }, input }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateInboxConfirmMatch(
          {
            suggestionId: input.suggestionId,
            inboxId: input.inboxId,
            transactionId: input.transactionId,
          },
          accessToken,
        );
        if (delegated.delegated) {
          return delegated.item;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return confirmSuggestedMatch(db, {
        teamId: teamId!,
        suggestionId: input.suggestionId,
        inboxId: input.inboxId,
        transactionId: input.transactionId,
        userId: session.user.id,
      });
    }),

  // Decline a match suggestion
  declineMatch: protectedProcedure
    .input(declineMatchSchema)
    .mutation(async ({ ctx: { db, session, teamId, accessToken }, input }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateInboxDeclineMatch(
          {
            suggestionId: input.suggestionId,
            inboxId: input.inboxId,
          },
          accessToken,
        );
        if (delegated.delegated) {
          return;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return declineSuggestedMatch(db, {
        suggestionId: input.suggestionId,
        inboxId: input.inboxId,
        userId: session.user.id,
        teamId: teamId!,
      });
    }),

  /** Job-only half for dashboard retry-matching (no inbox SQL on Node). */
  enqueueRetryMatching: protectedProcedure
    .input(enqueueRetryMatchingSchema)
    .mutation(async ({ ctx: { teamId }, input }) => {
      return enqueueInboxRetryMatchingJob(teamId!, input.id);
    }),

  /** Non-dashboard callers; dashboard uses `enqueueRetryMatching`. */
  retryMatching: protectedProcedure
    .input(retryMatchingSchema)
    .mutation(async ({ ctx: { teamId }, input }) => {
      return enqueueInboxRetryMatchingJob(teamId!, input.id);
    }),

  // Blocklist management
  blocklist: createTRPCRouter({
    get: protectedProcedure
      .input(getInboxBlocklistSchema)
      .query(async ({ ctx: { db, teamId, accessToken } }) => {
        if (shouldDelegateToReplacementBackend()) {
          const delegated = await tryDelegateInboxBlocklistGet(accessToken);
          if (delegated) {
            return delegated;
          }
          assertLegacyIdentityFallbackAllowed();
        }

        return getInboxBlocklist(db, {
          teamId: teamId!,
        });
      }),

    create: protectedProcedure
      .input(createInboxBlocklistSchema)
      .mutation(async ({ ctx: { db, teamId, accessToken }, input }) => {
        if (shouldDelegateToReplacementBackend()) {
          const delegated = await tryDelegateInboxBlocklistCreate(
            { type: input.type, value: input.value },
            accessToken,
          );
          if (delegated.delegated) {
            return delegated.entry;
          }
          assertLegacyIdentityFallbackAllowed();
        }

        return createInboxBlocklist(db, {
          teamId: teamId!,
          type: input.type,
          value: input.value,
        });
      }),

    delete: protectedProcedure
      .input(deleteInboxBlocklistSchema)
      .mutation(async ({ ctx: { db, teamId, accessToken }, input }) => {
        if (shouldDelegateToReplacementBackend()) {
          const delegated = await tryDelegateInboxBlocklistDelete(
            input.id,
            accessToken,
          );
          if (delegated.delegated) {
            return delegated.entry;
          }
          assertLegacyIdentityFallbackAllowed();
        }

        return deleteInboxBlocklist(db, {
          id: input.id,
          teamId: teamId!,
        });
      }),
  }),
});

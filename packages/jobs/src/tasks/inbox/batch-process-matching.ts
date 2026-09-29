import { getDb } from "@jobs/init";
import { triggerMatchingNotification } from "@jobs/utils/inbox-matching-notifications";
import {
  inboxMatchingDelegationTarget,
  postBatchProcessMatching,
} from "@jobs/utils/inbox-matching-delegate";
import { calculateInboxSuggestions, hasSuggestion } from "@midday/db/queries";
import { logger, schemaTask } from "@trigger.dev/sdk";
import { z } from "zod";

export const batchProcessMatching = schemaTask({
  id: "batch-process-matching",
  schema: z.object({
    teamId: z.string().uuid(),
    inboxIds: z.array(z.string().uuid()),
  }),
  machine: "micro",
  maxDuration: 180,
  queue: { concurrencyLimit: 3 },
  run: async ({ teamId, inboxIds }) => {
    const db = getDb();

    logger.info("Starting batch inbox matching", {
      teamId,
      inboxCount: inboxIds.length,
    });

    const target = inboxMatchingDelegationTarget("batch-process-matching");
    if (target) {
      try {
        const body = await postBatchProcessMatching({ teamId, inboxIds }, target);
        for (const n of body.notifications) {
          if (n.action !== "auto_matched" && n.action !== "suggestion_created") {
            continue;
          }
          await triggerMatchingNotification({
            db,
            teamId,
            inboxId: n.inboxId,
            result: {
              action: n.action,
              suggestion: {
                transactionId: n.suggestion.transactionId,
                name: n.suggestion.name,
                amount: n.suggestion.amount,
                currency: n.suggestion.currency,
                date: n.suggestion.date,
                nameScore: n.suggestion.nameScore,
                amountScore: n.suggestion.amountScore,
                currencyScore: n.suggestion.currencyScore,
                dateScore: n.suggestion.dateScore,
                confidenceScore: n.suggestion.confidenceScore,
                matchType: n.suggestion.matchType as
                  | "auto_matched"
                  | "high_confidence"
                  | "suggested",
                isAlreadyMatched: n.suggestion.isAlreadyMatched,
              },
            },
          });
        }
        logger.info("Completed batch inbox matching via rust", {
          teamId,
          summary: {
            totalProcessed: body.processed,
            autoMatches: body.autoMatched,
            suggestions: body.suggestions,
            noMatches: body.noMatches,
            errors: body.errors,
          },
        });
        return {
          processed: body.processed,
          autoMatched: body.autoMatched,
          suggestions: body.suggestions,
          noMatches: body.noMatches,
          errors: body.errors,
        };
      } catch (error) {
        if (target.mode === "replacement") {
          throw error;
        }
        logger.warn("batch-process-matching rust failed; falling back to drizzle", {
          error: error instanceof Error ? error.message : "unknown",
        });
      }
    }

    let autoMatchCount = 0;
    let suggestionCount = 0;
    let noMatchCount = 0;
    let errorCount = 0;

    const BATCH_SIZE = 5;
    for (let i = 0; i < inboxIds.length; i += BATCH_SIZE) {
      const batch = inboxIds.slice(i, i + BATCH_SIZE);

      const results = await Promise.allSettled(
        batch.map(async (inboxId) => {
          try {
            const result = await calculateInboxSuggestions(db, {
              teamId,
              inboxId,
            });

            if (hasSuggestion(result)) {
              await triggerMatchingNotification({
                db,
                teamId,
                inboxId,
                result,
              });
            }

            switch (result.action) {
              case "auto_matched":
                autoMatchCount++;
                logger.info("Auto-matched inbox item", {
                  teamId,
                  inboxId,
                  transactionId: result.suggestion?.transactionId,
                  confidence: result.suggestion?.confidenceScore,
                });
                break;

              case "suggestion_created":
                suggestionCount++;
                logger.info("Created match suggestion", {
                  teamId,
                  inboxId,
                  transactionId: result.suggestion?.transactionId,
                  confidence: result.suggestion?.confidenceScore,
                });
                break;

              case "no_match_yet":
                noMatchCount++;
                break;
            }

            return result;
          } catch (error) {
            errorCount++;
            logger.error("Failed to process inbox matching", {
              teamId,
              inboxId,
              error: error instanceof Error ? error.message : "Unknown error",
            });
            throw error;
          }
        }),
      );

      const batchErrors = results.filter((r) => r.status === "rejected").length;
      logger.info("Completed batch processing", {
        teamId,
        batchIndex: Math.floor(i / BATCH_SIZE) + 1,
        batchSize: batch.length,
        errors: batchErrors,
      });
    }

    logger.info("Completed batch inbox matching", {
      teamId,
      summary: {
        totalProcessed: inboxIds.length,
        autoMatches: autoMatchCount,
        suggestions: suggestionCount,
        noMatches: noMatchCount,
        errors: errorCount,
      },
    });

    return {
      processed: inboxIds.length,
      autoMatched: autoMatchCount,
      suggestions: suggestionCount,
      noMatches: noMatchCount,
      errors: errorCount,
    };
  },
});

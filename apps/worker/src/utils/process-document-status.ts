import type { Database } from "@midday/db/client";
import {
  type UpdateDocumentByPathParams,
  updateDocumentByPath,
} from "@midday/db/queries";
import type { createLoggerWithContext } from "@midday/logger";
import {
  postProcessDocumentStatus,
  processDocumentDelegationTarget,
  type ProcessDocumentStatusPayload,
} from "@jobs/utils/process-document-delegate";

type Logger = ReturnType<typeof createLoggerWithContext>;

/**
 * process-document status writes — Rust when MIDDAY_BACKEND_MODE is dual/replacement.
 * Dual falls back to Drizzle on Rust failure; replacement is fail-closed.
 * Classify / embed / HEIC stay on Node and keep using updateDocumentWithRetry.
 */
export async function updateProcessDocumentStatus(
  db: Database,
  params: UpdateDocumentByPathParams,
  logger?: Logger,
  maxRetries = 2,
  delayMs = 1000,
): Promise<Awaited<ReturnType<typeof updateDocumentByPath>>> {
  const target = processDocumentDelegationTarget();
  if (target) {
    const payload: ProcessDocumentStatusPayload = {
      teamId: params.teamId,
      pathTokens: params.pathTokens,
      ...(params.processingStatus
        ? { processingStatus: params.processingStatus }
        : {}),
      ...(params.title !== undefined ? { title: params.title } : {}),
      ...(params.summary !== undefined ? { summary: params.summary } : {}),
    };

    try {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        const body = await postProcessDocumentStatus(payload, target);
        if (body.updated > 0) {
          return body.documents.map((row) => ({
            id: row.id,
            processingStatus: row.processingStatus ?? params.processingStatus,
            title: row.title ?? params.title ?? null,
            summary: row.summary ?? params.summary ?? null,
          })) as Awaited<ReturnType<typeof updateDocumentByPath>>;
        }
        if (attempt < maxRetries) {
          logger?.warn("process-document rust updated 0 rows, retrying", {
            attempt,
            maxRetries,
            pathTokens: params.pathTokens,
            teamId: params.teamId,
            delayMs,
          });
          await new Promise((r) => setTimeout(r, delayMs));
        }
      }
      logger?.warn("process-document rust updated 0 rows after retries", {
        pathTokens: params.pathTokens,
        teamId: params.teamId,
        maxRetries,
      });
      return [];
    } catch (error) {
      if (target.mode === "replacement") {
        throw error;
      }
      logger?.warn(
        "process-document rust failed; falling back to drizzle",
        {
          error: error instanceof Error ? error.message : "unknown",
        },
      );
    }
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const result = await updateDocumentByPath(db, params);
    if (result && result.length > 0) {
      return result;
    }
    if (attempt < maxRetries) {
      logger?.warn("Document update returned 0 rows, retrying", {
        attempt,
        maxRetries,
        pathTokens: params.pathTokens,
        teamId: params.teamId,
        delayMs,
      });
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }

  logger?.warn("Document update failed after all retries", {
    pathTokens: params.pathTokens,
    teamId: params.teamId,
    maxRetries,
  });
  return [];
}

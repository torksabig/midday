import {
  deleteDocumentSchema,
  getDocumentSchema,
  getDocumentsSchema,
  getRelatedDocumentsSchema,
  processDocumentSchema,
  reprocessDocumentSchema,
  signedUrlSchema,
  signedUrlsSchema,
} from "@api/schemas/documents";
import {
  assertLegacyIdentityFallbackAllowed,
  tryDelegateDocumentsGet,
  tryDelegateDocumentsGetById,
  tryDelegateDocumentsGetRelated,
  tryDelegateDocumentsCheckAttachments,
  tryDelegateDocumentsDelete,
  tryDelegateDocumentReprocess,
  tryDelegateDocumentsProcess,
  tryDelegateDocumentsSignedUrls,
} from "@api/services/replacement-delegation";
import { createTRPCRouter, protectedProcedure } from "@api/trpc/init";
import { shouldDelegateToReplacementBackend } from "@midday/replacement-backend";
import {
  checkDocumentAttachments,
  deleteDocument,
  getDocumentById,
  getDocuments,
  getRelatedDocuments,
  updateDocumentProcessingStatus,
  updateDocuments,
} from "@midday/db/queries";
import { isMimeTypeSupportedForProcessing } from "@midday/documents/utils";
import { triggerJob } from "@midday/job-client";
import { remove, signedUrl } from "@midday/supabase/storage";
import { TRPCError } from "@trpc/server";

async function enqueueProcessDocumentJobs(
  teamId: string,
  items: Array<{ filePath: string[]; mimetype: string }>,
  jobIdPrefix: "process-doc" | "reprocess-doc",
) {
  const jobResults = await Promise.all(
    items.map((item) =>
      triggerJob(
        "process-document",
        {
          filePath: item.filePath,
          mimetype: item.mimetype,
          teamId,
        },
        "documents",
        {
          jobId:
            jobIdPrefix === "reprocess-doc"
              ? `${jobIdPrefix}_${teamId}_${item.filePath.join("/")}_${Date.now()}`
              : `${jobIdPrefix}_${teamId}_${item.filePath.join("/")}`,
        },
      ),
    ),
  );
  return jobResults.map((result) => ({ id: result.id }));
}

export const documentsRouter = createTRPCRouter({
  get: protectedProcedure
    .input(getDocumentsSchema)
    .query(async ({ input, ctx: { db, teamId, accessToken } }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateDocumentsGet(
          {
            cursor: input.cursor,
            pageSize: input.pageSize,
            q: input.q,
            tags: input.tags,
            start: input.start,
            end: input.end,
          },
          accessToken,
        );
        if (delegated) {
          return delegated;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return getDocuments(db, {
        teamId: teamId!,
        ...input,
      });
    }),

  getById: protectedProcedure
    .input(getDocumentSchema)
    .query(async ({ input, ctx: { db, teamId, accessToken } }) => {
      if (shouldDelegateToReplacementBackend()) {
        if (input.id) {
          const delegated = await tryDelegateDocumentsGetById(
            input.id,
            input.filePath,
            accessToken,
          );
          if (delegated.delegated) {
            return delegated.document ?? null;
          }
        }
        assertLegacyIdentityFallbackAllowed();
      }

      const result = await getDocumentById(db, {
        id: input.id,
        filePath: input.filePath,
        teamId: teamId!,
      });

      return result ?? null;
    }),

  getRelatedDocuments: protectedProcedure
    .input(getRelatedDocumentsSchema)
    .query(async ({ input, ctx: { db, teamId, accessToken } }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateDocumentsGetRelated(
          input.id,
          input.pageSize,
          accessToken,
        );
        if (delegated) {
          return delegated;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return getRelatedDocuments(db, {
        id: input.id,
        pageSize: input.pageSize,
        teamId: teamId!,
      });
    }),

  checkAttachments: protectedProcedure
    .input(deleteDocumentSchema)
    .query(async ({ input, ctx: { db, teamId, accessToken } }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateDocumentsCheckAttachments(
          input.id,
          accessToken,
        );
        if (delegated) {
          return delegated;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return checkDocumentAttachments(db, {
        id: input.id,
        teamId: teamId!,
      });
    }),

  delete: protectedProcedure
    .input(deleteDocumentSchema)
    .mutation(async ({ input, ctx: { db, supabase, teamId, accessToken } }) => {
      let document: { id: string; pathTokens: string[] | null } | null | undefined;

      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateDocumentsDelete(
          input.id,
          accessToken,
        );
        if (delegated.delegated) {
          document = delegated.document;
        } else {
          assertLegacyIdentityFallbackAllowed();
        }
      }

      if (document === undefined) {
        document = await deleteDocument(db, {
          id: input.id,
          teamId: teamId!,
        });
      }

      if (!document?.pathTokens) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document not found",
        });
      }

      // Delete from storage
      await remove(supabase, {
        bucket: "vault",
        path: document.pathTokens,
      });

      return document;
    }),

  /**
   * Hybrid: SQL (unsupported → completed) on Rust; process-document jobs on Node.
   * Dashboard prefers Rust `POST /documents/process` + `enqueueProcessDocument`.
   */
  processDocument: protectedProcedure
    .input(processDocumentSchema)
    .mutation(async ({ ctx: { teamId, db, accessToken }, input }) => {
      let toEnqueue = input.filter((item) =>
        isMimeTypeSupportedForProcessing(item.mimetype),
      );

      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateDocumentsProcess(input, accessToken);
        if (delegated.delegated) {
          toEnqueue = delegated.result.toEnqueue;
        } else {
          assertLegacyIdentityFallbackAllowed();
          const unsupportedNames = input
            .filter((item) => !isMimeTypeSupportedForProcessing(item.mimetype))
            .map((doc) => doc.filePath.join("/"));
          if (unsupportedNames.length > 0) {
            await updateDocuments(db, {
              ids: unsupportedNames,
              teamId: teamId!,
              processingStatus: "completed",
            });
          }
        }
      } else {
        const unsupportedNames = input
          .filter((item) => !isMimeTypeSupportedForProcessing(item.mimetype))
          .map((doc) => doc.filePath.join("/"));
        if (unsupportedNames.length > 0) {
          await updateDocuments(db, {
            ids: unsupportedNames,
            teamId: teamId!,
            processingStatus: "completed",
          });
        }
      }

      if (toEnqueue.length === 0) {
        return;
      }

      return {
        jobs: await enqueueProcessDocumentJobs(
          teamId!,
          toEnqueue,
          "process-doc",
        ),
      };
    }),

  /** Job-only enqueue after dashboard/Rust SQL half for process/reprocess. */
  enqueueProcessDocument: protectedProcedure
    .input(processDocumentSchema)
    .mutation(async ({ ctx: { teamId }, input }) => {
      const supported = input.filter((item) =>
        isMimeTypeSupportedForProcessing(item.mimetype),
      );
      if (supported.length === 0) {
        return { jobs: [] as Array<{ id: string }> };
      }
      return {
        jobs: await enqueueProcessDocumentJobs(
          teamId!,
          supported,
          "process-doc",
        ),
      };
    }),

  /**
   * Hybrid: SQL (get + status) on Rust; process-document job on Node.
   * Dashboard prefers Rust `POST /documents/{id}/reprocess` + enqueue.
   */
  reprocessDocument: protectedProcedure
    .input(reprocessDocumentSchema)
    .mutation(async ({ ctx: { teamId, db, accessToken }, input }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateDocumentReprocess(
          input.id,
          accessToken,
        );
        if (delegated.delegated) {
          const { result } = delegated;
          if (result.skipped || !result.enqueue) {
            return {
              success: true,
              skipped: true as const,
              document: {
                id: result.document.id,
                processingStatus: "completed" as const,
              },
            };
          }

          const jobs = await enqueueProcessDocumentJobs(
            teamId!,
            [{ filePath: result.filePath, mimetype: result.mimetype }],
            "reprocess-doc",
          );

          return {
            success: true,
            jobId: jobs[0]?.id,
            document: {
              id: result.document.id,
              processingStatus: "pending" as const,
            },
          };
        }
        assertLegacyIdentityFallbackAllowed();
      }

      type DocRow = Awaited<ReturnType<typeof getDocumentById>>;
      const document: DocRow | null | undefined = await getDocumentById(db, {
        id: input.id,
        teamId: teamId!,
      });

      if (!document) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document not found",
        });
      }

      const mimetype =
        (document.metadata as { mimetype?: string })?.mimetype ??
        "application/octet-stream";

      if (!document.pathTokens || document.pathTokens.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Document has no file path and cannot be reprocessed",
        });
      }

      if (!isMimeTypeSupportedForProcessing(mimetype)) {
        await updateDocumentProcessingStatus(db, {
          id: input.id,
          processingStatus: "completed",
        });
        return {
          success: true,
          skipped: true,
          document: { id: input.id, processingStatus: "completed" as const },
        };
      }

      await updateDocumentProcessingStatus(db, {
        id: input.id,
        processingStatus: "pending",
      });

      const jobs = await enqueueProcessDocumentJobs(
        teamId!,
        [{ filePath: document.pathTokens, mimetype }],
        "reprocess-doc",
      );

      return {
        success: true,
        jobId: jobs[0]?.id,
        document: { id: input.id, processingStatus: "pending" as const },
      };
    }),

  signedUrl: protectedProcedure
    .input(signedUrlSchema)
    .mutation(async ({ input, ctx: { supabase } }) => {
      const { data } = await signedUrl(supabase, {
        bucket: "vault",
        path: input.filePath,
        expireIn: input.expireIn,
      });

      return data;
    }),

  signedUrls: protectedProcedure
    .input(signedUrlsSchema)
    .mutation(async ({ input, ctx: { supabase, accessToken } }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateDocumentsSignedUrls(
          input,
          accessToken,
        );
        if (delegated.delegated) {
          return delegated.urls;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      const results = await Promise.all(
        input.map((filePath) =>
          signedUrl(supabase, {
            bucket: "vault",
            path: filePath,
            expireIn: 60,
          }),
        ),
      );

      return results
        .map((r) => r.data?.signedUrl)
        .filter((url): url is string => !!url);
    }),
});

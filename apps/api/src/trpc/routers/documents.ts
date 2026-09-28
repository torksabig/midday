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
  tryDelegateDocumentProcessingStatus,
  tryDelegateDocumentsProcessingStatus,
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
        const delegated = await tryDelegateDocumentsGetById(
          input.id,
          input.filePath,
          accessToken,
        );
        if (delegated.delegated) {
          return delegated.document ?? null;
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

  processDocument: protectedProcedure
    .input(processDocumentSchema)
    .mutation(async ({ ctx: { teamId, db, accessToken }, input }) => {
      const supportedDocuments = input.filter((item) =>
        isMimeTypeSupportedForProcessing(item.mimetype),
      );

      const unsupportedDocuments = input.filter(
        (item) => !isMimeTypeSupportedForProcessing(item.mimetype),
      );

      if (unsupportedDocuments.length > 0) {
        const unsupportedNames = unsupportedDocuments.map((doc) =>
          doc.filePath.join("/"),
        );

        if (shouldDelegateToReplacementBackend()) {
          const delegated = await tryDelegateDocumentsProcessingStatus(
            unsupportedNames,
            "completed",
            accessToken,
          );
          if (!delegated.delegated) {
            assertLegacyIdentityFallbackAllowed();
            await updateDocuments(db, {
              ids: unsupportedNames,
              teamId: teamId!,
              processingStatus: "completed",
            });
          }
        } else {
          await updateDocuments(db, {
            ids: unsupportedNames,
            teamId: teamId!,
            processingStatus: "completed",
          });
        }
      }

      if (supportedDocuments.length === 0) {
        return;
      }

      // Trigger BullMQ jobs for each supported document
      // Use deterministic jobId based on teamId:filePath for deduplication
      const jobResults = await Promise.all(
        supportedDocuments.map((item) =>
          triggerJob(
            "process-document",
            {
              filePath: item.filePath,
              mimetype: item.mimetype,
              teamId: teamId!,
            },
            "documents",
            { jobId: `process-doc_${teamId}_${item.filePath.join("/")}` },
          ),
        ),
      );

      return {
        jobs: jobResults.map((result) => ({ id: result.id })),
      };
    }),

  reprocessDocument: protectedProcedure
    .input(reprocessDocumentSchema)
    .mutation(async ({ ctx: { teamId, db, accessToken }, input }) => {
      type DocRow = Awaited<ReturnType<typeof getDocumentById>>;
      let document: DocRow | null | undefined;

      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateDocumentsGetById(
          input.id,
          undefined,
          accessToken,
        );
        if (delegated.delegated) {
          document = delegated.document as DocRow;
        } else {
          assertLegacyIdentityFallbackAllowed();
          document = await getDocumentById(db, {
            id: input.id,
            teamId: teamId!,
          });
        }
      } else {
        document = await getDocumentById(db, {
          id: input.id,
          teamId: teamId!,
        });
      }

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

      const setStatus = async (processingStatus: "completed" | "pending") => {
        if (shouldDelegateToReplacementBackend()) {
          const delegated = await tryDelegateDocumentProcessingStatus(
            input.id,
            processingStatus,
            accessToken,
          );
          if (delegated.delegated) {
            return;
          }
          assertLegacyIdentityFallbackAllowed();
        }
        await updateDocumentProcessingStatus(db, {
          id: input.id,
          processingStatus,
        });
      };

      if (!isMimeTypeSupportedForProcessing(mimetype)) {
        await setStatus("completed");
        return {
          success: true,
          skipped: true,
          document: { id: input.id, processingStatus: "completed" as const },
        };
      }

      await setStatus("pending");

      const jobResult = await triggerJob(
        "process-document",
        {
          filePath: document.pathTokens,
          mimetype,
          teamId: teamId!,
        },
        "documents",
        {
          jobId: `reprocess-doc_${teamId}_${document.pathTokens.join("/")}_${Date.now()}`,
        },
      );

      return {
        success: true,
        jobId: jobResult.id,
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
    .mutation(async ({ input, ctx: { supabase } }) => {
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

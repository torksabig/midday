import {
  createDocumentTagAssignmentSchema,
  deleteDocumentTagAssignmentSchema,
} from "@api/schemas/document-tag-assignments";
import {
  assertLegacyIdentityFallbackAllowed,
  tryDelegateDocumentTagAssignmentCreate,
  tryDelegateDocumentTagAssignmentDelete,
} from "@api/services/replacement-delegation";
import { createTRPCRouter, protectedProcedure } from "@api/trpc/init";
import { shouldDelegateToReplacementBackend } from "@midday/replacement-backend";
import {
  createDocumentTagAssignment,
  deleteDocumentTagAssignment,
} from "@midday/db/queries";

export const documentTagAssignmentsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createDocumentTagAssignmentSchema)
    .mutation(async ({ ctx: { db, teamId, accessToken }, input }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateDocumentTagAssignmentCreate(
          input.documentId,
          input.tagId,
          accessToken,
        );
        if (delegated.delegated) {
          return delegated.assignment;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return createDocumentTagAssignment(db, {
        documentId: input.documentId,
        tagId: input.tagId,
        teamId: teamId!,
      });
    }),

  delete: protectedProcedure
    .input(deleteDocumentTagAssignmentSchema)
    .mutation(async ({ ctx: { db, teamId, accessToken }, input }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateDocumentTagAssignmentDelete(
          input.documentId,
          input.tagId,
          accessToken,
        );
        if (delegated.delegated) {
          return delegated.assignment ?? undefined;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return deleteDocumentTagAssignment(db, {
        documentId: input.documentId,
        tagId: input.tagId,
        teamId: teamId!,
      });
    }),
});

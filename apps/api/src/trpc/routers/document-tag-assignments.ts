import {
  createDocumentTagAssignmentSchema,
  deleteDocumentTagAssignmentSchema,
} from "@api/schemas/document-tag-assignments";
import {
  assertNoLegacyFallback,
  tryDelegateDocumentTagAssignmentCreate,
  tryDelegateDocumentTagAssignmentDelete,
} from "@api/services/replacement-delegation";
import { createTRPCRouter, protectedProcedure } from "@api/trpc/init";

/** Stage 4: dashboard uses Rust directly; keep AppRouter for queryKey/RouterOutputs only. */
export const documentTagAssignmentsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createDocumentTagAssignmentSchema)
    .mutation(async ({ ctx: { accessToken }, input }) => {
      const delegated = await tryDelegateDocumentTagAssignmentCreate(
        input.documentId,
        input.tagId,
        accessToken,
      );
      if (delegated.delegated) {
        return delegated.assignment;
      }
      return assertNoLegacyFallback("documentTagAssignments.create");
    }),

  delete: protectedProcedure
    .input(deleteDocumentTagAssignmentSchema)
    .mutation(async ({ ctx: { accessToken }, input }) => {
      const delegated = await tryDelegateDocumentTagAssignmentDelete(
        input.documentId,
        input.tagId,
        accessToken,
      );
      if (delegated.delegated) {
        return delegated.assignment ?? undefined;
      }
      return assertNoLegacyFallback("documentTagAssignments.delete");
    }),
});

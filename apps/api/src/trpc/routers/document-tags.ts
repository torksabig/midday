import {
  createDocumentTagSchema,
  deleteDocumentTagSchema,
} from "@api/schemas/document-tags";
import {
  assertNoLegacyFallback,
  tryDelegateDocumentTagCreate,
  tryDelegateDocumentTagDelete,
  tryDelegateDocumentTagsGet,
} from "@api/services/replacement-delegation";
import { createTRPCRouter, protectedProcedure } from "@api/trpc/init";
import slugify from "@sindresorhus/slugify";

/** Stage 4: dashboard uses Rust directly; keep AppRouter for queryKey/RouterOutputs only. */
export const documentTagsRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx: { accessToken } }) => {
    const delegated = await tryDelegateDocumentTagsGet(accessToken);
    if (delegated) {
      return delegated;
    }
    return assertNoLegacyFallback("documentTags.get");
  }),

  create: protectedProcedure
    .input(createDocumentTagSchema)
    .mutation(async ({ ctx: { accessToken }, input }) => {
      const slug = slugify(input.name);
      const delegated = await tryDelegateDocumentTagCreate(
        input.name,
        slug,
        accessToken,
      );
      if (delegated.delegated) {
        // Embedding side-effect deferred (dashboard create already on Rust).
        return delegated.tag;
      }
      return assertNoLegacyFallback("documentTags.create");
    }),

  delete: protectedProcedure
    .input(deleteDocumentTagSchema)
    .mutation(async ({ ctx: { accessToken }, input }) => {
      const delegated = await tryDelegateDocumentTagDelete(
        input.id,
        accessToken,
      );
      if (delegated.delegated) {
        return delegated.tag ?? undefined;
      }
      return assertNoLegacyFallback("documentTags.delete");
    }),
});

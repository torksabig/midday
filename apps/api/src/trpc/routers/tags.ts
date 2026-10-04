import {
  createTagSchema,
  deleteTagSchema,
  updateTagSchema,
} from "@api/schemas/tags";
import {
  assertNoLegacyFallback,
  tryDelegateTagCreate,
  tryDelegateTagDelete,
  tryDelegateTagUpdate,
  tryDelegateTagsGet,
} from "@api/services/replacement-delegation";
import { createTRPCRouter, protectedProcedure } from "@api/trpc/init";

/** Stage 4: dashboard uses Rust directly; keep AppRouter for queryKey/RouterOutputs only. */
export const tagsRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx: { accessToken } }) => {
    const delegated = await tryDelegateTagsGet(accessToken);
    if (delegated) {
      return delegated;
    }
    return assertNoLegacyFallback("tags.get");
  }),

  create: protectedProcedure
    .input(createTagSchema)
    .mutation(async ({ ctx: { accessToken }, input }) => {
      const delegated = await tryDelegateTagCreate(input.name, accessToken);
      if (delegated.delegated) {
        return delegated.tag;
      }
      return assertNoLegacyFallback("tags.create");
    }),

  delete: protectedProcedure
    .input(deleteTagSchema)
    .mutation(async ({ ctx: { accessToken }, input }) => {
      const delegated = await tryDelegateTagDelete(input.id, accessToken);
      if (delegated.delegated) {
        return delegated.tag;
      }
      return assertNoLegacyFallback("tags.delete");
    }),

  update: protectedProcedure
    .input(updateTagSchema)
    .mutation(async ({ ctx: { accessToken }, input }) => {
      const delegated = await tryDelegateTagUpdate(
        input.id,
        input.name,
        accessToken,
      );
      if (delegated.delegated) {
        return delegated.tag;
      }
      return assertNoLegacyFallback("tags.update");
    }),
});

import {
  createTagSchema,
  deleteTagSchema,
  updateTagSchema,
} from "@api/schemas/tags";
import {
  assertLegacyIdentityFallbackAllowed,
  tryDelegateTagsGet,
} from "@api/services/replacement-delegation";
import { createTRPCRouter, protectedProcedure } from "@api/trpc/init";
import { shouldDelegateToReplacementBackend } from "@midday/replacement-backend";
import { createTag, deleteTag, getTags, updateTag } from "@midday/db/queries";

export const tagsRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx: { db, teamId, accessToken } }) => {
    if (shouldDelegateToReplacementBackend()) {
      const delegated = await tryDelegateTagsGet(accessToken);
      if (delegated) {
        return delegated;
      }
      assertLegacyIdentityFallbackAllowed();
    }

    return getTags(db, {
      teamId: teamId!,
    });
  }),

  create: protectedProcedure
    .input(createTagSchema)
    .mutation(async ({ ctx: { db, teamId }, input }) => {
      return createTag(db, {
        teamId: teamId!,
        name: input.name,
      });
    }),

  delete: protectedProcedure
    .input(deleteTagSchema)
    .mutation(async ({ ctx: { db, teamId }, input }) => {
      return deleteTag(db, {
        id: input.id,
        teamId: teamId!,
      });
    }),

  update: protectedProcedure
    .input(updateTagSchema)
    .mutation(async ({ ctx: { db, teamId }, input }) => {
      return updateTag(db, {
        id: input.id,
        name: input.name,
        teamId: teamId!,
      });
    }),
});

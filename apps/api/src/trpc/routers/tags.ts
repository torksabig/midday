import {
  createTagSchema,
  deleteTagSchema,
  updateTagSchema,
} from "@api/schemas/tags";
import {
  assertLegacyIdentityFallbackAllowed,
  tryDelegateTagCreate,
  tryDelegateTagDelete,
  tryDelegateTagUpdate,
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
    .mutation(async ({ ctx: { db, teamId, accessToken }, input }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateTagCreate(input.name, accessToken);
        if (delegated.delegated) {
          return delegated.tag;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return createTag(db, {
        teamId: teamId!,
        name: input.name,
      });
    }),

  delete: protectedProcedure
    .input(deleteTagSchema)
    .mutation(async ({ ctx: { db, teamId, accessToken }, input }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateTagDelete(input.id, accessToken);
        if (delegated.delegated) {
          return delegated.tag;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return deleteTag(db, {
        id: input.id,
        teamId: teamId!,
      });
    }),

  update: protectedProcedure
    .input(updateTagSchema)
    .mutation(async ({ ctx: { db, teamId, accessToken }, input }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateTagUpdate(
          input.id,
          input.name,
          accessToken,
        );
        if (delegated.delegated) {
          return delegated.tag;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return updateTag(db, {
        id: input.id,
        name: input.name,
        teamId: teamId!,
      });
    }),
});

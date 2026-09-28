import {
  deleteTrackerProjectSchema,
  getTrackerProjectByIdSchema,
  getTrackerProjectsSchema,
  upsertTrackerProjectSchema,
} from "@api/schemas/tracker-projects";
import {
  assertLegacyIdentityFallbackAllowed,
  tryDelegateTrackerProjectGetById,
  tryDelegateTrackerProjectsGet,
  tryDelegateTrackerProjectUpsert,
  tryDelegateTrackerProjectDelete,
} from "@api/services/replacement-delegation";
import { createTRPCRouter, protectedProcedure } from "@api/trpc/init";
import { shouldDelegateToReplacementBackend } from "@midday/replacement-backend";
import {
  deleteTrackerProject,
  getTrackerProjectById,
  getTrackerProjects,
  upsertTrackerProject,
} from "@midday/db/queries";

export const trackerProjectsRouter = createTRPCRouter({
  get: protectedProcedure
    .input(getTrackerProjectsSchema.optional())
    .query(async ({ input, ctx: { db, teamId, accessToken } }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateTrackerProjectsGet(
          {
            cursor: input?.cursor,
            pageSize: input?.pageSize,
            q: input?.q,
            start: input?.start,
            end: input?.end,
            status: input?.status,
            customers: input?.customers,
            tags: input?.tags,
            sort: input?.sort,
          },
          accessToken,
        );
        if (delegated) {
          return delegated;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return getTrackerProjects(db, {
        ...input,
        teamId: teamId!,
      });
    }),

  upsert: protectedProcedure
    .input(upsertTrackerProjectSchema)
    .mutation(async ({ input, ctx: { db, teamId, session, accessToken } }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateTrackerProjectUpsert(
          {
            ...input,
            tags: input.tags ?? null,
          },
          accessToken,
        );
        if (delegated.delegated) {
          return delegated.project;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return upsertTrackerProject(db, {
        ...input,
        teamId: teamId!,
        userId: session.user.id,
      });
    }),

  delete: protectedProcedure
    .input(deleteTrackerProjectSchema)
    .mutation(async ({ input, ctx: { db, teamId, accessToken } }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateTrackerProjectDelete(
          input.id,
          accessToken,
        );
        if (delegated.delegated) {
          return delegated.result;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return deleteTrackerProject(db, {
        ...input,
        teamId: teamId!,
      });
    }),

  getById: protectedProcedure
    .input(getTrackerProjectByIdSchema)
    .query(async ({ input, ctx: { db, teamId, accessToken } }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateTrackerProjectGetById(
          input.id,
          accessToken,
        );
        if (delegated.delegated) {
          return delegated.project ?? null;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return getTrackerProjectById(db, {
        ...input,
        teamId: teamId!,
      });
    }),
});

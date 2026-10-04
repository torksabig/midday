import {
  deleteTrackerProjectSchema,
  getTrackerProjectByIdSchema,
  getTrackerProjectsSchema,
  upsertTrackerProjectSchema,
} from "@api/schemas/tracker-projects";
import {
  assertNoLegacyFallback,
  tryDelegateTrackerProjectDelete,
  tryDelegateTrackerProjectGetById,
  tryDelegateTrackerProjectUpsert,
  tryDelegateTrackerProjectsGet,
} from "@api/services/replacement-delegation";
import { createTRPCRouter, protectedProcedure } from "@api/trpc/init";

/** Stage 4: dashboard uses Rust directly; keep AppRouter for queryKey/RouterOutputs only. */
export const trackerProjectsRouter = createTRPCRouter({
  get: protectedProcedure
    .input(getTrackerProjectsSchema.optional())
    .query(async ({ input, ctx: { accessToken } }) => {
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
      return assertNoLegacyFallback("trackerProjects.get");
    }),

  upsert: protectedProcedure
    .input(upsertTrackerProjectSchema)
    .mutation(async ({ input, ctx: { accessToken } }) => {
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
      return assertNoLegacyFallback("trackerProjects.upsert");
    }),

  delete: protectedProcedure
    .input(deleteTrackerProjectSchema)
    .mutation(async ({ input, ctx: { accessToken } }) => {
      const delegated = await tryDelegateTrackerProjectDelete(
        input.id,
        accessToken,
      );
      if (delegated.delegated) {
        return delegated.result;
      }
      return assertNoLegacyFallback("trackerProjects.delete");
    }),

  getById: protectedProcedure
    .input(getTrackerProjectByIdSchema)
    .query(async ({ input, ctx: { accessToken } }) => {
      const delegated = await tryDelegateTrackerProjectGetById(
        input.id,
        accessToken,
      );
      if (delegated.delegated) {
        return delegated.project ?? null;
      }
      return assertNoLegacyFallback("trackerProjects.getById");
    }),
});

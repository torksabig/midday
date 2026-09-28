import {
  deleteTrackerEntrySchema,
  getBillableHoursSchema,
  getCurrentTimerSchema,
  getTrackerRecordsByDateSchema,
  getTrackerRecordsByRangeSchema,
  startTimerSchema,
  stopTimerSchema,
  upsertTrackerEntriesSchema,
} from "@api/schemas/tracker-entries";
import {
  assertLegacyIdentityFallbackAllowed,
  tryDelegateTrackerBillableHours,
  tryDelegateTrackerCurrentTimer,
  tryDelegateTrackerEntriesByDate,
  tryDelegateTrackerEntriesByRange,
  tryDelegateTrackerEntriesUpsert,
  tryDelegateTrackerEntryDelete,
  tryDelegateTrackerStartTimer,
  tryDelegateTrackerStopTimer,
  tryDelegateTrackerTimerStatus,
} from "@api/services/replacement-delegation";
import { createTRPCRouter, protectedProcedure } from "@api/trpc/init";
import { shouldDelegateToReplacementBackend } from "@midday/replacement-backend";
import {
  deleteTrackerEntry,
  getBillableHours,
  getCurrentTimer,
  getTimerStatus,
  getTrackerRecordsByDate,
  getTrackerRecordsByRange,
  startTimer,
  stopTimer,
  upsertTrackerEntries,
} from "@midday/db/queries";

export const trackerEntriesRouter = createTRPCRouter({
  getBillableHours: protectedProcedure
    .input(getBillableHoursSchema)
    .query(async ({ ctx: { db, teamId, session, accessToken }, input }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateTrackerBillableHours(
          {
            date: input.date,
            view: input.view,
            weekStartsOnMonday: input.weekStartsOnMonday,
          },
          accessToken,
        );
        if (delegated) {
          return delegated;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return getBillableHours(db, {
        teamId: teamId!,
        date: input.date,
        view: input.view,
        weekStartsOnMonday: input.weekStartsOnMonday,
      });
    }),

  byDate: protectedProcedure
    .input(getTrackerRecordsByDateSchema)
    .query(async ({ ctx: { db, teamId, accessToken }, input }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateTrackerEntriesByDate(
          { date: input.date },
          accessToken,
        );
        if (delegated) {
          return delegated;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return getTrackerRecordsByDate(db, {
        date: input.date,
        teamId: teamId!,
      });
    }),

  byRange: protectedProcedure
    .input(getTrackerRecordsByRangeSchema)
    .query(async ({ input, ctx: { db, session, teamId, accessToken } }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateTrackerEntriesByRange(
          {
            from: input.from,
            to: input.to,
            projectId: input.projectId,
          },
          accessToken,
        );
        if (delegated) {
          return delegated;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return getTrackerRecordsByRange(db, {
        teamId: teamId!,
        userId: session.user.id,
        ...input,
      });
    }),

  upsert: protectedProcedure
    .input(upsertTrackerEntriesSchema)
    .mutation(async ({ ctx: { db, teamId, accessToken }, input }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateTrackerEntriesUpsert(
          input,
          accessToken,
        );
        if (delegated.delegated) {
          return delegated.entries;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return upsertTrackerEntries(db, {
        ...input,
        teamId: teamId!,
      });
    }),

  delete: protectedProcedure
    .input(deleteTrackerEntrySchema)
    .mutation(async ({ ctx: { db, teamId, accessToken }, input }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateTrackerEntryDelete(
          input.id,
          accessToken,
        );
        if (delegated.delegated) {
          return delegated.result;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return deleteTrackerEntry(db, {
        teamId: teamId!,
        id: input.id,
      });
    }),

  // Timer procedures
  startTimer: protectedProcedure
    .input(startTimerSchema)
    .mutation(async ({ ctx: { db, teamId, session, accessToken }, input }) => {
      const assignedId = input.assignedId ?? session.user.id;
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateTrackerStartTimer(
          {
            projectId: input.projectId,
            assignedId,
            description: input.description,
            start: input.start,
          },
          accessToken,
        );
        if (delegated.delegated) {
          return delegated.entry;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return startTimer(db, {
        teamId: teamId!,
        assignedId,
        ...input,
      });
    }),

  stopTimer: protectedProcedure
    .input(stopTimerSchema)
    .mutation(async ({ ctx: { db, teamId, session, accessToken }, input }) => {
      const assignedId = input.assignedId ?? session.user.id;
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateTrackerStopTimer(
          {
            entryId: input.entryId,
            assignedId,
            stop: input.stop,
          },
          accessToken,
        );
        if (delegated.delegated) {
          return delegated.entry;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return stopTimer(db, {
        teamId: teamId!,
        assignedId,
        ...input,
      });
    }),

  getCurrentTimer: protectedProcedure
    .input(getCurrentTimerSchema.optional())
    .query(async ({ ctx: { db, teamId, session, accessToken }, input }) => {
      const assignedId = input?.assignedId ?? session.user.id;
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateTrackerCurrentTimer(
          { assignedId },
          accessToken,
        );
        if (delegated.delegated) {
          return delegated.timer;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return getCurrentTimer(db, {
        teamId: teamId!,
        assignedId,
      });
    }),

  getTimerStatus: protectedProcedure
    .input(getCurrentTimerSchema.optional())
    .query(async ({ ctx: { db, teamId, session, accessToken }, input }) => {
      const assignedId = input?.assignedId ?? session.user.id;
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateTrackerTimerStatus(
          { assignedId },
          accessToken,
        );
        if (delegated) {
          return delegated;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return getTimerStatus(db, {
        teamId: teamId!,
        assignedId,
      });
    }),
});

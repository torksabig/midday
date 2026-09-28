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
  tryDelegateTrackerEntriesByRange,
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
    .query(async ({ ctx: { db, teamId }, input }) => {
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
    .mutation(async ({ ctx: { db, teamId }, input }) => {
      return upsertTrackerEntries(db, {
        ...input,
        teamId: teamId!,
      });
    }),

  delete: protectedProcedure
    .input(deleteTrackerEntrySchema)
    .mutation(async ({ ctx: { db, teamId }, input }) => {
      return deleteTrackerEntry(db, {
        teamId: teamId!,
        id: input.id,
      });
    }),

  // Timer procedures
  startTimer: protectedProcedure
    .input(startTimerSchema)
    .mutation(async ({ ctx: { db, teamId, session }, input }) => {
      return startTimer(db, {
        teamId: teamId!,
        assignedId: input.assignedId ?? session.user.id,
        ...input,
      });
    }),

  stopTimer: protectedProcedure
    .input(stopTimerSchema)
    .mutation(async ({ ctx: { db, teamId, session }, input }) => {
      return stopTimer(db, {
        teamId: teamId!,
        assignedId: input.assignedId ?? session.user.id,
        ...input,
      });
    }),

  getCurrentTimer: protectedProcedure
    .input(getCurrentTimerSchema.optional())
    .query(async ({ ctx: { db, teamId, session }, input }) => {
      return getCurrentTimer(db, {
        teamId: teamId!,
        assignedId: input?.assignedId ?? session.user.id,
      });
    }),

  getTimerStatus: protectedProcedure
    .input(getCurrentTimerSchema.optional())
    .query(async ({ ctx: { db, teamId, session }, input }) => {
      return getTimerStatus(db, {
        teamId: teamId!,
        assignedId: input?.assignedId ?? session.user.id,
      });
    }),
});

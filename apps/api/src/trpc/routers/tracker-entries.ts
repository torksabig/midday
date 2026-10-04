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
  assertNoLegacyFallback,
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

/** Stage 4: dashboard uses Rust directly; keep AppRouter for queryKey/RouterOutputs only. */
export const trackerEntriesRouter = createTRPCRouter({
  getBillableHours: protectedProcedure
    .input(getBillableHoursSchema)
    .query(async ({ ctx: { accessToken }, input }) => {
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
      return assertNoLegacyFallback("trackerEntries.getBillableHours");
    }),

  byDate: protectedProcedure
    .input(getTrackerRecordsByDateSchema)
    .query(async ({ ctx: { accessToken }, input }) => {
      const delegated = await tryDelegateTrackerEntriesByDate(
        { date: input.date },
        accessToken,
      );
      if (delegated) {
        return delegated;
      }
      return assertNoLegacyFallback("trackerEntries.byDate");
    }),

  byRange: protectedProcedure
    .input(getTrackerRecordsByRangeSchema)
    .query(async ({ input, ctx: { accessToken } }) => {
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
      return assertNoLegacyFallback("trackerEntries.byRange");
    }),

  upsert: protectedProcedure
    .input(upsertTrackerEntriesSchema)
    .mutation(async ({ ctx: { accessToken }, input }) => {
      const delegated = await tryDelegateTrackerEntriesUpsert(
        input,
        accessToken,
      );
      if (delegated.delegated) {
        return delegated.entries;
      }
      return assertNoLegacyFallback("trackerEntries.upsert");
    }),

  delete: protectedProcedure
    .input(deleteTrackerEntrySchema)
    .mutation(async ({ ctx: { accessToken }, input }) => {
      const delegated = await tryDelegateTrackerEntryDelete(
        input.id,
        accessToken,
      );
      if (delegated.delegated) {
        return delegated.result;
      }
      return assertNoLegacyFallback("trackerEntries.delete");
    }),

  startTimer: protectedProcedure
    .input(startTimerSchema)
    .mutation(async ({ ctx: { session, accessToken }, input }) => {
      const assignedId = input.assignedId ?? session.user.id;
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
      return assertNoLegacyFallback("trackerEntries.startTimer");
    }),

  stopTimer: protectedProcedure
    .input(stopTimerSchema)
    .mutation(async ({ ctx: { session, accessToken }, input }) => {
      const assignedId = input.assignedId ?? session.user.id;
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
      return assertNoLegacyFallback("trackerEntries.stopTimer");
    }),

  getCurrentTimer: protectedProcedure
    .input(getCurrentTimerSchema.optional())
    .query(async ({ ctx: { session, accessToken }, input }) => {
      const assignedId = input?.assignedId ?? session.user.id;
      const delegated = await tryDelegateTrackerCurrentTimer(
        { assignedId },
        accessToken,
      );
      if (delegated.delegated) {
        return delegated.timer;
      }
      return assertNoLegacyFallback("trackerEntries.getCurrentTimer");
    }),

  getTimerStatus: protectedProcedure
    .input(getCurrentTimerSchema.optional())
    .query(async ({ ctx: { session, accessToken }, input }) => {
      const assignedId = input?.assignedId ?? session.user.id;
      const delegated = await tryDelegateTrackerTimerStatus(
        { assignedId },
        accessToken,
      );
      if (delegated) {
        return delegated;
      }
      return assertNoLegacyFallback("trackerEntries.getTimerStatus");
    }),
});

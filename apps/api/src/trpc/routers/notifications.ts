import {
  getNotificationsSchema,
  updateAllNotificationsStatusSchema,
  updateNotificationStatusSchema,
} from "@api/schemas/notifications";
import {
  assertNoLegacyFallback,
  tryDelegateNotificationsList,
  tryDelegateNotificationUpdateStatus,
  tryDelegateNotificationsUpdateAll,
} from "@api/services/replacement-delegation";
import { createTRPCRouter, protectedProcedure } from "@api/trpc/init";

/** Stage 4: dashboard uses Rust directly; keep AppRouter for queryKey/RouterOutputs only. */
export const notificationsRouter = createTRPCRouter({
  list: protectedProcedure
    .input(getNotificationsSchema.optional())
    .query(async ({ ctx: { session, accessToken }, input }) => {
      const delegated = await tryDelegateNotificationsList(
        {
          cursor: input?.cursor,
          pageSize: input?.pageSize,
          status: input?.status,
          userId: session.user.id,
          priority: input?.priority,
          maxPriority: input?.maxPriority,
        },
        accessToken,
      );
      if (delegated) {
        return delegated;
      }
      return assertNoLegacyFallback("notifications.list");
    }),

  updateStatus: protectedProcedure
    .input(updateNotificationStatusSchema)
    .mutation(async ({ ctx: { accessToken }, input }) => {
      const delegated = await tryDelegateNotificationUpdateStatus(
        input.activityId,
        input.status,
        accessToken,
      );
      if (delegated.delegated) {
        return delegated.notification;
      }
      return assertNoLegacyFallback("notifications.updateStatus");
    }),

  updateAllStatus: protectedProcedure
    .input(updateAllNotificationsStatusSchema)
    .mutation(async ({ ctx: { accessToken }, input }) => {
      const delegated = await tryDelegateNotificationsUpdateAll(
        input.status,
        accessToken,
      );
      if (delegated.delegated) {
        return delegated.notifications;
      }
      return assertNoLegacyFallback("notifications.updateAllStatus");
    }),
});

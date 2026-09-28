import {
  getNotificationsSchema,
  updateAllNotificationsStatusSchema,
  updateNotificationStatusSchema,
} from "@api/schemas/notifications";
import {
  assertLegacyIdentityFallbackAllowed,
  tryDelegateNotificationsList,
  tryDelegateNotificationUpdateStatus,
  tryDelegateNotificationsUpdateAll,
} from "@api/services/replacement-delegation";
import { createTRPCRouter, protectedProcedure } from "@api/trpc/init";
import { shouldDelegateToReplacementBackend } from "@midday/replacement-backend";
import {
  getActivities,
  updateActivityStatus,
  updateAllActivitiesStatus,
} from "@midday/db/queries";

export const notificationsRouter = createTRPCRouter({
  list: protectedProcedure
    .input(getNotificationsSchema.optional())
    .query(async ({ ctx: { teamId, db, session, accessToken }, input }) => {
      if (shouldDelegateToReplacementBackend()) {
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
        assertLegacyIdentityFallbackAllowed();
      }

      return getActivities(db, {
        teamId: teamId!,
        userId: session.user.id,
        ...input,
      });
    }),

  updateStatus: protectedProcedure
    .input(updateNotificationStatusSchema)
    .mutation(async ({ ctx: { db, teamId, accessToken }, input }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateNotificationUpdateStatus(
          input.activityId,
          input.status,
          accessToken,
        );
        if (delegated.delegated) {
          return delegated.notification;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return updateActivityStatus(db, input.activityId, input.status, teamId!);
    }),

  updateAllStatus: protectedProcedure
    .input(updateAllNotificationsStatusSchema)
    .mutation(async ({ ctx: { db, teamId, session, accessToken }, input }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateNotificationsUpdateAll(
          input.status,
          accessToken,
        );
        if (delegated.delegated) {
          return delegated.notifications;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return updateAllActivitiesStatus(db, teamId!, input.status, {
        userId: session.user.id,
      });
    }),
});

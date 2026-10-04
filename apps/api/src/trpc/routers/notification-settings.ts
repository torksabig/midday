import {
  bulkUpdateNotificationSettingsSchema,
  getNotificationSettingsSchema,
  updateNotificationSettingSchema,
} from "@api/schemas/notification-settings";
import {
  assertNoLegacyFallback,
  tryDelegateNotificationSettingsGet,
  tryDelegateNotificationSettingsUpdate,
  tryDelegateNotificationSettingsBulkUpdate,
  tryDelegateNotificationPreferences,
} from "@api/services/replacement-delegation";
import { createTRPCRouter, protectedProcedure } from "@api/trpc/init";

/** Stage 4: dashboard uses Rust directly; keep AppRouter for queryKey/RouterOutputs only. */
export const notificationSettingsRouter = createTRPCRouter({
  get: protectedProcedure
    .input(getNotificationSettingsSchema.optional())
    .query(async ({ ctx: { accessToken }, input = {} }) => {
      const delegated = await tryDelegateNotificationSettingsGet(
        {
          notificationType: input.notificationType,
          channel: input.channel,
        },
        accessToken,
      );
      if (delegated) {
        return delegated;
      }
      return assertNoLegacyFallback("notificationSettings.get");
    }),

  getAll: protectedProcedure.query(async ({ ctx: { accessToken } }) => {
    const delegated = await tryDelegateNotificationPreferences(accessToken);
    if (delegated) {
      return delegated;
    }
    return assertNoLegacyFallback("notificationSettings.getAll");
  }),

  update: protectedProcedure
    .input(updateNotificationSettingSchema)
    .mutation(async ({ ctx: { accessToken }, input }) => {
      const delegated = await tryDelegateNotificationSettingsUpdate(
        input,
        accessToken,
      );
      if (delegated.delegated) {
        return delegated.setting;
      }
      return assertNoLegacyFallback("notificationSettings.update");
    }),

  bulkUpdate: protectedProcedure
    .input(bulkUpdateNotificationSettingsSchema)
    .mutation(async ({ ctx: { accessToken }, input }) => {
      const delegated = await tryDelegateNotificationSettingsBulkUpdate(
        input.updates,
        accessToken,
      );
      if (delegated.delegated) {
        return delegated.settings;
      }
      return assertNoLegacyFallback("notificationSettings.bulkUpdate");
    }),
});

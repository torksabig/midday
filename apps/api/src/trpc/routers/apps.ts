import {
  createPlatformLinkTokenSchema,
  disconnectAppSchema,
  removeWhatsAppConnectionSchema,
  updateAppSettingsSchema,
} from "@api/schemas/apps";
import {
  assertLegacyIdentityFallbackAllowed,
  tryDelegateAppsGet,
  tryDelegateAppsDisconnect,
  tryDelegateAppsUpdate,
  tryDelegateAppsUpdateSettings,
  tryDelegateAppsRemoveWhatsApp,
  tryDelegateAppsCreatePlatformLinkToken,
} from "@api/services/replacement-delegation";
import { createTRPCRouter, protectedProcedure } from "@api/trpc/init";
import {
  createPlatformLinkToken,
  disconnectApp,
  getApps,
  removeWhatsAppConnection,
  updateAppSettings,
  updateAppSettingsBulk,
} from "@midday/db/queries";
import { shouldDelegateToReplacementBackend } from "@midday/replacement-backend";
import { z } from "zod";

export const appsRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx: { db, teamId, accessToken } }) => {
    if (shouldDelegateToReplacementBackend()) {
      const delegated = await tryDelegateAppsGet(accessToken);
      if (delegated) {
        return delegated;
      }
      assertLegacyIdentityFallbackAllowed();
    }

    return getApps(db, teamId!);
  }),

  disconnect: protectedProcedure
    .input(disconnectAppSchema)
    .mutation(async ({ ctx: { db, teamId, accessToken }, input }) => {
      const { appId } = input;

      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateAppsDisconnect(appId, accessToken);
        if (delegated.delegated) {
          return delegated.app;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return disconnectApp(db, { appId, teamId: teamId! });
    }),

  update: protectedProcedure
    .input(updateAppSettingsSchema)
    .mutation(async ({ ctx: { db, teamId, accessToken }, input }) => {
      const { appId, option } = input;

      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateAppsUpdate(
          appId,
          { option },
          accessToken,
        );
        if (delegated.delegated) {
          return delegated.app;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return updateAppSettings(db, {
        appId,
        teamId: teamId!,
        option,
      });
    }),

  updateSettings: protectedProcedure
    .input(
      z.object({
        appId: z.string(),
        settings: z.array(
          z.object({
            id: z.string(),
            label: z.string().optional(),
            description: z.string().optional(),
            type: z.string().optional(),
            required: z.boolean().optional(),
            value: z.unknown(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx: { db, teamId, accessToken }, input }) => {
      const { appId, settings } = input;

      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateAppsUpdateSettings(
          appId,
          { settings },
          accessToken,
        );
        if (delegated.delegated) {
          return delegated.app;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return updateAppSettingsBulk(db, {
        appId,
        teamId: teamId!,
        settings,
      });
    }),

  removeWhatsAppConnection: protectedProcedure
    .input(removeWhatsAppConnectionSchema)
    .mutation(async ({ ctx: { db, teamId, accessToken }, input }) => {
      const { phoneNumber } = input;

      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateAppsRemoveWhatsApp(
          { phoneNumber },
          accessToken,
        );
        if (delegated.delegated) {
          return delegated.app;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return removeWhatsAppConnection(db, {
        teamId: teamId!,
        phoneNumber,
      });
    }),

  createPlatformLinkToken: protectedProcedure
    .input(createPlatformLinkTokenSchema)
    .mutation(async ({ ctx: { db, teamId, session, accessToken }, input }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateAppsCreatePlatformLinkToken(
          { provider: input.provider },
          accessToken,
        );
        if (delegated.delegated) {
          return delegated.token;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return createPlatformLinkToken(db, {
        provider: input.provider,
        teamId: teamId!,
        userId: session.user.id,
      });
    }),
});

import { updateUserSchema } from "@api/schemas/users";
import {
  assertLegacyIdentityFallbackAllowed,
  tryDelegateUserInvites,
  tryDelegateUserMe,
  tryDelegateUserUpdate,
} from "@api/services/replacement-delegation";
import { resend } from "@api/services/resend";
import { createAdminClient } from "@api/services/supabase";
import { createTRPCRouter, protectedProcedure } from "@api/trpc/init";
import { withRetryOnPrimary } from "@api/utils/db-retry";
import { teamCache } from "@midday/cache/team-cache";
import {
  deleteUser,
  getUserById,
  getUserInvites,
  switchUserTeam,
  updateUser,
} from "@midday/db/queries";
import type { Session } from "@api/utils/auth";
import type { Database } from "@midday/db/client";
import { generateFileKey } from "@midday/encryption";
import { shouldDelegateToReplacementBackend } from "@midday/replacement-backend";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

async function loadUserMeFromLegacy(db: Database, session: Session) {
  const result = await withRetryOnPrimary(db, async (dbInstance) =>
    getUserById(dbInstance, session.user.id),
  );

  if (!result) {
    return undefined;
  }

  return {
    ...result,
    fileKey: result.teamId ? await generateFileKey(result.teamId) : null,
  };
}

export const userRouter = createTRPCRouter({
  me: protectedProcedure.query(async ({ ctx: { db, session, accessToken } }) => {
    if (shouldDelegateToReplacementBackend()) {
      const delegated = await tryDelegateUserMe(
        async (teamId) => generateFileKey(teamId),
        accessToken,
      );
      if (delegated) {
        return delegated;
      }
      assertLegacyIdentityFallbackAllowed();
    }

    return loadUserMeFromLegacy(db, session);
  }),

  update: protectedProcedure
    .input(updateUserSchema)
    .mutation(async ({ ctx: { db, session, accessToken }, input }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateUserUpdate(input, accessToken);
        if (delegated.delegated) {
          return delegated.user;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return updateUser(db, {
        id: session.user.id,
        ...input,
      });
    }),

  switchTeam: protectedProcedure
    .input(z.object({ teamId: z.string().uuid() }))
    .mutation(async ({ ctx: { db, session }, input }) => {
      let result: Awaited<ReturnType<typeof switchUserTeam>>;

      try {
        result = await switchUserTeam(db, {
          userId: session.user.id,
          teamId: input.teamId,
        });
      } catch {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not a member of this team",
        });
      }

      try {
        await Promise.all([
          teamCache.invalidateForUser(session.user.id, result.previousTeamId),
          teamCache.invalidateForUser(session.user.id, input.teamId),
        ]);
      } catch {
        // Non-fatal — cache will expire naturally
      }

      return result;
    }),

  delete: protectedProcedure.mutation(async ({ ctx: { db, session } }) => {
    const supabaseAdmin = await createAdminClient();

    const [data] = await Promise.all([
      deleteUser(db, session.user.id),
      supabaseAdmin.auth.admin.deleteUser(session.user.id),
      resend.contacts.remove({
        email: session.user.email!,
        audienceId: process.env.RESEND_AUDIENCE_ID!,
      }),
    ]);

    return data;
  }),

  invites: protectedProcedure.query(async ({ ctx: { db, session, accessToken } }) => {
    if (!session.user.email) {
      return [];
    }

    if (shouldDelegateToReplacementBackend()) {
      const delegated = await tryDelegateUserInvites(accessToken);
      if (delegated) {
        return delegated;
      }
      assertLegacyIdentityFallbackAllowed();
    }

    return getUserInvites(db, session.user.email);
  }),
});

import {
  acceptTeamInviteSchema,
  createTeamSchema,
  declineTeamInviteSchema,
  deleteTeamInviteSchema,
  deleteTeamMemberSchema,
  deleteTeamSchema,
  inviteTeamMembersSchema,
  leaveTeamSchema,
  updateBaseCurrencySchema,
  updateTeamByIdSchema,
  updateTeamMemberSchema,
} from "@api/schemas/team";
import {
  assertLegacyIdentityFallbackAllowed,
  tryDelegateTeamCurrent,
  tryDelegateTeamInvites,
  tryDelegateTeamList,
  tryDelegateTeamMembers,
  tryDelegateTeamUpdate,
  tryDelegateTeamConnectionStatus,
  tryDelegateTeamAcceptInvite,
  tryDelegateTeamDeclineInvite,
  tryDelegateTeamDeleteInvite,
  tryDelegateTeamDeleteMember,
  tryDelegateTeamUpdateMember,
  tryDelegateTeamLeave,
  tryDelegateUserInvites,
  tryDelegateAvailablePlans,
  tryDelegateTeamCreateInvites,
  tryDelegateTeamDeletePrep,
  tryDelegateTeamDelete,
  tryDelegateTeamCreate,
} from "@api/services/replacement-delegation";
import { createTRPCRouter, protectedProcedure } from "@api/trpc/init";
import { shouldDelegateToReplacementBackend } from "@midday/replacement-backend";
import type { InviteTeamMembersPayload } from "@jobs/schema";

import { teamCache } from "@midday/cache/team-cache";
import {
  CATEGORIES,
  getTaxRateForCategory,
  getTaxTypeForCountry,
} from "@midday/categories";
import {
  acceptTeamInvite,
  createTeam,
  createTeamInvites,
  declineTeamInvite,
  deleteTeam,
  deleteTeamInvite,
  deleteTeamMember,
  getAvailablePlans,
  getBankConnections,
  getInboxAccounts,
  getInvitesByEmail,
  getTeamById,
  getTeamInvites,
  getTeamMemberRole,
  getTeamMembersByTeamId,
  getTeamsByUserId,
  hasTeamAccess,
  leaveTeam,
  updateTeamById,
  updateTeamMember,
} from "@midday/db/queries";
import { triggerJob } from "@midday/job-client";
import { tasks } from "@trigger.dev/sdk";
import { TRPCError } from "@trpc/server";

export const teamRouter = createTRPCRouter({
  current: protectedProcedure.query(async ({ ctx: { db, teamId, accessToken } }) => {
    if (shouldDelegateToReplacementBackend()) {
      const delegated = await tryDelegateTeamCurrent(accessToken);
      if (delegated) {
        return delegated;
      }
      assertLegacyIdentityFallbackAllowed();
    }

    if (!teamId) {
      return null;
    }

    return getTeamById(db, teamId!);
  }),

  update: protectedProcedure
    .input(updateTeamByIdSchema)
    .mutation(async ({ ctx: { db, teamId, accessToken }, input }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateTeamUpdate(input, accessToken);
        if (delegated.delegated) {
          return delegated.team;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return updateTeamById(db, {
        id: teamId!,
        data: input,
      });
    }),

  members: protectedProcedure.query(async ({ ctx: { db, teamId, accessToken } }) => {
    if (shouldDelegateToReplacementBackend()) {
      const delegated = await tryDelegateTeamMembers(accessToken);
      if (delegated) {
        return delegated;
      }
      assertLegacyIdentityFallbackAllowed();
    }

    return getTeamMembersByTeamId(db, teamId!);
  }),

  list: protectedProcedure.query(async ({ ctx: { db, session, accessToken } }) => {
    if (shouldDelegateToReplacementBackend()) {
      const delegated = await tryDelegateTeamList(accessToken);
      if (delegated) {
        return delegated;
      }
      assertLegacyIdentityFallbackAllowed();
    }

    return getTeamsByUserId(db, session.user.id);
  }),

  create: protectedProcedure
    .input(createTeamSchema)
    .mutation(async ({ ctx: { db, session, accessToken }, input }) => {
      const buildCategorySeed = (countryCode?: string | null) =>
        CATEGORIES.map((parent) => {
          const taxRate = getTaxRateForCategory(countryCode, parent.slug);
          const taxType = getTaxTypeForCountry(countryCode);
          return {
            name: parent.name,
            slug: parent.slug,
            color: parent.color,
            system: parent.system,
            excluded: parent.excluded,
            taxRate: taxRate > 0 ? taxRate : null,
            taxType: taxRate > 0 ? taxType : null,
            children: parent.children.map((child) => {
              const childTaxRate = getTaxRateForCategory(
                countryCode,
                child.slug,
              );
              return {
                name: child.name,
                slug: child.slug,
                color: child.color,
                system: child.system,
                excluded: child.excluded,
                taxRate: childTaxRate > 0 ? childTaxRate : null,
                taxType: childTaxRate > 0 ? taxType : null,
              };
            }),
          };
        });

      let teamId: string | undefined;

      if (shouldDelegateToReplacementBackend()) {
        if (!session.user.email) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Email is required to create a team",
          });
        }
        const delegated = await tryDelegateTeamCreate(
          {
            name: input.name,
            email: session.user.email,
            baseCurrency: input.baseCurrency,
            countryCode: input.countryCode,
            fiscalYearStartMonth: input.fiscalYearStartMonth,
            logoUrl: input.logoUrl,
            companyType: input.companyType,
            heardAbout: input.heardAbout,
            switchTeam: input.switchTeam,
            categories: buildCategorySeed(input.countryCode),
          },
          accessToken,
        );
        if (delegated.delegated) {
          teamId = delegated.teamId;
        } else {
          assertLegacyIdentityFallbackAllowed();
        }
      }

      if (!teamId) {
        teamId = await createTeam(db, {
          ...input,
          userId: session.user.id,
          email: session.user.email!,
          companyType: input.companyType,
        });
      }

      if (input.switchTeam) {
        try {
          await teamCache.invalidateForUser(session.user.id);
        } catch {
          // Non-fatal — cache will expire naturally
        }
      }

      return teamId;
    }),

  leave: protectedProcedure
    .input(leaveTeamSchema)
    .mutation(async ({ ctx: { db, session, accessToken }, input }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateTeamLeave(input.teamId, accessToken);
        if (delegated.delegated) {
          try {
            await teamCache.invalidateForUser(session.user.id, input.teamId);
          } catch {
            // Non-fatal — cache will expire naturally
          }
          return delegated.result;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      const teamMembersData = await getTeamMembersByTeamId(db, input.teamId);

      const currentUser = teamMembersData?.find(
        (member) => member.user?.id === session.user.id,
      );

      const totalOwners = teamMembersData?.filter(
        (member) => member.role === "owner",
      ).length;

      if (currentUser?.role === "owner" && totalOwners === 1) {
        throw Error("Action not allowed");
      }

      const result = await leaveTeam(db, {
        userId: session.user.id,
        teamId: input.teamId,
      });

      try {
        await teamCache.invalidateForUser(session.user.id, input.teamId);
      } catch {
        // Non-fatal — cache will expire naturally
      }

      return result;
    }),

  acceptInvite: protectedProcedure
    .input(acceptTeamInviteSchema)
    .mutation(async ({ ctx: { db, session, accessToken }, input }) => {
      if (!session.user.email) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Email is required to accept an invite",
        });
      }

      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateTeamAcceptInvite(
          input.id,
          accessToken,
        );
        if (delegated.delegated) {
          return delegated.result;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return acceptTeamInvite(db, {
        id: input.id,
        userId: session.user.id,
        userEmail: session.user.email,
      });
    }),

  declineInvite: protectedProcedure
    .input(declineTeamInviteSchema)
    .mutation(async ({ ctx: { db, session, accessToken }, input }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateTeamDeclineInvite(
          input.id,
          accessToken,
        );
        if (delegated.delegated) {
          return delegated.result;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return declineTeamInvite(db, {
        id: input.id,
        email: session.user.email!,
      });
    }),

  delete: protectedProcedure
    .input(deleteTeamSchema)
    .mutation(async ({ ctx: { db, session, accessToken }, input }) => {
      type Conn = {
        referenceId: string | null;
        provider: string | null;
        accessToken: string | null;
      };
      let bankConnections: Conn[] | undefined;
      let usedDelegatedPrep = false;

      if (shouldDelegateToReplacementBackend()) {
        const prep = await tryDelegateTeamDeletePrep(input.teamId, accessToken);
        if (prep.delegated) {
          usedDelegatedPrep = true;
          bankConnections = prep.result.connections;
        } else {
          assertLegacyIdentityFallbackAllowed();
        }
      }

      if (!usedDelegatedPrep) {
        const canAccess = await hasTeamAccess(
          db,
          input.teamId,
          session.user.id,
        );

        if (!canAccess) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have access to this team",
          });
        }

        const team = await getTeamById(db, input.teamId);

        if (!team) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Team not found",
          });
        }

        bankConnections = await getBankConnections(db, {
          teamId: input.teamId,
        });
      }

      // Trigger cleanup job BEFORE deleting team from database.
      await triggerJob(
        "delete-team",
        {
          teamId: input.teamId!,
          connections: (bankConnections ?? []).map((c) => ({
            referenceId: c.referenceId,
            provider: c.provider,
            accessToken: c.accessToken,
          })),
        },
        "teams",
      );

      let data: { id: string; memberUserIds: string[] } | null | undefined;

      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateTeamDelete(
          input.teamId,
          accessToken,
        );
        if (delegated.delegated) {
          data = delegated.result;
        } else {
          assertLegacyIdentityFallbackAllowed();
          data = await deleteTeam(db, {
            teamId: input.teamId,
            userId: session.user.id,
          });
        }
      } else {
        data = await deleteTeam(db, {
          teamId: input.teamId,
          userId: session.user.id,
        });
      }

      if (!data) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete team",
        });
      }

      try {
        await Promise.all([
          ...data.memberUserIds.map((userId) =>
            Promise.all([teamCache.invalidateForUser(userId, input.teamId)]),
          ),
        ]);
      } catch {
        // Non-fatal — team deletion succeeded, cache will expire naturally
      }
    }),

  deleteMember: protectedProcedure
    .input(deleteTeamMemberSchema)
    .mutation(async ({ ctx: { db, session, teamId, accessToken }, input }) => {
      if (input.teamId !== teamId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this team",
        });
      }

      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateTeamDeleteMember(
          { userId: input.userId, teamId: input.teamId },
          accessToken,
        );
        if (delegated.delegated) {
          try {
            await teamCache.invalidateForUser(input.userId, input.teamId);
          } catch {
            // Non-fatal
          }
          return delegated.result;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      const callerRole = await getTeamMemberRole(db, teamId!, session.user.id);

      if (callerRole !== "owner") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only team owners can remove members",
        });
      }

      // Prevent removing the last owner
      const targetRole = await getTeamMemberRole(db, teamId!, input.userId);

      if (targetRole === "owner") {
        const teamMembers = await getTeamMembersByTeamId(db, teamId!);
        const totalOwners = teamMembers?.filter(
          (member) => member.role === "owner",
        ).length;

        if (totalOwners === 1) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Cannot remove the last team owner",
          });
        }
      }

      const result = await deleteTeamMember(db, {
        teamId: input.teamId,
        userId: input.userId,
      });

      try {
        await teamCache.invalidateForUser(input.userId, input.teamId);
      } catch {
        // Non-fatal — cache will expire naturally
      }

      return result;
    }),

  updateMember: protectedProcedure
    .input(updateTeamMemberSchema)
    .mutation(async ({ ctx: { db, session, teamId, accessToken }, input }) => {
      if (input.teamId !== teamId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this team",
        });
      }

      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateTeamUpdateMember(
          {
            userId: input.userId,
            teamId: input.teamId,
            role: input.role,
          },
          accessToken,
        );
        if (delegated.delegated) {
          return delegated.result;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      const callerRole = await getTeamMemberRole(db, teamId!, session.user.id);

      if (callerRole !== "owner") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only team owners can update member roles",
        });
      }

      // Prevent demoting the last owner to member
      if (input.role === "member") {
        const targetRole = await getTeamMemberRole(db, teamId!, input.userId);

        if (targetRole === "owner") {
          const teamMembers = await getTeamMembersByTeamId(db, teamId!);
          const totalOwners = teamMembers?.filter(
            (member) => member.role === "owner",
          ).length;

          if (totalOwners === 1) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "Cannot demote the last team owner",
            });
          }
        }
      }

      return updateTeamMember(db, input);
    }),

  teamInvites: protectedProcedure.query(async ({ ctx: { db, teamId, accessToken } }) => {
    if (shouldDelegateToReplacementBackend()) {
      const delegated = await tryDelegateTeamInvites(accessToken);
      if (delegated) {
        return delegated;
      }
      assertLegacyIdentityFallbackAllowed();
    }

    return getTeamInvites(db, teamId!);
  }),

  invitesByEmail: protectedProcedure.query(async ({ ctx: { db, session, accessToken } }) => {
    if (shouldDelegateToReplacementBackend()) {
      const delegated = await tryDelegateUserInvites(accessToken);
      if (delegated) {
        return delegated;
      }
      assertLegacyIdentityFallbackAllowed();
    }

    return getInvitesByEmail(db, session.user.email!);
  }),

  invite: protectedProcedure
    .input(inviteTeamMembersSchema)
    .mutation(async ({ ctx: { db, session, teamId, geo, accessToken }, input }) => {
      const invitedByEmail = session.user.email;
      if (!invitedByEmail) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Email is required to invite team members",
        });
      }

      const ip = geo.ip ?? "127.0.0.1";

      type InviteData = Awaited<ReturnType<typeof createTeamInvites>>;
      let data: InviteData | undefined;

      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateTeamCreateInvites(
          input.map((invite) => ({
            email: invite.email,
            role: invite.role,
          })),
          accessToken,
        );
        if (delegated.delegated) {
          data = delegated.result as InviteData;
        } else {
          assertLegacyIdentityFallbackAllowed();
          data = await createTeamInvites(db, {
            teamId: teamId!,
            invites: input.map((invite) => ({
              ...invite,
              invitedBy: session.user.id,
            })),
          });
        }
      } else {
        data = await createTeamInvites(db, {
          teamId: teamId!,
          invites: input.map((invite) => ({
            ...invite,
            invitedBy: session.user.id,
          })),
        });
      }

      const results = data?.results ?? [];
      const skippedInvites = data?.skippedInvites ?? [];

      const invites: InviteTeamMembersPayload["invites"] = results.flatMap(
        (invite) => {
          if (!invite?.email) {
            return [];
          }

          return [
            {
              email: invite.email,
              invitedByName: session.user.full_name ?? "",
              invitedByEmail,
              teamName: invite.team?.name ?? "",
            },
          ];
        },
      );

      // Only trigger email sending if there are valid invites
      if (invites.length > 0) {
        await tasks.trigger("invite-team-members", {
          teamId: teamId!,
          invites,
          ip,
          locale: "en",
        } satisfies InviteTeamMembersPayload);
      }

      // Return information about the invitation process
      return {
        sent: invites.length,
        skipped: skippedInvites.length,
        skippedInvites,
      };
    }),

  deleteInvite: protectedProcedure
    .input(deleteTeamInviteSchema)
    .mutation(async ({ ctx: { db, teamId, accessToken }, input }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateTeamDeleteInvite(
          input.id,
          accessToken,
        );
        if (delegated.delegated) {
          return delegated.result;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return deleteTeamInvite(db, {
        teamId: teamId!,
        id: input.id,
      });
    }),

  availablePlans: protectedProcedure.query(
    async ({ ctx: { db, teamId, accessToken } }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateAvailablePlans(accessToken);
        if (delegated.delegated) {
          return delegated.plans;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return getAvailablePlans(db, teamId!);
    },
  ),

  updateBaseCurrency: protectedProcedure
    .input(updateBaseCurrencySchema)
    .mutation(async ({ ctx: { teamId }, input }) => {
      return triggerJob(
        "update-base-currency",
        {
          teamId: teamId!,
          baseCurrency: input.baseCurrency,
        },
        "transactions",
      );
    }),

  exportAllData: protectedProcedure.mutation(
    async ({ ctx: { teamId, session } }) => {
      if (!teamId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Team not found",
        });
      }

      return triggerJob(
        "export-team-data",
        {
          teamId,
          userId: session.user.id,
          userEmail: session.user.email ?? undefined,
        },
        "transactions",
      );
    },
  ),

  /**
   * Get unified connection status for the team.
   * Returns raw connection data - presentation logic handled by client.
   */
  connectionStatus: protectedProcedure.query(
    async ({ ctx: { db, teamId, accessToken } }) => {
      if (!teamId) {
        return { bankConnections: [], inboxAccounts: [] };
      }

      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateTeamConnectionStatus(accessToken);
        if (delegated) {
          return delegated as {
            bankConnections: Array<{
              id: string;
              name: string;
              status: string | null;
              expiresAt: string | null;
              logoUrl: string | null;
            }>;
            inboxAccounts: Array<{
              id: string;
              email: string;
              status: string;
              provider: string;
            }>;
          };
        }
        assertLegacyIdentityFallbackAllowed();
      }

      // Fetch bank connections and inbox accounts in parallel
      const [bankConnections, inboxAccounts] = await Promise.all([
        getBankConnections(db, { teamId }),
        getInboxAccounts(db, teamId),
      ]);

      return {
        bankConnections: bankConnections.map((c) => ({
          id: c.id,
          name: c.name,
          status: c.status,
          expiresAt: c.expiresAt,
          logoUrl: c.logoUrl,
        })),
        inboxAccounts: inboxAccounts.map((a) => ({
          id: a.id,
          email: a.email,
          status: a.status,
          provider: a.provider,
        })),
      };
    },
  ),
});

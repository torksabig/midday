import { assertLegacyIdentityFallbackAllowed, tryDelegateOverviewSummary } from "@api/services/replacement-delegation";
import { createTRPCRouter, protectedProcedure } from "@api/trpc/init";
import { shouldDelegateToReplacementBackend } from "@midday/replacement-backend";
import { getOverviewSummary } from "@midday/db/queries";

export const overviewRouter = createTRPCRouter({
  summary: protectedProcedure.query(async ({ ctx: { db, teamId, accessToken } }) => {
    if (shouldDelegateToReplacementBackend()) {
      const delegated = await tryDelegateOverviewSummary(accessToken);
      if (delegated) {
        return delegated;
      }
      assertLegacyIdentityFallbackAllowed();
    }

    return getOverviewSummary(db, { teamId: teamId! });
  }),
});

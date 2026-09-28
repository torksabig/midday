import {
  createReportSchema,
  getAccountBalancesSchema,
  getBurnRateSchema,
  getChartDataByLinkIdSchema,
  getExpensesSchema,
  getProfitSchema,
  getReportByLinkIdSchema,
  getRevenueForecastSchema,
  getRevenueSchema,
  getRunwaySchema,
  getSpendingSchema,
  getTaxSummarySchema,
} from "@api/schemas/reports";
import {
  assertLegacyIdentityFallbackAllowed,
  tryDelegateReportsAccountBalances,
  tryDelegateReportsBurnRate,
  tryDelegateReportsExpense,
  tryDelegateReportsProfit,
  tryDelegateReportsRevenue,
  tryDelegateReportsRunway,
  tryDelegateReportsSpending,
  tryDelegateReportsTaxSummary,
  tryDelegateReportsRevenueForecast,
  tryDelegateReportsGetByLinkId,
  tryDelegateReportsGetChartDataByLinkId,
} from "@api/services/replacement-delegation";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@api/trpc/init";
import { shouldDelegateToReplacementBackend } from "@midday/replacement-backend";
import {
  InvalidReportTypeError,
  ReportExpiredError,
  ReportNotFoundError,
} from "@midday/db/errors";
import {
  createReport,
  getBurnRate,
  getCashBalance,
  getChartDataByLinkId,
  getExpenses,
  getReportByLinkId,
  getReports,
  getRevenueForecast,
  getRunway,
  getSpending,
  getTaxSummary,
} from "@midday/db/queries";
import { TRPCError } from "@trpc/server";

export const reportsRouter = createTRPCRouter({
  revenue: protectedProcedure
    .input(getRevenueSchema)
    .query(async ({ ctx: { db, teamId, accessToken }, input }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateReportsRevenue(
          {
            from: input.from,
            to: input.to,
            currency: input.currency,
            revenueType: input.revenueType,
          },
          accessToken,
        );
        if (delegated) {
          return delegated;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return getReports(db, {
        teamId: teamId!,
        from: input.from,
        to: input.to,
        currency: input.currency,
        type: "revenue",
        revenueType: input.revenueType,
      });
    }),

  profit: protectedProcedure
    .input(getProfitSchema)
    .query(async ({ ctx: { db, teamId, accessToken }, input }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateReportsProfit(
          {
            from: input.from,
            to: input.to,
            currency: input.currency,
            revenueType: input.revenueType,
          },
          accessToken,
        );
        if (delegated) {
          return delegated;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return getReports(db, {
        teamId: teamId!,
        from: input.from,
        to: input.to,
        currency: input.currency,
        type: "profit",
        revenueType: input.revenueType,
      });
    }),

  burnRate: protectedProcedure
    .input(getBurnRateSchema)
    .query(async ({ ctx: { db, teamId, accessToken }, input }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateReportsBurnRate(
          {
            from: input.from,
            to: input.to,
            currency: input.currency,
          },
          accessToken,
        );
        if (delegated) {
          return delegated;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return getBurnRate(db, {
        teamId: teamId!,
        from: input.from,
        to: input.to,
        currency: input.currency,
      });
    }),

  runway: protectedProcedure
    .input(getRunwaySchema)
    .query(async ({ ctx: { db, teamId, accessToken }, input }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateReportsRunway(
          input.currency,
          accessToken,
        );
        if (delegated) {
          return delegated;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return getRunway(db, {
        teamId: teamId!,
        currency: input.currency,
      });
    }),

  expense: protectedProcedure
    .input(getExpensesSchema)
    .query(async ({ ctx: { db, teamId, accessToken }, input }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateReportsExpense(
          {
            from: input.from,
            to: input.to,
            currency: input.currency,
          },
          accessToken,
        );
        if (delegated) {
          return delegated;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return getExpenses(db, {
        teamId: teamId!,
        from: input.from,
        to: input.to,
        currency: input.currency,
      });
    }),

  spending: protectedProcedure
    .input(getSpendingSchema)
    .query(async ({ ctx: { db, teamId, accessToken }, input }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateReportsSpending(
          {
            from: input.from,
            to: input.to,
            currency: input.currency,
          },
          accessToken,
        );
        if (delegated) {
          return delegated;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return getSpending(db, {
        teamId: teamId!,
        from: input.from,
        to: input.to,
        currency: input.currency,
      });
    }),

  taxSummary: protectedProcedure
    .input(getTaxSummarySchema)
    .query(async ({ ctx: { db, teamId, accessToken }, input }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateReportsTaxSummary(
          {
            from: input.from,
            to: input.to,
            currency: input.currency,
            type: input.type,
            categorySlug: input.categorySlug,
            taxType: input.taxType,
          },
          accessToken,
        );
        if (delegated) {
          return delegated;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return getTaxSummary(db, {
        teamId: teamId!,
        from: input.from,
        to: input.to,
        currency: input.currency,
        type: input.type,
        categorySlug: input.categorySlug,
        taxType: input.taxType,
      });
    }),

  revenueForecast: protectedProcedure
    .input(getRevenueForecastSchema)
    .query(async ({ ctx: { db, teamId, accessToken }, input }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateReportsRevenueForecast(
          {
            from: input.from,
            to: input.to,
            currency: input.currency,
            revenueType: input.revenueType,
            forecastMonths: input.forecastMonths,
          },
          accessToken,
        );
        if (delegated) {
          return delegated;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return getRevenueForecast(db, {
        teamId: teamId!,
        from: input.from,
        to: input.to,
        forecastMonths: input.forecastMonths,
        currency: input.currency,
        revenueType: input.revenueType,
      });
    }),

  getAccountBalances: protectedProcedure
    .input(getAccountBalancesSchema)
    .query(async ({ ctx: { db, teamId, accessToken }, input }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateReportsAccountBalances(
          input.currency,
          accessToken,
        );
        if (delegated) {
          return delegated;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      const accountBalances = await getCashBalance(db, {
        teamId: teamId!,
        currency: input.currency,
      });

      return {
        result: accountBalances,
      };
    }),

  create: protectedProcedure
    .input(createReportSchema)
    .mutation(async ({ ctx: { db, teamId, session }, input }) => {
      const result = await createReport(db, {
        type: input.type,
        from: input.from,
        to: input.to,
        currency: input.currency,
        teamId: teamId!,
        createdBy: session.user.id,
        expireAt: input.expireAt,
      });

      return {
        ...result,
        shortUrl: `${process.env.MIDDAY_DASHBOARD_URL}/r/${result?.linkId}`,
      };
    }),

  getByLinkId: publicProcedure
    .input(getReportByLinkIdSchema)
    .query(async ({ ctx: { db }, input }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateReportsGetByLinkId(input.linkId);
        if (delegated !== null) {
          return delegated;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return getReportByLinkId(db, input.linkId);
    }),

  getChartDataByLinkId: publicProcedure
    .input(getChartDataByLinkIdSchema)
    .query(async ({ ctx: { db }, input }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateReportsGetChartDataByLinkId(
          input.linkId,
        );
        if (delegated) {
          return delegated;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      try {
        return await getChartDataByLinkId(db, input.linkId);
      } catch (error: unknown) {
        if (error instanceof ReportNotFoundError) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: error.message,
          });
        }
        if (error instanceof ReportExpiredError) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: error.message,
          });
        }
        if (error instanceof InvalidReportTypeError) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.message,
          });
        }
        throw error;
      }
    }),
});

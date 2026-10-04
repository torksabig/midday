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
  assertNoLegacyFallback,
  tryDelegateReportCreate,
  tryDelegateReportsAccountBalances,
  tryDelegateReportsBurnRate,
  tryDelegateReportsExpense,
  tryDelegateReportsGetByLinkId,
  tryDelegateReportsGetChartDataByLinkId,
  tryDelegateReportsProfit,
  tryDelegateReportsRevenue,
  tryDelegateReportsRevenueForecast,
  tryDelegateReportsRunway,
  tryDelegateReportsSpending,
  tryDelegateReportsTaxSummary,
} from "@api/services/replacement-delegation";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@api/trpc/init";
import { TRPCError } from "@trpc/server";

/** Stage 4: dashboard uses Rust directly; keep AppRouter for queryKey/RouterOutputs only. */
export const reportsRouter = createTRPCRouter({
  revenue: protectedProcedure
    .input(getRevenueSchema)
    .query(async ({ ctx: { accessToken }, input }) => {
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
      return assertNoLegacyFallback("reports.revenue");
    }),

  profit: protectedProcedure
    .input(getProfitSchema)
    .query(async ({ ctx: { accessToken }, input }) => {
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
      return assertNoLegacyFallback("reports.profit");
    }),

  burnRate: protectedProcedure
    .input(getBurnRateSchema)
    .query(async ({ ctx: { accessToken }, input }) => {
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
      return assertNoLegacyFallback("reports.burnRate");
    }),

  runway: protectedProcedure
    .input(getRunwaySchema)
    .query(async ({ ctx: { accessToken }, input }) => {
      const delegated = await tryDelegateReportsRunway(
        input.currency,
        accessToken,
      );
      if (delegated) {
        return delegated;
      }
      return assertNoLegacyFallback("reports.runway");
    }),

  expense: protectedProcedure
    .input(getExpensesSchema)
    .query(async ({ ctx: { accessToken }, input }) => {
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
      return assertNoLegacyFallback("reports.expense");
    }),

  spending: protectedProcedure
    .input(getSpendingSchema)
    .query(async ({ ctx: { accessToken }, input }) => {
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
      return assertNoLegacyFallback("reports.spending");
    }),

  taxSummary: protectedProcedure
    .input(getTaxSummarySchema)
    .query(async ({ ctx: { accessToken }, input }) => {
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
      return assertNoLegacyFallback("reports.taxSummary");
    }),

  revenueForecast: protectedProcedure
    .input(getRevenueForecastSchema)
    .query(async ({ ctx: { accessToken }, input }) => {
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
      return assertNoLegacyFallback("reports.revenueForecast");
    }),

  getAccountBalances: protectedProcedure
    .input(getAccountBalancesSchema)
    .query(async ({ ctx: { accessToken }, input }) => {
      const delegated = await tryDelegateReportsAccountBalances(
        input.currency,
        accessToken,
      );
      if (delegated) {
        return delegated;
      }
      return assertNoLegacyFallback("reports.getAccountBalances");
    }),

  create: protectedProcedure
    .input(createReportSchema)
    .mutation(async ({ ctx: { accessToken }, input }) => {
      const delegated = await tryDelegateReportCreate(input, accessToken);
      if (delegated.delegated) {
        const result = delegated.report as {
          linkId?: string;
          [key: string]: unknown;
        };
        return {
          ...result,
          shortUrl: `${process.env.MIDDAY_DASHBOARD_URL}/r/${result?.linkId}`,
        };
      }
      return assertNoLegacyFallback("reports.create");
    }),

  getByLinkId: publicProcedure
    .input(getReportByLinkIdSchema)
    .query(async ({ input }) => {
      const delegated = await tryDelegateReportsGetByLinkId(input.linkId);
      if (delegated !== null) {
        return delegated;
      }
      return assertNoLegacyFallback("reports.getByLinkId");
    }),

  getChartDataByLinkId: publicProcedure
    .input(getChartDataByLinkIdSchema)
    .query(async ({ input }) => {
      try {
        const delegated = await tryDelegateReportsGetChartDataByLinkId(
          input.linkId,
        );
        if (delegated) {
          return delegated;
        }
        return assertNoLegacyFallback("reports.getChartDataByLinkId");
      } catch (error: unknown) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw error;
      }
    }),
});

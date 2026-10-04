import {
  assertNoLegacyFallback,
  tryDelegateInstitutionsGet,
  tryDelegateInstitutionGetById,
  tryDelegateInstitutionUpdateUsage,
} from "@api/services/replacement-delegation";
import { createTRPCRouter, protectedProcedure } from "@api/trpc/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const getInstitutionsSchema = z.object({
  q: z.string().optional(),
  countryCode: z.string(),
  limit: z.number().optional().default(50),
  excludeProviders: z
    .array(z.enum(["gocardless", "plaid", "teller", "enablebanking"]))
    .optional(),
});

const getInstitutionByIdSchema = z.object({
  id: z.string(),
});

const updateUsageSchema = z.object({ id: z.string() });

/** Stage 4: dashboard uses Rust directly; keep AppRouter for queryKey/RouterOutputs only. */
export const institutionsRouter = createTRPCRouter({
  get: protectedProcedure
    .input(getInstitutionsSchema)
    .query(async ({ input, ctx: { accessToken } }) => {
      try {
        const delegated = await tryDelegateInstitutionsGet(
          {
            countryCode: input.countryCode,
            q: input.q,
            limit: input.limit,
            excludeProviders: input.excludeProviders,
          },
          accessToken,
        );
        if (delegated) {
          return delegated;
        }
        return assertNoLegacyFallback("institutions.get");
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get institutions",
        });
      }
    }),

  getById: protectedProcedure
    .input(getInstitutionByIdSchema)
    .query(async ({ input, ctx: { accessToken } }) => {
      const delegated = await tryDelegateInstitutionGetById(
        input.id,
        accessToken,
      );
      if (delegated) {
        return delegated;
      }
      return assertNoLegacyFallback("institutions.getById");
    }),

  updateUsage: protectedProcedure
    .input(updateUsageSchema)
    .mutation(async ({ input, ctx: { accessToken } }) => {
      try {
        const delegated = await tryDelegateInstitutionUpdateUsage(
          input.id,
          accessToken,
        );
        if (delegated.delegated) {
          return delegated.result;
        }
        return assertNoLegacyFallback("institutions.updateUsage");
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update institution usage",
        });
      }
    }),
});

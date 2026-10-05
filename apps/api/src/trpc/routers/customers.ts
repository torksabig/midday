import {
  deleteCustomerSchema,
  enqueueEnrichCustomerSchema,
  enrichCustomerSchema,
  getCustomerByIdSchema,
  getCustomerByPortalIdSchema,
  getCustomerInvoiceSummarySchema,
  getCustomersSchema,
  getPortalInvoicesSchema,
  toggleCustomerPortalSchema,
  upsertCustomerSchema,
} from "@api/schemas/customers";
import {
  assertLegacyIdentityFallbackAllowed,
  tryDelegateCustomersGet,
  tryDelegateCustomersGetById,
  tryDelegateCustomerDelete,
  tryDelegateCustomerUpsert,
  tryDelegateCustomerInvoiceSummary,
  tryDelegateCustomerCancelEnrichment,
  tryDelegateCustomerClearEnrichment,
  tryDelegateCustomerStartEnrichment,
  tryDelegateTogglePortal,
  tryDelegatePortalCustomer,
  tryDelegatePortalInvoices,
} from "@api/services/replacement-delegation";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@api/trpc/init";
import { shouldDelegateToReplacementBackend } from "@midday/replacement-backend";
import {
  clearCustomerEnrichment,
  deleteCustomer,
  getCustomerById,
  getCustomerByPortalId,
  getCustomerInvoiceSummary,
  getCustomerPortalInvoices,
  getCustomers,
  toggleCustomerPortal,
  updateCustomerEnrichmentStatus,
  upsertCustomer,
} from "@midday/db/queries";
import { triggerJob } from "@midday/job-client";
import { createLoggerWithContext } from "@midday/logger";
import { TRPCError } from "@trpc/server";

const logger = createLoggerWithContext("trpc:customers");

export const customersRouter = createTRPCRouter({
  get: protectedProcedure
    .input(getCustomersSchema.optional())
    .query(async ({ ctx: { teamId, db, accessToken }, input }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateCustomersGet(
          {
            cursor: input?.cursor,
            pageSize: input?.pageSize,
            q: input?.q,
            sort: input?.sort,
          },
          accessToken,
        );
        if (delegated) {
          return delegated;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return getCustomers(db, {
        teamId: teamId!,
        ...input,
      });
    }),

  getById: protectedProcedure
    .input(getCustomerByIdSchema)
    .query(async ({ ctx: { db, teamId, accessToken }, input }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateCustomersGetById(
          input.id,
          accessToken,
        );
        if (delegated.delegated) {
          return delegated.customer ?? null;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return getCustomerById(db, {
        id: input.id,
        teamId: teamId!,
      });
    }),

  delete: protectedProcedure
    .input(deleteCustomerSchema)
    .mutation(async ({ ctx: { db, teamId, accessToken }, input }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateCustomerDelete(
          input.id,
          accessToken,
        );
        if (delegated.delegated) {
          if (delegated.customer == null) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Customer not found",
            });
          }
          return delegated.customer;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return deleteCustomer(db, {
        id: input.id,
        teamId: teamId!,
      });
    }),

  upsert: protectedProcedure
    .input(upsertCustomerSchema)
    .mutation(async ({ ctx: { db, teamId, session, accessToken }, input }) => {
      const isNewCustomer = !input.id;

      let customer: Awaited<ReturnType<typeof upsertCustomer>>;

      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateCustomerUpsert(
          {
            id: input.id,
            name: input.name,
            email: input.email,
            billingEmail: input.billingEmail,
            country: input.country,
            addressLine1: input.addressLine1,
            addressLine2: input.addressLine2,
            city: input.city,
            state: input.state,
            zip: input.zip,
            note: input.note,
            website: input.website,
            phone: input.phone,
            contact: input.contact,
            vatNumber: input.vatNumber,
            countryCode: input.countryCode,
            tags: input.tags,
          },
          accessToken,
        );
        if (delegated.delegated) {
          customer = delegated.customer as Awaited<
            ReturnType<typeof upsertCustomer>
          >;
        } else {
          assertLegacyIdentityFallbackAllowed();
          customer = await upsertCustomer(db, {
            ...input,
            teamId: teamId!,
            userId: session.user.id,
          });
        }
      } else {
        customer = await upsertCustomer(db, {
          ...input,
          teamId: teamId!,
          userId: session.user.id,
        });
      }

      // Auto-trigger enrichment for new customers with a website or email
      // (job queue stays in Node — Rust path is DB-only)
      if (
        isNewCustomer &&
        (customer?.website || customer?.email) &&
        customer?.id
      ) {
        try {
          await updateCustomerEnrichmentStatus(db, {
            customerId: customer.id,
            status: "pending",
          });

          await triggerJob(
            "enrich-customer",
            {
              customerId: customer.id,
              teamId: teamId!,
            },
            "customers",
            { attempts: 1 },
          );
        } catch (error) {
          logger.error("Failed to trigger customer enrichment", {
            error: error instanceof Error ? error.message : String(error),
          });
          await updateCustomerEnrichmentStatus(db, {
            customerId: customer.id,
            status: null,
          }).catch(() => {});
        }
      }

      return customer;
    }),

  getInvoiceSummary: protectedProcedure
    .input(getCustomerInvoiceSummarySchema)
    .query(async ({ ctx: { db, teamId, accessToken }, input }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateCustomerInvoiceSummary(
          input.id,
          accessToken,
        );
        if (delegated.delegated) {
          return delegated.summary;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return getCustomerInvoiceSummary(db, {
        customerId: input.id,
        teamId: teamId!,
      });
    }),

  enrich: protectedProcedure
    .input(enrichCustomerSchema)
    .mutation(async ({ ctx: { db, teamId, accessToken }, input }) => {
      let customerId = input.id;
      let delegatedSql = false;

      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateCustomerStartEnrichment(
          input.id,
          accessToken,
        );
        if (delegated.delegated) {
          delegatedSql = true;
        } else {
          assertLegacyIdentityFallbackAllowed();
        }
      }

      if (!delegatedSql) {
        const customer = await getCustomerById(db, {
          id: input.id,
          teamId: teamId!,
        });

        if (!customer) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Customer not found",
          });
        }

        if (!customer.website && !customer.email) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "Customer has no website or email - enrichment requires at least one",
          });
        }

        customerId = customer.id;

        await updateCustomerEnrichmentStatus(db, {
          customerId: customer.id,
          status: "pending",
        });
      }

      await triggerJob(
        "enrich-customer",
        {
          customerId,
          teamId: teamId!,
        },
        "customers",
        { attempts: 1 },
      );

      return { queued: true };
    }),

  /** Trigger-only half after dashboard Rust `POST /api/v1/customers/{id}/start-enrichment`. */
  enqueueEnrichCustomer: protectedProcedure
    .input(enqueueEnrichCustomerSchema)
    .mutation(async ({ ctx: { teamId }, input }) => {
      await triggerJob(
        "enrich-customer",
        {
          customerId: input.id,
          teamId: teamId!,
        },
        "customers",
        { attempts: 1 },
      );

      return { queued: true as const };
    }),

  cancelEnrichment: protectedProcedure
    .input(enrichCustomerSchema)
    .mutation(async ({ ctx: { db, teamId, accessToken }, input }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateCustomerCancelEnrichment(
          input.id,
          accessToken,
        );
        if (delegated.delegated) {
          return { cancelled: true };
        }
        assertLegacyIdentityFallbackAllowed();
      }

      const customer = await getCustomerById(db, {
        id: input.id,
        teamId: teamId!,
      });

      if (!customer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Customer not found",
        });
      }

      // Reset status to null (no enrichment in progress)
      // The job may still complete in background but UI won't show as processing
      await updateCustomerEnrichmentStatus(db, {
        customerId: customer.id,
        status: null,
      });

      return { cancelled: true };
    }),

  clearEnrichment: protectedProcedure
    .input(enrichCustomerSchema)
    .mutation(async ({ ctx: { db, teamId, accessToken }, input }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateCustomerClearEnrichment(
          input.id,
          accessToken,
        );
        if (delegated.delegated) {
          return { cleared: true };
        }
        assertLegacyIdentityFallbackAllowed();
      }

      const customer = await getCustomerById(db, {
        id: input.id,
        teamId: teamId!,
      });

      if (!customer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Customer not found",
        });
      }

      await clearCustomerEnrichment(db, {
        customerId: customer.id,
        teamId: teamId!,
      });

      return { cleared: true };
    }),

  togglePortal: protectedProcedure
    .input(toggleCustomerPortalSchema)
    .mutation(async ({ ctx: { db, teamId, accessToken }, input }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateTogglePortal(
          {
            customerId: input.customerId,
            enabled: input.enabled,
          },
          accessToken,
        );
        if (delegated.delegated) {
          return delegated.result;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return toggleCustomerPortal(db, {
        customerId: input.customerId,
        teamId: teamId!,
        enabled: input.enabled,
      });
    }),

  getByPortalId: publicProcedure
    .input(getCustomerByPortalIdSchema)
    .query(async ({ ctx: { db }, input }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegatePortalCustomer(input.portalId);
        if (delegated.delegated) {
          return delegated.result;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      const customer = await getCustomerByPortalId(db, {
        portalId: input.portalId,
      });

      if (!customer) {
        return null;
      }

      // Get invoice summary
      const summary = await getCustomerInvoiceSummary(db, {
        customerId: customer.id,
        teamId: customer.teamId,
      });

      return {
        customer,
        summary,
      };
    }),

  getPortalInvoices: publicProcedure
    .input(getPortalInvoicesSchema)
    .query(async ({ ctx: { db }, input }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegatePortalInvoices(input.portalId, {
          cursor: input.cursor,
          pageSize: input.pageSize,
        });
        if (delegated.delegated) {
          return delegated.result;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      const customer = await getCustomerByPortalId(db, {
        portalId: input.portalId,
      });

      if (!customer) {
        return { data: [], meta: { cursor: null } };
      }

      const result = await getCustomerPortalInvoices(db, {
        customerId: customer.id,
        teamId: customer.teamId,
        cursor: input.cursor,
        pageSize: input.pageSize,
      });

      return {
        data: result.data,
        meta: {
          cursor: result.nextCursor,
        },
      };
    }),
});

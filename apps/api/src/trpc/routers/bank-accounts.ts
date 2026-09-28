import {
  createBankAccountSchema,
  deleteBankAccountSchema,
  getBankAccountDetailsSchema,
  getBankAccountsSchema,
  getTransactionCountSchema,
  updateBankAccountSchema,
} from "@api/schemas/bank-accounts";
import {
  assertLegacyIdentityFallbackAllowed,
  tryDelegateBankAccountsBalances,
  tryDelegateBankAccountsCurrencies,
  tryDelegateBankAccountsGet,
  tryDelegateBankAccountsGetTransactionCount,
  tryDelegateBankAccountCreate,
  tryDelegateBankAccountUpdate,
  tryDelegateBankAccountDelete,
} from "@api/services/replacement-delegation";
import { createTRPCRouter, protectedProcedure } from "@api/trpc/init";
import { shouldDelegateToReplacementBackend } from "@midday/replacement-backend";

import {
  createBankAccount,
  deleteBankAccount,
  getBankAccountDetails,
  getBankAccounts,
  getBankAccountsBalances,
  getBankAccountsCurrencies,
  getBankAccountsWithPaymentInfo,
  getTransactionCountByBankAccountId,
  updateBankAccount,
} from "@midday/db/queries";

export const bankAccountsRouter = createTRPCRouter({
  get: protectedProcedure
    .input(getBankAccountsSchema.optional())
    .query(async ({ input, ctx: { db, teamId, accessToken } }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateBankAccountsGet(
          {
            enabled: input?.enabled,
            manual: input?.manual,
          },
          accessToken,
        );
        if (delegated) {
          return delegated;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return getBankAccounts(db, {
        teamId: teamId!,
        enabled: input?.enabled,
        manual: input?.manual,
      });
    }),

  getTransactionCount: protectedProcedure
    .input(getTransactionCountSchema)
    .query(async ({ input, ctx: { db, teamId, accessToken } }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateBankAccountsGetTransactionCount(
          input.id,
          accessToken,
        );
        if (delegated) {
          return delegated;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      const count = await getTransactionCountByBankAccountId(db, {
        bankAccountId: input.id,
        teamId: teamId!,
      });
      return { count };
    }),

  /**
   * Get decrypted account details (IBAN, account number, etc.)
   * Only call this when user explicitly requests to reveal account details.
   */
  getDetails: protectedProcedure
    .input(getBankAccountDetailsSchema)
    .query(async ({ input, ctx: { db, teamId } }) => {
      return getBankAccountDetails(db, {
        accountId: input.id,
        teamId: teamId!,
      });
    }),

  /**
   * Get bank accounts with payment info (IBAN, routing numbers, etc.)
   * Used for invoice payment details slash command.
   * Only returns accounts that have at least one payment field populated.
   */
  getWithPaymentInfo: protectedProcedure.query(
    async ({ ctx: { db, teamId } }) => {
      return getBankAccountsWithPaymentInfo(db, {
        teamId: teamId!,
      });
    },
  ),

  currencies: protectedProcedure.query(
    async ({ ctx: { db, teamId, accessToken } }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateBankAccountsCurrencies(accessToken);
        if (delegated) {
          return delegated;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return getBankAccountsCurrencies(db, teamId!);
    },
  ),

  balances: protectedProcedure.query(
    async ({ ctx: { db, teamId, accessToken } }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateBankAccountsBalances(accessToken);
        if (delegated) {
          return delegated;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return getBankAccountsBalances(db, teamId!);
    },
  ),

  delete: protectedProcedure
    .input(deleteBankAccountSchema)
    .mutation(async ({ input, ctx: { db, teamId, accessToken } }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateBankAccountDelete(
          input.id,
          accessToken,
        );
        if (delegated.delegated) {
          return delegated.account;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      const result = await deleteBankAccount(db, {
        id: input.id,
        teamId: teamId!,
      });

      return result;
    }),

  update: protectedProcedure
    .input(updateBankAccountSchema)
    .mutation(async ({ input, ctx: { db, teamId, accessToken } }) => {
      if (shouldDelegateToReplacementBackend()) {
        const { id, ...rest } = input;
        const delegated = await tryDelegateBankAccountUpdate(
          id!,
          rest,
          accessToken,
        );
        if (delegated.delegated) {
          return delegated.account;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      return updateBankAccount(db, {
        ...input,
        id: input.id!,
        teamId: teamId!,
      });
    }),

  create: protectedProcedure
    .input(createBankAccountSchema)
    .mutation(async ({ input, ctx: { db, teamId, session, accessToken } }) => {
      if (shouldDelegateToReplacementBackend()) {
        const delegated = await tryDelegateBankAccountCreate(
          {
            name: input.name,
            currency: input.currency,
            manual: input.manual,
          },
          accessToken,
        );
        if (delegated.delegated) {
          return delegated.account;
        }
        assertLegacyIdentityFallbackAllowed();
      }

      const result = await createBankAccount(db, {
        ...input,
        teamId: teamId!,
        userId: session.user.id,
        manual: input.manual,
      });

      return result;
    }),
});

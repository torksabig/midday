import { transformTransaction } from "@jobs/utils/transform";
import {
  bankSyncDelegationTarget,
  postUpsertTransactions,
  type BankUpsertTransactionRow,
} from "@jobs/utils/bank-sync-delegate";
import { createClient } from "@midday/supabase/job";
import { logger, schemaTask, tasks } from "@trigger.dev/sdk";
import { z } from "zod";
import { enrichTransactions } from "../../transactions/enrich-transaction";

const transactionSchema = z.object({
  id: z.string(),
  description: z.string().nullable(),
  method: z.string().nullable(),
  date: z.string(),
  name: z.string(),
  status: z.enum(["pending", "posted"]),
  counterparty_name: z.string().nullable(),
  merchant_name: z.string().nullable(),
  balance: z.number().nullable(),
  currency: z.string(),
  amount: z.number(),
  category: z.string().nullable(),
});

export const upsertTransactions = schemaTask({
  id: "upsert-transactions",
  maxDuration: 120,
  queue: {
    concurrencyLimit: 10,
  },
  schema: z.object({
    teamId: z.string().uuid(),
    bankAccountId: z.string().uuid(),
    manualSync: z.boolean().optional(),
    transactions: z.array(transactionSchema),
  }),
  run: async ({ transactions, teamId, bankAccountId, manualSync }) => {
    const supabase = createClient();

    try {
      // Transform transactions to match our DB schema
      const formattedTransactions = transactions.map((transaction) => {
        return transformTransaction({
          // @ts-expect-error - TODO: Fix types with drizzle
          transaction,
          teamId,
          bankAccountId,
          notified: manualSync,
        });
      });

      let transactionIds: string[] = [];
      let usedRust = false;

      const target = bankSyncDelegationTarget("upsert-transactions");
      if (target) {
        const rows: BankUpsertTransactionRow[] = formattedTransactions.map(
          (tx) => ({
            name: tx.name,
            date: tx.date,
            amount: tx.amount,
            currency: tx.currency,
            teamId: tx.team_id,
            bankAccountId: tx.bank_account_id,
            internalId: tx.internal_id,
            method: tx.method,
            status: tx.status,
            categorySlug: tx.category_slug,
            description: tx.description,
            balance: tx.balance,
            counterpartyName: tx.counterparty_name,
            merchantName: tx.merchant_name,
            ...(tx.notified !== undefined ? { notified: tx.notified } : {}),
          }),
        );

        try {
          const body = await postUpsertTransactions(
            { teamId, bankAccountId, transactions: rows },
            target,
          );
          transactionIds = body.transactions.map((row) => row.id);
          usedRust = true;
        } catch (error) {
          if (target.mode === "replacement") {
            throw error;
          }
          logger.warn(
            "upsert-transactions rust failed; falling back to supabase",
            {
              error: error instanceof Error ? error.message : "unknown",
            },
          );
        }
      }

      if (!usedRust) {
        // Upsert transactions into the transactions table, skipping duplicates based on internal_id
        const { data: upsertedTransactions } = await supabase
          .from("transactions")
          // @ts-expect-error - TODO: Fix types with drizzle
          .upsert(formattedTransactions, {
            onConflict: "internal_id",
            ignoreDuplicates: true,
          })
          .select("id")
          .throwOnError();

        transactionIds = upsertedTransactions?.map((tx) => tx.id) || [];
      }

      if (transactionIds.length > 0) {
        await enrichTransactions.trigger({
          transactionIds,
          teamId,
        });

        await tasks.trigger("match-transactions-bidirectional", {
          teamId,
          newTransactionIds: transactionIds,
        });

        logger.info("Triggered enrichment and matching", {
          transactionCount: transactionIds.length,
          teamId,
        });
      }
    } catch (error) {
      logger.error("Failed to upsert transactions", { error });

      throw error;
    }
  },
});

import {
  type ApiAccount,
  type DbAccount,
  findMatchingAccount,
  type MatchingResult,
} from "@midday/supabase/account-matching";
import {
  bankSyncDelegationTarget,
  postRemapBankAccountIds,
} from "@jobs/utils/bank-sync-delegate";
import { createClient } from "@midday/supabase/job";
import { logger } from "@trigger.dev/sdk";

// Re-export types for convenience
export type { ApiAccount, DbAccount, MatchingResult };
export { findMatchingAccount };

/**
 * Matches API accounts to existing database accounts and updates their account_id.
 *
 * Uses findMatchingAccount from @midday/supabase for the pure matching logic,
 * then handles the database updates and logging.
 */
export async function matchAndUpdateAccountIds({
  existingAccounts,
  apiAccounts,
  connectionId,
  provider,
  teamId,
}: {
  existingAccounts: DbAccount[];
  apiAccounts: ApiAccount[];
  connectionId: string;
  provider: string;
  teamId?: string;
}): Promise<MatchingResult> {
  const supabase = createClient();
  const matchedDbIds = new Set<string>();
  const results: MatchingResult = { matched: 0, unmatched: 0, errors: 0 };

  const pendingUpdates: Array<{
    id: string;
    accountId: string;
    accountReference?: string | null;
    iban?: string | null;
  }> = [];

  for (const apiAccount of apiAccounts) {
    const match = findMatchingAccount(
      apiAccount,
      existingAccounts,
      matchedDbIds,
    );

    if (match) {
      matchedDbIds.add(match.id);

      const updates: {
        id: string;
        accountId: string;
        accountReference?: string | null;
        iban?: string | null;
      } = {
        id: match.id,
        accountId: apiAccount.id,
      };
      if (apiAccount.resource_id) {
        updates.accountReference = apiAccount.resource_id;
      }
      if (apiAccount.iban) {
        updates.iban = apiAccount.iban;
      }

      pendingUpdates.push(updates);
    } else {
      logger.warn(`No matching DB account found for ${provider} account`, {
        resource_id: apiAccount.resource_id,
        iban: apiAccount.iban,
        type: apiAccount.type,
        currency: apiAccount.currency,
        name: apiAccount.name,
      });
      results.unmatched++;
    }
  }

  let usedRust = false;
  if (pendingUpdates.length > 0 && teamId) {
    const target = bankSyncDelegationTarget("remap-bank-account-ids");
    if (target) {
      try {
        const body = await postRemapBankAccountIds(
          {
            connectionId,
            teamId,
            updates: pendingUpdates,
          },
          target,
        );
        results.matched = body.matched;
        results.errors = body.errors;
        usedRust = true;
      } catch (error) {
        if (target.mode === "replacement") {
          throw error;
        }
        logger.warn(
          "remap-bank-account-ids rust failed; falling back to supabase",
          {
            error: error instanceof Error ? error.message : "unknown",
          },
        );
      }
    }
  }

  if (!usedRust) {
    for (const update of pendingUpdates) {
      const supabaseUpdates: Record<string, string | null> = {
        account_id: update.accountId,
      };
      if (update.accountReference) {
        supabaseUpdates.account_reference = update.accountReference;
      }
      if (update.iban) {
        supabaseUpdates.iban = update.iban;
      }

      const { error } = await supabase
        .from("bank_accounts")
        .update(supabaseUpdates)
        .eq("id", update.id);

      if (error) {
        logger.warn(`Failed to update ${provider} account`, {
          resource_id: update.accountReference,
          dbAccountId: update.id,
          error: error.message,
        });
        results.errors++;
      } else {
        results.matched++;
      }
    }
  }

  logger.info(`Account matching complete for ${provider}`, {
    connectionId,
    ...results,
    totalApiAccounts: apiAccounts.length,
    totalDbAccounts: existingAccounts.length,
  });

  // Warn if some existing DB accounts were not matched to any API account
  // This could indicate accounts were removed at the bank or data mismatch
  if (results.matched < existingAccounts.length) {
    logger.warn("Some existing accounts were not matched", {
      connectionId,
      provider,
      existingCount: existingAccounts.length,
      matchedCount: results.matched,
      unmatchedDbAccounts: existingAccounts.length - results.matched,
    });
  }

  return results;
}

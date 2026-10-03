import type { RouterOutputs } from "@api/trpc/routers/_app";
import type { components } from "./openapi.generated";
import { RustApiError } from "./overview";

type RawInboxAccountListItem = components["schemas"]["InboxAccountListItem"];

export type InboxAccount = NonNullable<
  RouterOutputs["inboxAccounts"]["get"]
>[number];

export function normalizeInboxAccounts(
  payload: RawInboxAccountListItem[],
): InboxAccount[] {
  return (payload ?? []).map((row) => ({
    id: row.id,
    email: row.email,
    provider: row.provider,
    lastAccessed: row.lastAccessed ?? null,
    status: row.status ?? null,
    errorMessage: row.errorMessage ?? null,
  })) as InboxAccount[];
}

export async function fetchInboxAccounts(
  baseUrl: string,
  accessToken: string | null,
): Promise<InboxAccount[]> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(`${baseUrl}/api/v1/inbox-accounts`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return normalizeInboxAccounts(
    (await response.json()) as RawInboxAccountListItem[],
  );
}

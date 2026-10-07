import type { components } from "./openapi.generated";
import type { InboxAccount } from "./delegated-trpc-shapes";
import { RustApiError } from "./overview";

type RawInboxAccountListItem = components["schemas"]["InboxAccountListItem"];

export type { InboxAccount } from "./delegated-trpc-shapes";

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

export type DeleteInboxAccountResult = {
  id: string;
  scheduleId: string | null;
};

export async function deleteInboxAccount(
  baseUrl: string,
  accessToken: string | null,
  id: string,
): Promise<DeleteInboxAccountResult | null> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(
    `${baseUrl}/api/v1/inbox-accounts/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(8_000),
    },
  );

  if (response.status === 404) return null;

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  const payload = (await response.json()) as {
    id?: string;
    scheduleId?: string | null;
  };
  if (typeof payload?.id !== "string") {
    throw new RustApiError(500, "Inbox account delete payload missing id");
  }
  return { id: payload.id, scheduleId: payload.scheduleId ?? null };
}

export async function fetchInboxAccountById(
  baseUrl: string,
  accessToken: string | null,
  id: string,
): Promise<InboxAccount | null> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(
    `${baseUrl}/api/v1/inbox-accounts/${encodeURIComponent(id)}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(8_000),
    },
  );

  if (response.status === 404) return null;

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  const row = (await response.json()) as RawInboxAccountListItem;
  return normalizeInboxAccounts([row])[0] ?? null;
}

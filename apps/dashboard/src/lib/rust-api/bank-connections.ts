import type { components } from "./openapi.generated";
import { RustApiError } from "./overview";

type RawBankConnection = components["schemas"]["BankConnectionListItem"];
type RawBankConnectionAccount = components["schemas"]["BankConnectionAccount"];
type RawReconnectResponse =
  components["schemas"]["BankConnectionReconnectResponse"];
type RawDeleteResponse =
  components["schemas"]["BankConnectionDeleteResponse"];

export type BankConnectionsListParams = {
  enabled?: boolean;
};

export type BankConnectionAccount = {
  id: string;
  accountId: string;
  name: string | null;
  enabled: boolean;
  manual: boolean | null;
  currency: string | null;
  balance: number | null;
  type: string | null;
  errorRetries: number | null;
  subtype: string | null;
  bic: string | null;
  routingNumber: string | null;
  wireRoutingNumber: string | null;
  sortCode: string | null;
  availableBalance: number | null;
  creditLimit: number | null;
};

export type BankConnectionListItem = {
  id: string;
  name: string;
  logoUrl: string | null;
  provider: string;
  expiresAt: string | null;
  enrollmentId: string | null;
  institutionId: string;
  referenceId: string | null;
  lastAccessed: string | null;
  status: string | null;
  accessToken: null;
  bankAccounts: BankConnectionAccount[];
};

export type ReconnectBankConnectionInput = {
  referenceId: string;
  newReferenceId: string;
  expiresAt?: string | null;
};

export type ReconnectBankConnectionResult = {
  id: string;
};

export type DeleteBankConnectionResult = {
  referenceId: string | null;
  provider: string | null;
  accessToken: string | null;
};

export function normalizeBankConnectionAccount(
  account: RawBankConnectionAccount,
): BankConnectionAccount {
  return {
    id: account.id,
    accountId: account.account_id,
    name: account.name ?? null,
    enabled: account.enabled,
    manual: account.manual ?? null,
    currency: account.currency ?? null,
    balance: account.balance ?? null,
    type: account.type ?? null,
    errorRetries: account.error_retries ?? null,
    subtype: account.subtype ?? null,
    bic: account.bic ?? null,
    routingNumber: account.routing_number ?? null,
    wireRoutingNumber: account.wire_routing_number ?? null,
    sortCode: account.sort_code ?? null,
    availableBalance: account.available_balance ?? null,
    creditLimit: account.credit_limit ?? null,
  };
}

export function normalizeBankConnection(
  connection: RawBankConnection,
): BankConnectionListItem {
  return {
    id: connection.id,
    name: connection.name,
    logoUrl: connection.logo_url ?? null,
    provider: connection.provider,
    expiresAt: connection.expires_at ?? null,
    enrollmentId: connection.enrollment_id ?? null,
    institutionId: connection.institution_id,
    referenceId: connection.reference_id ?? null,
    lastAccessed: connection.last_accessed ?? null,
    status: connection.status ?? null,
    accessToken: null,
    bankAccounts: (connection.bank_accounts ?? []).map(
      normalizeBankConnectionAccount,
    ),
  };
}

function buildBankConnectionsQuery(params: BankConnectionsListParams = {}) {
  const search = new URLSearchParams();
  if (params.enabled != null) search.set("enabled", String(params.enabled));
  const query = search.toString();
  return query ? `?${query}` : "";
}

export async function fetchBankConnections(
  baseUrl: string,
  accessToken: string | null,
  params: BankConnectionsListParams = {},
): Promise<BankConnectionListItem[]> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(
    `${baseUrl}/api/v1/bank-connections${buildBankConnectionsQuery(params)}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(8_000),
    },
  );

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  const payload = (await response.json()) as RawBankConnection[];
  return payload.map(normalizeBankConnection);
}

export async function reconnectBankConnection(
  baseUrl: string,
  accessToken: string | null,
  input: ReconnectBankConnectionInput,
): Promise<ReconnectBankConnectionResult> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(`${baseUrl}/api/v1/bank-connections/reconnect`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      referenceId: input.referenceId,
      newReferenceId: input.newReferenceId,
      ...(input.expiresAt !== undefined ? { expiresAt: input.expiresAt } : {}),
    }),
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  const payload = (await response.json()) as RawReconnectResponse;
  return { id: payload.id };
}

export async function deleteBankConnection(
  baseUrl: string,
  accessToken: string | null,
  id: string,
): Promise<DeleteBankConnectionResult | null> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(
    `${baseUrl}/api/v1/bank-connections/${encodeURIComponent(id)}`,
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

  const payload = (await response.json()) as RawDeleteResponse;
  return {
    referenceId: payload.referenceId ?? null,
    provider: payload.provider ?? null,
    accessToken: payload.accessToken ?? null,
  };
}

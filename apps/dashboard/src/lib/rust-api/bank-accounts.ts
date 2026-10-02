import type { components } from "./openapi.generated";
import { RustApiError } from "./overview";

type RawBankAccount = components["schemas"]["MiddayBankAccount"];
type RawBankConnection = components["schemas"]["MiddayBankConnection"];

export type BankAccountsListParams = {
  enabled?: boolean;
  manual?: boolean;
};

export type BankConnection = {
  id: string;
  createdAt: string;
  institutionId: string;
  expiresAt: string | null;
  teamId: string;
  name: string;
  logoUrl: string | null;
  enrollmentId: string | null;
  provider: string;
  lastAccessed: string | null;
  referenceId: string | null;
  status: string | null;
  errorDetails: string | null;
  errorRetries: number | null;
  accessToken: null;
};

export type BankAccount = {
  id: string;
  createdAt: string;
  createdBy: string;
  teamId: string;
  name: string | null;
  currency: string | null;
  bankConnectionId: string | null;
  enabled: boolean;
  accountId: string;
  balance: number | null;
  manual: boolean | null;
  type: string | null;
  baseCurrency: string | null;
  baseBalance: number | null;
  errorDetails: string | null;
  errorRetries: number | null;
  accountReference: string | null;
  subtype: string | null;
  bic: string | null;
  routingNumber: string | null;
  wireRoutingNumber: string | null;
  sortCode: string | null;
  availableBalance: number | null;
  creditLimit: number | null;
  bankConnection: BankConnection | null;
};

function normalizeBankConnection(
  connection: RawBankConnection | null | undefined,
): BankConnection | null {
  if (!connection) return null;

  return {
    id: connection.id,
    createdAt: connection.created_at,
    institutionId: connection.institution_id,
    expiresAt: connection.expires_at ?? null,
    teamId: connection.team_id,
    name: connection.name,
    logoUrl: connection.logo_url ?? null,
    enrollmentId: connection.enrollment_id ?? null,
    provider: connection.provider,
    lastAccessed: connection.last_accessed ?? null,
    referenceId: connection.reference_id ?? null,
    status: connection.status ?? null,
    errorDetails: connection.error_details ?? null,
    errorRetries: connection.error_retries ?? null,
    accessToken: null,
  };
}

function normalizeBankAccount(account: RawBankAccount): BankAccount {
  return {
    id: account.id,
    createdAt: account.created_at,
    createdBy: account.created_by,
    teamId: account.team_id,
    name: account.name ?? null,
    currency: account.currency ?? null,
    bankConnectionId: account.bank_connection_id ?? null,
    enabled: account.enabled,
    accountId: account.account_id,
    balance: account.balance ?? null,
    manual: account.manual ?? null,
    type: account.type ?? null,
    baseCurrency: account.base_currency ?? null,
    baseBalance: account.base_balance ?? null,
    errorDetails: account.error_details ?? null,
    errorRetries: account.error_retries ?? null,
    accountReference: account.account_reference ?? null,
    subtype: account.subtype ?? null,
    bic: account.bic ?? null,
    routingNumber: account.routing_number ?? null,
    wireRoutingNumber: account.wire_routing_number ?? null,
    sortCode: account.sort_code ?? null,
    availableBalance: account.available_balance ?? null,
    creditLimit: account.credit_limit ?? null,
    bankConnection: normalizeBankConnection(account.bank_connection),
  };
}

function buildBankAccountsQuery(params: BankAccountsListParams = {}) {
  const search = new URLSearchParams();

  if (params.enabled != null) search.set("enabled", String(params.enabled));
  if (params.manual != null) search.set("manual", String(params.manual));

  const query = search.toString();
  return query ? `?${query}` : "";
}

export async function fetchBankAccounts(
  baseUrl: string,
  accessToken: string | null,
  params: BankAccountsListParams = {},
): Promise<BankAccount[]> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(
    `${baseUrl}/api/v1/bank-accounts${buildBankAccountsQuery(params)}`,
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

  const payload = (await response.json()) as RawBankAccount[];
  return payload.map(normalizeBankAccount);
}

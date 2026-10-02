import type { components } from "./openapi.generated";
import { RustApiError } from "./overview";

type RawBankAccount = components["schemas"]["MiddayBankAccount"];
type RawBankConnection = components["schemas"]["MiddayBankConnection"];
type RawBankAccountMutation =
  components["schemas"]["BankAccountMutationResponse"];
type RawBankAccountCurrency =
  components["schemas"]["BankAccountCurrencyRow"];
type RawBankAccountTransactionCount =
  components["schemas"]["BankAccountTransactionCountResponse"];

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

export type BankAccountMutationResult = {
  id: string;
  createdAt: string;
  createdBy: string;
  teamId: string;
  name: string | null;
  currency: string | null;
  balance: number | null;
  enabled: boolean | null;
  accountId: string | null;
  bankConnectionId: string | null;
  type: string | null;
  manual: boolean | null;
  baseBalance: number | null;
  baseCurrency: string | null;
  errorRetries: number | null;
};

export type CreateBankAccountInput = {
  name: string;
  currency?: string | null;
  manual?: boolean | null;
};

export type UpdateBankAccountInput = {
  id: string;
  name?: string | null;
  type?: string | null;
  balance?: number | null;
  enabled?: boolean | null;
  currency?: string | null;
  baseBalance?: number | null;
  baseCurrency?: string | null;
};

export type DeleteBankAccountInput = {
  id: string;
};

export type BankAccountCurrency = {
  currency: string;
};

export type BankAccountTransactionCount = {
  count: number;
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

function normalizeBankAccountMutation(
  account: RawBankAccountMutation,
): BankAccountMutationResult {
  return {
    id: account.id,
    createdAt: account.createdAt,
    createdBy: account.createdBy,
    teamId: account.teamId,
    name: account.name ?? null,
    currency: account.currency ?? null,
    balance: account.balance ?? null,
    enabled: account.enabled ?? null,
    accountId: account.accountId ?? null,
    bankConnectionId: account.bankConnectionId ?? null,
    type: account.type ?? null,
    manual: account.manual ?? null,
    baseBalance: account.baseBalance ?? null,
    baseCurrency: account.baseCurrency ?? null,
    errorRetries: account.errorRetries ?? null,
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

export async function fetchBankAccountCurrencies(
  baseUrl: string,
  accessToken: string | null,
): Promise<BankAccountCurrency[]> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(`${baseUrl}/api/v1/bank-accounts/currencies`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  const payload = (await response.json()) as RawBankAccountCurrency[];
  return payload.map((row) => ({ currency: row.currency }));
}

export async function fetchBankAccountTransactionCount(
  baseUrl: string,
  accessToken: string | null,
  id: string,
): Promise<BankAccountTransactionCount> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(
    `${baseUrl}/api/v1/bank-accounts/${encodeURIComponent(id)}/transaction-count`,
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

  const payload = (await response.json()) as RawBankAccountTransactionCount;
  return { count: payload.count };
}

async function sendBankAccountMutation(
  baseUrl: string,
  accessToken: string | null,
  path: string,
  init: RequestInit,
): Promise<BankAccountMutationResult> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return normalizeBankAccountMutation(
    (await response.json()) as RawBankAccountMutation,
  );
}

export function createBankAccount(
  baseUrl: string,
  accessToken: string | null,
  input: CreateBankAccountInput,
) {
  return sendBankAccountMutation(baseUrl, accessToken, "/api/v1/bank-accounts", {
    method: "POST",
    body: JSON.stringify({
      name: input.name,
      ...(input.currency !== undefined ? { currency: input.currency } : {}),
      ...(input.manual !== undefined ? { manual: input.manual } : {}),
    }),
  });
}

export function updateBankAccount(
  baseUrl: string,
  accessToken: string | null,
  input: UpdateBankAccountInput,
) {
  const body: Record<string, unknown> = {};
  if (input.name !== undefined) body.name = input.name;
  if (input.type !== undefined) body.type = input.type;
  if (input.balance !== undefined) body.balance = input.balance;
  if (input.enabled !== undefined) body.enabled = input.enabled;
  if (input.currency !== undefined) body.currency = input.currency;
  if (input.baseBalance !== undefined) body.baseBalance = input.baseBalance;
  if (input.baseCurrency !== undefined) body.baseCurrency = input.baseCurrency;

  return sendBankAccountMutation(
    baseUrl,
    accessToken,
    `/api/v1/bank-accounts/${encodeURIComponent(input.id)}`,
    {
      method: "PUT",
      body: JSON.stringify(body),
    },
  );
}

export function deleteBankAccount(
  baseUrl: string,
  accessToken: string | null,
  input: DeleteBankAccountInput,
) {
  return sendBankAccountMutation(
    baseUrl,
    accessToken,
    `/api/v1/bank-accounts/${encodeURIComponent(input.id)}`,
    {
      method: "DELETE",
    },
  );
}

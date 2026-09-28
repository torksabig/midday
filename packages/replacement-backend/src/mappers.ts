import { z } from "zod";

/** Clone `GET /api/v1/auth/me` + settings subset mapped to Midday `user.me` shape. */
export type ReplacementAuthMePayload = {
  user: { id: string; email: string; name: string };
  team: { id: string; name: string };
  settings?: { currency: string; locale: string };
};

export type MiddayUserMeShape = {
  id: string;
  fullName: string | null;
  email: string | null;
  avatarUrl: string | null;
  locale: string | null;
  timeFormat: number | null;
  dateFormat: string | null;
  weekStartsOnMonday: boolean | null;
  timezone: string | null;
  timezoneAutoSync: boolean | null;
  teamId: string | null;
  team: {
    id: string;
    name: string;
    logoUrl: string | null;
    email: string | null;
    plan: string;
    subscriptionStatus: string | null;
    inboxId: string | null;
    createdAt: Date | null;
    countryCode: string | null;
    canceledAt: Date | null;
    baseCurrency: string | null;
  } | null;
  fileKey: string | null;
};

export type ReplacementTeamCurrentPayload = {
  id: string;
  name: string;
  base_currency: string;
  locale: string | null;
};

export type MiddayTeamCurrentShape = {
  id: string;
  name: string;
  logoUrl: string | null;
  email: string | null;
  inboxId: string | null;
  plan: string;
  subscriptionStatus: string | null;
  canceledAt: Date | null;
  baseCurrency: string | null;
  countryCode: string | null;
  fiscalYearStartMonth: number | null;
  exportSettings: unknown;
  stripeAccountId: string | null;
  stripeConnectStatus: string | null;
};

export function mapReplacementToUserMe(
  payload: ReplacementAuthMePayload,
  fileKey: string | null,
): MiddayUserMeShape {
  const currency = payload.settings?.currency ?? "USD";
  const locale = payload.settings?.locale ?? null;

  return {
    id: payload.user.id,
    fullName: payload.user.name,
    email: payload.user.email,
    avatarUrl: null,
    locale,
    timeFormat: null,
    dateFormat: null,
    weekStartsOnMonday: null,
    timezone: null,
    timezoneAutoSync: null,
    teamId: payload.team.id,
    team: {
      id: payload.team.id,
      name: payload.team.name,
      logoUrl: null,
      email: null,
      plan: "trial",
      subscriptionStatus: null,
      inboxId: null,
      createdAt: null,
      countryCode: null,
      canceledAt: null,
      baseCurrency: currency,
    },
    fileKey,
  };
}

export function mapReplacementToTeamCurrent(
  payload: ReplacementTeamCurrentPayload,
): MiddayTeamCurrentShape {
  return {
    id: payload.id,
    name: payload.name,
    logoUrl: null,
    email: null,
    inboxId: null,
    plan: "trial",
    subscriptionStatus: null,
    canceledAt: null,
    baseCurrency: payload.base_currency,
    countryCode: null,
    fiscalYearStartMonth: null,
    exportSettings: null,
    stripeAccountId: null,
    stripeConnectStatus: null,
  };
}

const replacementAssignedSchema = z
  .object({
    id: z.string(),
    full_name: z.string().nullable().optional(),
    avatar_url: z.string().nullable().optional(),
  })
  .nullable()
  .optional();

const replacementCategorySchema = z
  .object({
    id: z.string(),
    name: z.string(),
    color: z.string().nullable().optional(),
    slug: z.string(),
    tax_rate: z.number().nullable().optional(),
    tax_type: z.string().nullable().optional(),
  })
  .nullable()
  .optional();

const replacementAccountConnectionSchema = z
  .object({
    id: z.string(),
    name: z.string().nullable().optional(),
    logo_url: z.string().nullable().optional(),
  })
  .nullable()
  .optional();

const replacementAccountSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    currency: z.string(),
    connection: replacementAccountConnectionSchema,
  })
  .nullable()
  .optional();

const replacementTransactionItemSchema = z.object({
  id: z.string(),
  date: z.string(),
  amount: z.number(),
  currency: z.string(),
  method: z.string(),
  status: z.string(),
  note: z.string().nullable().optional(),
  manual: z.boolean(),
  internal: z.boolean(),
  recurring: z.boolean().nullable().optional(),
  counterparty_name: z.string().nullable().optional(),
  frequency: z.string().nullable().optional(),
  name: z.string(),
  description: z.string().nullable().optional(),
  created_at: z.string(),
  tax_rate: z.number().nullable().optional(),
  tax_type: z.string().nullable().optional(),
  tax_amount: z.number().nullable().optional(),
  base_amount: z.number().nullable().optional(),
  base_currency: z.string().nullable().optional(),
  enrichment_completed: z.boolean(),
  is_fulfilled: z.boolean(),
  has_pending_suggestion: z.boolean(),
  is_exported: z.boolean(),
  has_export_error: z.boolean(),
  export_provider: z.string().nullable().optional(),
  exported_at: z.string().nullable().optional(),
  export_error_code: z.string().nullable().optional(),
  attachments: z.array(z.record(z.string(), z.unknown())).optional(),
  tags: z.array(z.record(z.string(), z.unknown())).optional(),
  assigned: replacementAssignedSchema,
  category: replacementCategorySchema,
  account: replacementAccountSchema,
});

export const replacementTransactionsListSchema = z.object({
  meta: z.object({
    cursor: z.string().nullable().optional(),
    has_previous_page: z.boolean(),
    has_next_page: z.boolean(),
  }),
  data: z.array(replacementTransactionItemSchema),
});

export type MiddayTransactionsGetShape = {
  meta: {
    cursor?: string;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
  data: Array<{
    id: string;
    date: string;
    amount: number;
    currency: string;
    method: string;
    status: string;
    note: string | null;
    manual: boolean;
    internal: boolean;
    recurring: boolean | null;
    counterpartyName: string | null;
    frequency: string | null;
    name: string;
    description: string | null;
    createdAt: string;
    taxRate: number | null;
    taxType: string | null;
    taxAmount: number | null;
    baseAmount: number | null;
    baseCurrency: string | null;
    enrichmentCompleted: boolean;
    isFulfilled: boolean;
    hasPendingSuggestion: boolean;
    isExported: boolean;
    hasExportError: boolean;
    exportProvider: string | null;
    exportedAt: string | null;
    exportErrorCode: string | null;
    attachments: Array<{
      id: string;
      filename: string | null;
      path: string | null;
      type: string;
      size: number;
    }>;
    tags: Array<{ id: string; name: string | null }>;
    assigned: {
      id: string;
      fullName: string | null;
      avatarUrl: string | null;
    } | null;
    category: {
      id: string;
      name: string;
      color: string | null;
      slug: string;
      taxRate: number | null;
      taxType: string | null;
    } | null;
    account: {
      id: string;
      name: string;
      currency: string;
      connection: {
        id: string;
        name: string | null;
        logoUrl: string | null;
      } | null;
    } | null;
  }>;
};

const replacementTransactionSuggestionSchema = z
  .object({
    suggestion_id: z.string().nullable().optional(),
    inbox_id: z.string().nullable().optional(),
    document_name: z.string().nullable().optional(),
    document_amount: z.number().nullable().optional(),
    document_currency: z.string().nullable().optional(),
    document_path: z.string().nullable().optional(),
    confidence_score: z.number().nullable().optional(),
  })
  .optional();

export const replacementTransactionDetailSchema =
  replacementTransactionItemSchema.extend({
    suggestion: replacementTransactionSuggestionSchema,
  });

export type MiddayTransactionListItemShape =
  MiddayTransactionsGetShape["data"][number];

export type MiddayTransactionByIdShape = MiddayTransactionListItemShape & {
  suggestion: {
    suggestionId: string | null;
    inboxId: string | null;
    documentName: string | null;
    documentAmount: number | null;
    documentCurrency: string | null;
    documentPath: string | null;
    confidenceScore: number | null;
  };
};

function mapReplacementAttachmentRecords(
  raw: Array<Record<string, unknown>> | undefined,
): MiddayTransactionListItemShape["attachments"] {
  return (raw ?? []).map((a) => ({
    id: String(a.id ?? ""),
    filename: (a.filename as string | null | undefined) ?? null,
    path: (a.path as string | null | undefined) ?? null,
    type: String(a.type ?? ""),
    size: Number(a.size ?? 0),
  }));
}

function mapReplacementTagRecords(
  raw: Array<Record<string, unknown>> | undefined,
): MiddayTransactionListItemShape["tags"] {
  return (raw ?? []).map((t) => ({
    id: String(t.id ?? ""),
    name: (t.name as string | null | undefined) ?? null,
  }));
}

function mapReplacementTransactionListItem(
  row: z.infer<typeof replacementTransactionItemSchema>,
): MiddayTransactionListItemShape {
  const assigned = row.assigned
    ? {
        id: row.assigned.id,
        fullName: row.assigned.full_name ?? null,
        avatarUrl: row.assigned.avatar_url ?? null,
      }
    : null;

  const category = row.category
    ? {
        id: row.category.id,
        name: row.category.name,
        color: row.category.color ?? null,
        slug: row.category.slug,
        taxRate: row.category.tax_rate ?? null,
        taxType: row.category.tax_type ?? null,
      }
    : null;

  const account = row.account
    ? {
        id: row.account.id,
        name: row.account.name,
        currency: row.account.currency,
        connection: row.account.connection
          ? {
              id: row.account.connection.id,
              name: row.account.connection.name ?? null,
              logoUrl: row.account.connection.logo_url ?? null,
            }
          : null,
      }
    : null;

  return {
    id: row.id,
    date: row.date,
    amount: row.amount,
    currency: row.currency,
    method: row.method,
    status: row.status,
    note: row.note ?? null,
    manual: row.manual,
    internal: row.internal,
    recurring: row.recurring ?? null,
    counterpartyName: row.counterparty_name ?? null,
    frequency: row.frequency ?? null,
    name: row.name,
    description: row.description ?? null,
    createdAt: row.created_at,
    taxRate: row.tax_rate ?? null,
    taxType: row.tax_type ?? null,
    taxAmount: row.tax_amount ?? null,
    baseAmount: row.base_amount ?? null,
    baseCurrency: row.base_currency ?? null,
    enrichmentCompleted: row.enrichment_completed,
    isFulfilled: row.is_fulfilled,
    hasPendingSuggestion: row.has_pending_suggestion,
    isExported: row.is_exported,
    hasExportError: row.has_export_error,
    exportProvider: row.export_provider ?? null,
    exportedAt: row.exported_at ?? null,
    exportErrorCode: row.export_error_code ?? null,
    attachments: mapReplacementAttachmentRecords(row.attachments),
    tags: mapReplacementTagRecords(row.tags),
    assigned,
    category,
    account,
  };
}

function mapReplacementTransactionSuggestion(
  suggestion: z.infer<typeof replacementTransactionSuggestionSchema>,
): MiddayTransactionByIdShape["suggestion"] {
  if (!suggestion) {
    return {
      suggestionId: null,
      inboxId: null,
      documentName: null,
      documentAmount: null,
      documentCurrency: null,
      documentPath: null,
      confidenceScore: null,
    };
  }

  return {
    suggestionId: suggestion.suggestion_id ?? null,
    inboxId: suggestion.inbox_id ?? null,
    documentName: suggestion.document_name ?? null,
    documentAmount: suggestion.document_amount ?? null,
    documentCurrency: suggestion.document_currency ?? null,
    documentPath: suggestion.document_path ?? null,
    confidenceScore: suggestion.confidence_score ?? null,
  };
}

export function mapReplacementToTransactionsGet(
  payload: unknown,
): MiddayTransactionsGetShape {
  const parsed = replacementTransactionsListSchema.parse(payload);

  return {
    meta: {
      cursor: parsed.meta.cursor ?? undefined,
      hasPreviousPage: parsed.meta.has_previous_page,
      hasNextPage: parsed.meta.has_next_page,
    },
    data: parsed.data.map(mapReplacementTransactionListItem),
  };
}

export function mapReplacementToTransactionById(
  payload: unknown,
): MiddayTransactionByIdShape {
  const parsed = replacementTransactionDetailSchema.parse(payload);
  const { suggestion, ...itemFields } = parsed;

  return {
    ...mapReplacementTransactionListItem(itemFields),
    suggestion: mapReplacementTransactionSuggestion(suggestion),
  };
}

const replacementCategoryChildSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string().nullable().optional(),
  slug: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  system: z.boolean().nullable().optional(),
  tax_rate: z.number().nullable().optional(),
  tax_type: z.string().nullable().optional(),
  tax_reporting_code: z.string().nullable().optional(),
  excluded: z.boolean().nullable().optional(),
  parent_id: z.string().nullable().optional(),
});

const replacementCategoryTreeSchema = replacementCategoryChildSchema.extend({
  children: z.array(replacementCategoryChildSchema).optional(),
});

export type MiddayTransactionCategoriesGetShape = Array<{
  id: string;
  name: string;
  color: string | null;
  slug: string | null;
  description: string | null;
  system: boolean | null;
  taxRate: number | null;
  taxType: string | null;
  taxReportingCode: string | null;
  excluded: boolean | null;
  parentId: string | null;
  children: Array<{
    id: string;
    name: string;
    color: string | null;
    slug: string | null;
    description: string | null;
    system: boolean | null;
    taxRate: number | null;
    taxType: string | null;
    taxReportingCode: string | null;
    excluded: boolean | null;
    parentId: string | null;
  }>;
}>;

function mapReplacementCategoryChild(
  row: z.infer<typeof replacementCategoryChildSchema>,
) {
  return {
    id: row.id,
    name: row.name,
    color: row.color ?? null,
    slug: row.slug ?? null,
    description: row.description ?? null,
    system: row.system ?? null,
    taxRate: row.tax_rate ?? null,
    taxType: row.tax_type ?? null,
    taxReportingCode: row.tax_reporting_code ?? null,
    excluded: row.excluded ?? null,
    parentId: row.parent_id ?? null,
  };
}

export function mapReplacementToTransactionCategoriesGet(
  payload: unknown,
): MiddayTransactionCategoriesGetShape {
  const parsed = z.array(replacementCategoryTreeSchema).parse(payload);
  return parsed.map((row) => ({
    ...mapReplacementCategoryChild(row),
    children: (row.children ?? []).map(mapReplacementCategoryChild),
  }));
}

const replacementBankConnectionSchema = z.object({
  id: z.string(),
  created_at: z.string(),
  institution_id: z.string(),
  expires_at: z.string().nullable().optional(),
  team_id: z.string(),
  name: z.string(),
  logo_url: z.string().nullable().optional(),
  enrollment_id: z.string().nullable().optional(),
  provider: z.string(),
  last_accessed: z.string().nullable().optional(),
  reference_id: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  error_details: z.string().nullable().optional(),
  error_retries: z.number().nullable().optional(),
});

const replacementBankAccountSchema = z.object({
  id: z.string(),
  created_at: z.string(),
  created_by: z.string(),
  team_id: z.string(),
  name: z.string().nullable().optional(),
  currency: z.string().nullable().optional(),
  bank_connection_id: z.string().nullable().optional(),
  enabled: z.boolean(),
  account_id: z.string(),
  balance: z.number().nullable().optional(),
  manual: z.boolean().nullable().optional(),
  type: z.string().nullable().optional(),
  base_currency: z.string().nullable().optional(),
  base_balance: z.number().nullable().optional(),
  error_details: z.string().nullable().optional(),
  error_retries: z.number().nullable().optional(),
  account_reference: z.string().nullable().optional(),
  subtype: z.string().nullable().optional(),
  bic: z.string().nullable().optional(),
  routing_number: z.string().nullable().optional(),
  wire_routing_number: z.string().nullable().optional(),
  sort_code: z.string().nullable().optional(),
  available_balance: z.number().nullable().optional(),
  credit_limit: z.number().nullable().optional(),
  bank_connection: replacementBankConnectionSchema.nullable().optional(),
});

export type MiddayBankAccountsGetShape = Array<{
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
  bankConnection: {
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
  } | null;
}>;

export function mapReplacementToBankAccountsGet(
  payload: unknown,
): MiddayBankAccountsGetShape {
  const parsed = z.array(replacementBankAccountSchema).parse(payload);
  return parsed.map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    createdBy: row.created_by,
    teamId: row.team_id,
    name: row.name ?? null,
    currency: row.currency ?? null,
    bankConnectionId: row.bank_connection_id ?? null,
    enabled: row.enabled,
    accountId: row.account_id,
    balance: row.balance ?? null,
    manual: row.manual ?? null,
    type: row.type ?? null,
    baseCurrency: row.base_currency ?? null,
    baseBalance: row.base_balance ?? null,
    errorDetails: row.error_details ?? null,
    errorRetries: row.error_retries ?? null,
    accountReference: row.account_reference ?? null,
    subtype: row.subtype ?? null,
    bic: row.bic ?? null,
    routingNumber: row.routing_number ?? null,
    wireRoutingNumber: row.wire_routing_number ?? null,
    sortCode: row.sort_code ?? null,
    availableBalance: row.available_balance ?? null,
    creditLimit: row.credit_limit ?? null,
    bankConnection: row.bank_connection
      ? {
          id: row.bank_connection.id,
          createdAt: row.bank_connection.created_at,
          institutionId: row.bank_connection.institution_id,
          expiresAt: row.bank_connection.expires_at ?? null,
          teamId: row.bank_connection.team_id,
          name: row.bank_connection.name,
          logoUrl: row.bank_connection.logo_url ?? null,
          enrollmentId: row.bank_connection.enrollment_id ?? null,
          provider: row.bank_connection.provider,
          lastAccessed: row.bank_connection.last_accessed ?? null,
          referenceId: row.bank_connection.reference_id ?? null,
          status: row.bank_connection.status ?? null,
          errorDetails: row.bank_connection.error_details ?? null,
          errorRetries: row.bank_connection.error_retries ?? null,
          accessToken: null,
        }
      : null,
  }));
}

const replacementInboxAccountSchema = z
  .object({
    id: z.string(),
    email: z.string().nullable().optional(),
    provider: z.string().nullable().optional(),
  })
  .nullable()
  .optional();

const replacementInboxTransactionSchema = z
  .object({
    id: z.string(),
    amount: z.number().nullable().optional(),
    currency: z.string().nullable().optional(),
    name: z.string().nullable().optional(),
    date: z.string().nullable().optional(),
  })
  .nullable()
  .optional();

const replacementInboxListItemSchema = z.object({
  id: z.string(),
  file_name: z.string().nullable().optional(),
  file_path: z.array(z.string()).nullable().optional(),
  display_name: z.string().nullable().optional(),
  transaction_id: z.string().nullable().optional(),
  amount: z.number().nullable().optional(),
  currency: z.string().nullable().optional(),
  content_type: z.string().nullable().optional(),
  date: z.string().nullable().optional(),
  status: z.string(),
  type: z.string().nullable().optional(),
  created_at: z.string(),
  website: z.string().nullable().optional(),
  sender_email: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  inbox_account_id: z.string().nullable().optional(),
  tax_amount: z.number().nullable().optional(),
  tax_rate: z.number().nullable().optional(),
  tax_type: z.string().nullable().optional(),
  related_count: z.number(),
  inbox_account: replacementInboxAccountSchema,
  transaction: replacementInboxTransactionSchema,
});

export const replacementInboxListSchema = z.object({
  meta: z.object({
    cursor: z.string().nullable().optional(),
    has_previous_page: z.boolean(),
    has_next_page: z.boolean(),
  }),
  data: z.array(replacementInboxListItemSchema),
});

export type MiddayInboxListItemShape = {
  id: string;
  fileName: string | null;
  filePath: string[] | null;
  displayName: string | null;
  transactionId: string | null;
  amount: number | null;
  currency: string | null;
  contentType: string | null;
  date: string | null;
  status: string;
  type: string | null;
  createdAt: string;
  website: string | null;
  senderEmail: string | null;
  description: string | null;
  inboxAccountId: string | null;
  taxAmount: number | null;
  taxRate: number | null;
  taxType: string | null;
  relatedCount: number;
  inboxAccount: {
    id: string;
    email: string | null;
    provider: string | null;
  } | null;
  transaction: {
    id: string;
    amount: number | null;
    currency: string | null;
    name: string | null;
    date: string | null;
  } | null;
};

export type MiddayInboxGetShape = {
  meta: {
    cursor?: string;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
  data: MiddayInboxListItemShape[];
};

const replacementSuggestedTransactionSchema = z
  .object({
    id: z.string(),
    name: z.string().nullable().optional(),
    amount: z.number().nullable().optional(),
    currency: z.string().nullable().optional(),
    date: z.string().nullable().optional(),
  })
  .optional();

const replacementInboxSuggestionSchema = z
  .object({
    id: z.string().nullable().optional(),
    transaction_id: z.string().nullable().optional(),
    confidence_score: z.number().nullable().optional(),
    match_type: z.string().nullable().optional(),
    status: z.string().nullable().optional(),
    suggested_transaction: replacementSuggestedTransactionSchema,
  })
  .nullable()
  .optional();

const replacementInboxRelatedItemSchema = z.object({
  id: z.string(),
  file_name: z.string().nullable().optional(),
  file_path: z.array(z.string()).nullable().optional(),
  display_name: z.string().nullable().optional(),
  transaction_id: z.string().nullable().optional(),
  amount: z.number().nullable().optional(),
  currency: z.string().nullable().optional(),
  content_type: z.string().nullable().optional(),
  date: z.string().nullable().optional(),
  status: z.string(),
  type: z.string().nullable().optional(),
  created_at: z.string(),
  website: z.string().nullable().optional(),
  sender_email: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  inbox_account_id: z.string().nullable().optional(),
});

export const replacementInboxDetailSchema = replacementInboxListItemSchema.extend({
  grouped_inbox_id: z.string().nullable().optional(),
  meta: z.unknown().nullable().optional(),
  suggestion: replacementInboxSuggestionSchema,
  related_items: z.array(replacementInboxRelatedItemSchema).optional(),
});

export type MiddayInboxByIdShape = MiddayInboxListItemShape & {
  groupedInboxId: string | null;
  meta: unknown;
  suggestion: {
    id: string | null;
    transactionId: string | null;
    confidenceScore: number | null;
    matchType: string | null;
    status: string | null;
    suggestedTransaction?: {
      id: string;
      name: string | null;
      amount: number | null;
      currency: string | null;
      date: string | null;
    };
  } | null;
  relatedItems?: MiddayInboxListItemShape[];
};

function mapReplacementInboxAccount(
  account: z.infer<typeof replacementInboxAccountSchema>,
): MiddayInboxListItemShape["inboxAccount"] {
  if (!account?.id) {
    return null;
  }
  return {
    id: account.id,
    email: account.email ?? null,
    provider: account.provider ?? null,
  };
}

function mapReplacementInboxTransaction(
  tx: z.infer<typeof replacementInboxTransactionSchema>,
): MiddayInboxListItemShape["transaction"] {
  if (!tx?.id) {
    return null;
  }
  return {
    id: tx.id,
    amount: tx.amount ?? null,
    currency: tx.currency ?? null,
    name: tx.name ?? null,
    date: tx.date ?? null,
  };
}

function mapReplacementInboxListItem(
  row: z.infer<typeof replacementInboxListItemSchema>,
): MiddayInboxListItemShape {
  return {
    id: row.id,
    fileName: row.file_name ?? null,
    filePath: row.file_path ?? null,
    displayName: row.display_name ?? null,
    transactionId: row.transaction_id ?? null,
    amount: row.amount ?? null,
    currency: row.currency ?? null,
    contentType: row.content_type ?? null,
    date: row.date ?? null,
    status: row.status,
    type: row.type ?? null,
    createdAt: row.created_at,
    website: row.website ?? null,
    senderEmail: row.sender_email ?? null,
    description: row.description ?? null,
    inboxAccountId: row.inbox_account_id ?? null,
    taxAmount: row.tax_amount ?? null,
    taxRate: row.tax_rate ?? null,
    taxType: row.tax_type ?? null,
    relatedCount: row.related_count,
    inboxAccount: mapReplacementInboxAccount(row.inbox_account),
    transaction: mapReplacementInboxTransaction(row.transaction),
  };
}

export function mapReplacementToInboxGet(payload: unknown): MiddayInboxGetShape {
  const parsed = replacementInboxListSchema.parse(payload);
  return {
    meta: {
      cursor: parsed.meta.cursor ?? undefined,
      hasPreviousPage: parsed.meta.has_previous_page,
      hasNextPage: parsed.meta.has_next_page,
    },
    data: parsed.data.map(mapReplacementInboxListItem),
  };
}

export function mapReplacementToInboxById(
  payload: unknown,
): MiddayInboxByIdShape {
  const parsed = replacementInboxDetailSchema.parse(payload);
  const base = mapReplacementInboxListItem(parsed);

  const suggestion = parsed.suggestion?.id
    ? {
        id: parsed.suggestion.id ?? null,
        transactionId: parsed.suggestion.transaction_id ?? null,
        confidenceScore: parsed.suggestion.confidence_score ?? null,
        matchType: parsed.suggestion.match_type ?? null,
        status: parsed.suggestion.status ?? null,
        ...(parsed.suggestion.suggested_transaction
          ? {
              suggestedTransaction: {
                id: parsed.suggestion.suggested_transaction.id,
                name: parsed.suggestion.suggested_transaction.name ?? null,
                amount: parsed.suggestion.suggested_transaction.amount ?? null,
                currency:
                  parsed.suggestion.suggested_transaction.currency ?? null,
                date: parsed.suggestion.suggested_transaction.date ?? null,
              },
            }
          : {}),
      }
    : parsed.suggestion
      ? {
          id: parsed.suggestion.id ?? null,
          transactionId: parsed.suggestion.transaction_id ?? null,
          confidenceScore: parsed.suggestion.confidence_score ?? null,
          matchType: parsed.suggestion.match_type ?? null,
          status: parsed.suggestion.status ?? null,
        }
      : null;

  const relatedItems = parsed.related_items?.map((item) =>
    mapReplacementInboxListItem({
      ...item,
      related_count: 0,
      inbox_account: null,
      transaction: null,
    }),
  );

  return {
    ...base,
    groupedInboxId: parsed.grouped_inbox_id ?? null,
    meta: parsed.meta ?? null,
    suggestion,
    ...(relatedItems && relatedItems.length > 0
      ? { relatedItems }
      : {}),
  };
}

const replacementInboxSearchItemSchema = z.object({
  id: z.string(),
  created_at: z.string(),
  file_name: z.string().nullable().optional(),
  amount: z.number().nullable().optional(),
  currency: z.string().nullable().optional(),
  file_path: z.array(z.string()).nullable().optional(),
  content_type: z.string().nullable().optional(),
  date: z.string().nullable().optional(),
  display_name: z.string().nullable().optional(),
  size: z.number().nullable().optional(),
  description: z.string().nullable().optional(),
  status: z.string(),
  website: z.string().nullable().optional(),
  base_amount: z.number().nullable().optional(),
  base_currency: z.string().nullable().optional(),
  tax_amount: z.number().nullable().optional(),
  tax_rate: z.number().nullable().optional(),
  tax_type: z.string().nullable().optional(),
  type: z.string().nullable().optional(),
});

export type MiddayInboxSearchItemShape = {
  id: string;
  createdAt: string;
  fileName: string | null;
  amount: number | null;
  currency: string | null;
  filePath: string[] | null;
  contentType: string | null;
  date: string | null;
  displayName: string | null;
  size: number | null;
  description: string | null;
  status: string;
  website: string | null;
  baseAmount: number | null;
  baseCurrency: string | null;
  taxAmount: number | null;
  taxRate: number | null;
  taxType: string | null;
  type: string | null;
};

export function mapReplacementInboxSearchItem(
  row: z.infer<typeof replacementInboxSearchItemSchema>,
): MiddayInboxSearchItemShape {
  return {
    id: row.id,
    createdAt: row.created_at,
    fileName: row.file_name ?? null,
    amount: row.amount ?? null,
    currency: row.currency ?? null,
    filePath: row.file_path ?? null,
    contentType: row.content_type ?? null,
    date: row.date ?? null,
    displayName: row.display_name ?? null,
    size: row.size ?? null,
    description: row.description ?? null,
    status: row.status,
    website: row.website ?? null,
    baseAmount: row.base_amount ?? null,
    baseCurrency: row.base_currency ?? null,
    taxAmount: row.tax_amount ?? null,
    taxRate: row.tax_rate ?? null,
    taxType: row.tax_type ?? null,
    type: row.type ?? null,
  };
}

export function mapReplacementToInboxSearch(
  payload: unknown,
): MiddayInboxSearchItemShape[] {
  return z.array(replacementInboxSearchItemSchema).parse(payload).map(mapReplacementInboxSearchItem);
}

const replacementInboxByStatusItemSchema = z.object({
  id: z.string(),
  display_name: z.string().nullable().optional(),
  amount: z.number().nullable().optional(),
  currency: z.string().nullable().optional(),
  date: z.string().nullable().optional(),
  status: z.string(),
  created_at: z.string(),
  transaction_id: z.string().nullable().optional(),
});

export type MiddayInboxByStatusItemShape = {
  id: string;
  displayName: string | null;
  amount: number | null;
  currency: string | null;
  date: string | null;
  status: string;
  createdAt: string;
  transactionId: string | null;
};

export function mapReplacementToInboxByStatus(
  payload: unknown,
): MiddayInboxByStatusItemShape[] {
  return z
    .array(replacementInboxByStatusItemSchema)
    .parse(payload)
    .map((row) => ({
      id: row.id,
      displayName: row.display_name ?? null,
      amount: row.amount ?? null,
      currency: row.currency ?? null,
      date: row.date ?? null,
      status: row.status,
      createdAt: row.created_at,
      transactionId: row.transaction_id ?? null,
    }));
}

const replacementInboxCheckAttachmentsSchema = z.object({
  has_attachments: z.boolean(),
  attachments: z.array(
    z.object({
      id: z.string(),
      transaction_id: z.string().nullable().optional(),
      name: z.string().nullable().optional(),
    }),
  ),
  file_name: z.string().nullable().optional(),
});

export type MiddayInboxCheckAttachmentsShape = {
  hasAttachments: boolean;
  attachments: Array<{
    id: string;
    transactionId: string | null;
    name: string | null;
  }>;
  fileName?: string | null;
};

export function mapReplacementToInboxCheckAttachments(
  payload: unknown,
): MiddayInboxCheckAttachmentsShape {
  const parsed = replacementInboxCheckAttachmentsSchema.parse(payload);
  return {
    hasAttachments: parsed.has_attachments,
    attachments: parsed.attachments.map((a) => ({
      id: a.id,
      transactionId: a.transaction_id ?? null,
      name: a.name ?? null,
    })),
    ...(parsed.file_name != null ? { fileName: parsed.file_name } : {}),
  };
}

const replacementOverviewSummarySchema = z.object({
  open_invoices: z.object({
    count: z.number(),
    total_amount: z.number(),
    currency: z.string(),
  }),
  unbilled_time: z.object({
    total_duration: z.number(),
    total_amount: z.number(),
    project_count: z.number(),
    currency: z.string(),
  }),
  inbox_pending: z.object({
    count: z.number(),
  }),
  transactions_to_review: z.object({
    count: z.number(),
  }),
  cash_balance: z.object({
    total_balance: z.number(),
    currency: z.string(),
    account_count: z.number(),
  }),
  runway: z.number(),
});

export type MiddayOverviewSummaryShape = {
  openInvoices: {
    count: number;
    totalAmount: number;
    currency: string;
  };
  unbilledTime: {
    totalDuration: number;
    totalAmount: number;
    projectCount: number;
    currency: string;
  };
  inboxPending: {
    count: number;
  };
  transactionsToReview: {
    count: number;
  };
  cashBalance: {
    totalBalance: number;
    currency: string;
    accountCount: number;
  };
  runway: number;
};

export function mapReplacementToOverviewSummary(
  payload: unknown,
): MiddayOverviewSummaryShape {
  const parsed = replacementOverviewSummarySchema.parse(payload);
  return {
    openInvoices: {
      count: parsed.open_invoices.count,
      totalAmount: parsed.open_invoices.total_amount,
      currency: parsed.open_invoices.currency,
    },
    unbilledTime: {
      totalDuration: parsed.unbilled_time.total_duration,
      totalAmount: parsed.unbilled_time.total_amount,
      projectCount: parsed.unbilled_time.project_count,
      currency: parsed.unbilled_time.currency,
    },
    inboxPending: {
      count: parsed.inbox_pending.count,
    },
    transactionsToReview: {
      count: parsed.transactions_to_review.count,
    },
    cashBalance: {
      totalBalance: parsed.cash_balance.total_balance,
      currency: parsed.cash_balance.currency,
      accountCount: parsed.cash_balance.account_count,
    },
    runway: parsed.runway,
  };
}

function snakeToCamelKey(key: string): string {
  return key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
}

export function deepCamelCaseKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => deepCamelCaseKeys(item));
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [
        snakeToCamelKey(k),
        deepCamelCaseKeys(v),
      ]),
    );
  }
  return value;
}

const replacementPaginatedListSchema = z.object({
  meta: z.object({
    cursor: z.string().nullable().optional(),
    has_previous_page: z.boolean(),
    has_next_page: z.boolean(),
  }),
  data: z.array(z.record(z.string(), z.unknown())),
});

export type MiddayPaginatedListShape = {
  meta: {
    cursor?: string | null;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
  data: unknown[];
};

function mapReplacementPaginatedList(payload: unknown): MiddayPaginatedListShape {
  const parsed = replacementPaginatedListSchema.parse(payload);
  return {
    meta: {
      cursor: parsed.meta.cursor ?? undefined,
      hasPreviousPage: parsed.meta.has_previous_page,
      hasNextPage: parsed.meta.has_next_page,
    },
    data: parsed.data.map((row) => deepCamelCaseKeys(row)),
  };
}

export type MiddayDocumentsGetShape = MiddayPaginatedListShape;
export type MiddayCustomersGetShape = MiddayPaginatedListShape;
export type MiddayInvoicesGetShape = MiddayPaginatedListShape;

export function mapReplacementToDocumentsGet(
  payload: unknown,
): MiddayDocumentsGetShape {
  return mapReplacementPaginatedList(payload);
}

export function mapReplacementToCustomersGet(
  payload: unknown,
): MiddayCustomersGetShape {
  return mapReplacementPaginatedList(payload);
}

export function mapReplacementToInvoicesGet(
  payload: unknown,
): MiddayInvoicesGetShape {
  return mapReplacementPaginatedList(payload);
}

export function mapReplacementToDocumentById(payload: unknown): unknown {
  return deepCamelCaseKeys(z.record(z.string(), z.unknown()).parse(payload));
}

export function mapReplacementToCustomerById(payload: unknown): unknown {
  return deepCamelCaseKeys(z.record(z.string(), z.unknown()).parse(payload));
}

export function mapReplacementToInvoiceById(payload: unknown): unknown {
  return deepCamelCaseKeys(z.record(z.string(), z.unknown()).parse(payload));
}

export type MiddayTrackerProjectsGetShape = MiddayPaginatedListShape;

export function mapReplacementToTrackerProjectsGet(
  payload: unknown,
): MiddayTrackerProjectsGetShape {
  return mapReplacementPaginatedList(payload);
}

export function mapReplacementToTrackerEntriesByRange(payload: unknown): unknown {
  return deepCamelCaseKeys(payload);
}

export function mapReplacementToTrackerBillableHours(payload: unknown): unknown {
  return deepCamelCaseKeys(payload);
}

export function mapReplacementToTrackerEntriesByDate(payload: unknown): unknown {
  return deepCamelCaseKeys(payload);
}

export function mapReplacementToTrackerProjectById(payload: unknown): unknown {
  return deepCamelCaseKeys(z.record(z.string(), z.unknown()).parse(payload));
}

export function mapReplacementToTrackerCurrentTimer(payload: unknown): unknown | null {
  if (payload === null) return null;
  return deepCamelCaseKeys(z.record(z.string(), z.unknown()).parse(payload));
}

export function mapReplacementToTrackerTimerStatus(payload: unknown): unknown {
  return deepCamelCaseKeys(payload);
}

function accountingTenantNameFromConfig(config: unknown): string {
  if (!config || typeof config !== "object") return "Connected";
  const c = config as Record<string, unknown>;
  const provider = c.provider;
  if (provider === "xero" && typeof c.tenantName === "string") {
    return c.tenantName;
  }
  if (
    (provider === "quickbooks" || provider === "fortnox") &&
    typeof c.companyName === "string"
  ) {
    return c.companyName;
  }
  return "Connected";
}

export type MiddayAccountingConnectionShape = {
  providerId: string;
  tenantName: string;
  settings: unknown;
  connectedAt: null;
};

export function mapReplacementToAccountingConnections(
  payload: unknown,
): MiddayAccountingConnectionShape[] {
  const rows = z.array(z.record(z.string(), z.unknown())).parse(payload);
  return rows.map((row) => {
    const appId = String(row.app_id ?? row.appId ?? "");
    const config = row.config;
    return {
      providerId: appId,
      tenantName: accountingTenantNameFromConfig(config),
      settings: row.settings ?? null,
      connectedAt: null,
    };
  });
}

export function mapReplacementToAccountingSyncStatus(payload: unknown): unknown[] {
  return deepCamelCaseKeys(z.array(z.unknown()).parse(payload)) as unknown[];
}

export function mapReplacementToBankConnectionsGet(payload: unknown): unknown[] {
  return deepCamelCaseKeys(z.array(z.unknown()).parse(payload)) as unknown[];
}

const replacementPaymentStatusSchema = z.object({
  score: z.number(),
  payment_status: z.string(),
});

export type MiddayPaymentStatusShape = {
  score: number;
  paymentStatus: string;
};

export function mapReplacementToPaymentStatus(
  payload: unknown,
): MiddayPaymentStatusShape {
  const parsed = replacementPaymentStatusSchema.parse(payload);
  return {
    score: parsed.score,
    paymentStatus: parsed.payment_status,
  };
}

const replacementInvoiceSummaryBreakdownSchema = z.object({
  currency: z.string(),
  original_amount: z.number(),
  converted_amount: z.number(),
  count: z.number(),
});

const replacementInvoiceSummarySchema = z.object({
  total_amount: z.number(),
  invoice_count: z.number(),
  currency: z.string(),
  breakdown: z.array(replacementInvoiceSummaryBreakdownSchema).optional(),
});

export type MiddayInvoiceSummaryShape = {
  totalAmount: number;
  invoiceCount: number;
  currency: string;
  breakdown?: Array<{
    currency: string;
    originalAmount: number;
    convertedAmount: number;
    count: number;
  }>;
};

export function mapReplacementToInvoiceSummary(
  payload: unknown,
): MiddayInvoiceSummaryShape {
  const parsed = replacementInvoiceSummarySchema.parse(payload);
  return {
    totalAmount: parsed.total_amount,
    invoiceCount: parsed.invoice_count,
    currency: parsed.currency,
    ...(parsed.breakdown
      ? {
          breakdown: parsed.breakdown.map((row) => ({
            currency: row.currency,
            originalAmount: row.original_amount,
            convertedAmount: row.converted_amount,
            count: row.count,
          })),
        }
      : {}),
  };
}

const replacementGlobalSearchRowSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  relevance: z.number(),
  created_at: z.string(),
  data: z.unknown(),
});

export type MiddayGlobalSearchRowShape = {
  id: string;
  type: string;
  title: string;
  relevance: number;
  created_at: string;
  data: unknown;
};

export function mapReplacementToGlobalSearch(
  payload: unknown,
): MiddayGlobalSearchRowShape[] {
  return z.array(replacementGlobalSearchRowSchema).parse(payload);
}

const replacementRelatedDocumentSchema = z.object({
  id: z.string(),
  name: z.string().nullable().optional(),
  metadata: z.unknown().optional(),
  path_tokens: z.array(z.string()).nullable().optional(),
  tag: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  summary: z.string().nullable().optional(),
});

export type MiddayRelatedDocumentShape = {
  id: string;
  name?: string | null;
  metadata?: unknown;
  pathTokens?: string[] | null;
  tag?: string | null;
  title?: string | null;
  summary?: string | null;
};

export function mapReplacementToRelatedDocuments(
  payload: unknown,
): MiddayRelatedDocumentShape[] {
  return z.array(replacementRelatedDocumentSchema).parse(payload).map((row) => ({
    id: row.id,
    name: row.name,
    metadata: row.metadata,
    pathTokens: row.path_tokens ?? undefined,
    tag: row.tag,
    title: row.title,
    summary: row.summary,
  }));
}

/** Chart, expense, tax, runway, and account-balance report payloads. */
export function mapReplacementToReportJson(payload: unknown): unknown {
  return deepCamelCaseKeys(payload);
}

const replacementUserInviteSchema = z.object({
  id: z.string(),
  email: z.string().nullable().optional(),
  code: z.string().nullable().optional(),
  role: z.string().nullable().optional(),
  user: z
    .object({
      id: z.string(),
      full_name: z.string().nullable().optional(),
      email: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  team: z
    .object({
      id: z.string(),
      name: z.string().nullable().optional(),
      logo_url: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
});

export function mapReplacementToUserInvites(payload: unknown): unknown[] {
  return z.array(replacementUserInviteSchema).parse(payload).map((row) => ({
    id: row.id,
    email: row.email,
    code: row.code,
    role: row.role,
    user: row.user
      ? {
          id: row.user.id,
          fullName: row.user.full_name ?? null,
          email: row.user.email ?? null,
        }
      : null,
    team: row.team
      ? {
          id: row.team.id,
          name: row.team.name ?? null,
          logoUrl: row.team.logo_url ?? null,
        }
      : null,
  }));
}

const replacementBankBalanceRowSchema = z.object({
  id: z.string(),
  currency: z.string(),
  balance: z.coerce.number(),
  name: z.string(),
  logo_url: z.string(),
});

export function mapReplacementToBankAccountsBalances(
  payload: unknown,
): unknown[] {
  return z.array(replacementBankBalanceRowSchema).parse(payload);
}

const replacementBankCurrencyRowSchema = z.object({
  currency: z.string(),
});

export function mapReplacementToBankAccountsCurrencies(
  payload: unknown,
): unknown[] {
  return z.array(replacementBankCurrencyRowSchema).parse(payload);
}

const replacementDocumentTagSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export function mapReplacementToDocumentTagsGet(payload: unknown): unknown[] {
  return z.array(replacementDocumentTagSchema).parse(payload);
}

const replacementTransactionTagSchema = z.object({
  id: z.string(),
  name: z.string(),
  teamId: z.string(),
  createdAt: z.string(),
});

export function mapReplacementToTagsGet(payload: unknown): unknown[] {
  return z.array(replacementTransactionTagSchema).parse(payload);
}

const replacementNotificationRowSchema = z.object({
  id: z.string(),
  created_at: z.string(),
  team_id: z.string(),
  user_id: z.string().nullable().optional(),
  type: z.string(),
  priority: z.number(),
  group_id: z.string().nullable().optional(),
  source: z.enum(["system", "user"]),
  metadata: z.record(z.string(), z.any()),
  status: z.enum(["unread", "read", "archived"]),
  last_used_at: z.string().nullable().optional(),
});

const replacementNotificationsListSchema = z.object({
  meta: z.object({
    cursor: z.string().nullable(),
    has_previous_page: z.boolean(),
    has_next_page: z.boolean(),
  }),
  data: z.array(replacementNotificationRowSchema),
});

export type MiddayNotificationsListShape = {
  meta: {
    cursor?: string | null;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
  data: Array<{
    id: string;
    createdAt: string;
    teamId: string;
    userId: string | null;
    type: string;
    priority: number;
    groupId: string | null;
    source: "system" | "user";
    metadata: Record<string, unknown>;
    status: "unread" | "read" | "archived";
    lastUsedAt: string | null;
  }>;
};

export function mapReplacementToNotificationsList(
  payload: unknown,
): MiddayNotificationsListShape {
  const parsed = replacementNotificationsListSchema.parse(payload);
  return {
    meta: {
      cursor: parsed.meta.cursor,
      hasPreviousPage: parsed.meta.has_previous_page,
      hasNextPage: parsed.meta.has_next_page,
    },
    data: parsed.data.map((row) => ({
      id: row.id,
      createdAt: row.created_at,
      teamId: row.team_id,
      userId: row.user_id ?? null,
      type: row.type,
      priority: row.priority,
      groupId: row.group_id ?? null,
      source: row.source,
      metadata: row.metadata,
      status: row.status,
      lastUsedAt: row.last_used_at ?? null,
    })),
  };
}

export function mapReplacementToTransactionsUpdateMany(
  payload: unknown,
): MiddayTransactionByIdShape[] {
  return z
    .array(replacementTransactionDetailSchema)
    .parse(payload)
    .map((row) => mapReplacementToTransactionById(row));
}

const replacementBankAccountTransactionCountSchema = z.object({
  count: z.number(),
});

export function mapReplacementToBankAccountTransactionCount(
  payload: unknown,
): { count: number } {
  return replacementBankAccountTransactionCountSchema.parse(payload);
}

/** Partial tRPC update payload → Rust PUT body (camelCase, omit undefined). */
export function buildReplacementTransactionUpdateBody(
  input: Record<string, unknown>,
): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (key === "id" || value === undefined) {
      continue;
    }
    body[key] = value;
  }
  return body;
}

const replacementMostActiveClientSchema = z.object({
  customer_id: z.string(),
  customer_name: z.string(),
  invoice_count: z.number(),
  total_tracker_time: z.number(),
});

export function mapReplacementToMostActiveClient(
  payload: unknown,
): unknown | null {
  if (payload == null) {
    return null;
  }
  const parsed = replacementMostActiveClientSchema.parse(payload);
  return {
    customerId: parsed.customer_id,
    customerName: parsed.customer_name,
    invoiceCount: parsed.invoice_count,
    totalTrackerTime: parsed.total_tracker_time,
  };
}

export function mapReplacementToCountMetric(payload: unknown): number {
  return z.number().parse(payload);
}

const replacementAverageInvoiceSizeRowSchema = z.object({
  currency: z.string(),
  average_amount: z.number(),
  invoice_count: z.number(),
});

export function mapReplacementToAverageInvoiceSize(
  payload: unknown,
): unknown[] {
  return z
    .array(replacementAverageInvoiceSizeRowSchema)
    .parse(payload)
    .map((row) => ({
      currency: row.currency,
      averageAmount: row.average_amount,
      invoiceCount: row.invoice_count,
    }));
}

const replacementTopRevenueClientSchema = z.object({
  customer_id: z.string(),
  customer_name: z.string(),
  total_revenue: z.number(),
  currency: z.string(),
  invoice_count: z.number(),
});

export function mapReplacementToTopRevenueClient(
  payload: unknown,
): unknown | null {
  if (payload == null) {
    return null;
  }
  const parsed = replacementTopRevenueClientSchema.parse(payload);
  return {
    customerId: parsed.customer_id,
    customerName: parsed.customer_name,
    totalRevenue: parsed.total_revenue,
    currency: parsed.currency,
    invoiceCount: parsed.invoice_count,
  };
}

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
    data: parsed.data.map((row) => {
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
        attachments: [],
        tags: [],
        assigned,
        category,
        account,
      };
    }),
  };
}

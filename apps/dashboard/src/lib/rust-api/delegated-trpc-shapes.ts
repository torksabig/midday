/**
 * Stable UI shapes for data that previously came from tRPC RouterOutputs.
 * Delegation-only routers infer `{}` / `unknown` when the Drizzle path is `never`.
 */

export type ReportValuePoint = {
  date: string;
  value: number;
  currency?: string;
};

export type ReportsBurnRate = ReportValuePoint[];

export type ReportComparisonSeries = {
  result: Array<{
    date: string;
    current: { value: number; date?: string };
    previous: { value: number; date?: string };
  }>;
  summary?: {
    currentTotal?: number;
    previousTotal?: number;
    [key: string]: unknown;
  };
};

export type ReportsRevenue = ReportComparisonSeries;
export type ReportsProfit = ReportComparisonSeries;

export type ReportsSpending = Array<{
  name: string;
  slug?: string;
  amount: number;
  currency?: string;
  color?: string;
  percentage?: number;
}>;

export type ReportsRunway = {
  months?: number;
  medianBurn?: number;
  runway?: number;
  currency?: string;
  burnRate?: ReportValuePoint[];
  [key: string]: unknown;
};

export type ReportsExpense = Array<{
  date: string;
  value: number;
  currency?: string;
  recurring_value?: number;
  [key: string]: unknown;
}>;

export type ReportsTaxSummary = Record<string, unknown>;
export type ReportsAccountBalances = {
  result?: {
    totalBalance?: number;
    currency?: string;
    accountBreakdown?: Array<{
      name?: string;
      convertedBalance?: number;
      [key: string]: unknown;
    }>;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};
export type ReportsRevenueForecast = {
  result?: Array<Record<string, unknown>>;
  summary?: Record<string, unknown>;
  [key: string]: unknown;
};
export type ReportByLinkId = Record<string, unknown> | null;
export type ReportChartByLinkId = Record<string, unknown>;
export type CreatedReport = Record<string, unknown>;

export type CustomerTag = { id: string; name: string };

/** Matches legacy `customers.getById` / list row shape (camelCase). */
export type Customer = {
  id: string;
  name?: string | null;
  email?: string | null;
  billingEmail?: string | null;
  phone?: string | null;
  website?: string | null;
  country?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  note?: string | null;
  vatNumber?: string | null;
  countryCode?: string | null;
  portalEnabled?: boolean | null;
  portalId?: string | null;
  timezone?: string | null;
  tags?: CustomerTag[] | null;
  enrichmentStatus?: string | null;
  logoUrl?: string | null;
  token?: string | null;
  /** Enrichment + misc fields from API rows */
  [key: string]: any;
};

export type InboxAccount = {
  id: string;
  email: string;
  provider: "gmail" | "outlook" | string;
  lastAccessed?: string | null;
  status?: string | null;
  errorMessage?: string | null;
};

export type OAuthApplicationItem = {
  id: string;
  name: string;
  clientId?: string | null;
  description?: string | null;
  overview?: string | null;
  developerName?: string | null;
  logoUrl?: string | null;
  website?: string | null;
  installUrl?: string | null;
  status?: string | null;
  scopes?: string[];
  active?: boolean | null;
  [key: string]: unknown;
};

export type OAuthApplicationsList = { data: OAuthApplicationItem[] };
export type OAuthApplicationDetail = OAuthApplicationItem | null;
export type OAuthApplicationCreate = OAuthApplicationItem;
export type OAuthApplicationUpdate = OAuthApplicationItem;
export type OAuthApplicationDelete = { success?: boolean };
export type OAuthApplicationRegenerateSecret = {
  clientSecret?: string;
  [key: string]: unknown;
};
export type OAuthApplicationsAuthorized = {
  data: Array<Record<string, unknown>>;
};
export type OAuthApplicationRevokeAccess = { success?: boolean };
export type OAuthApplicationInfo = OAuthApplicationItem & {
  redirectUri?: string;
  state?: string;
};

export type InvoiceRecurringDetail = Record<string, unknown> | null;
export type InvoiceRecurringList = {
  meta?: {
    cursor?: string | null;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
  };
  data: Record<string, unknown>[];
};
export type InvoiceRecurringUpcoming = Record<string, unknown>[];
export type InvoiceRecurringResume = Record<string, unknown>;

export type TrackerEntryByDate = {
  id: string;
  date?: string | null;
  description?: string | null;
  duration?: number | null;
  start?: string | Date | null;
  stop?: string | Date | null;
  user?: {
    id: string;
    fullName?: string | null;
    avatarUrl?: string | null;
  } | null;
  trackerProject?: {
    id: string;
    name: string;
    currency?: string | null;
    rate?: number | null;
    customer?: { id: string; name: string } | null;
  } | null;
  [key: string]: unknown;
};

export type SearchAttachmentItem = Record<string, any>;

export type TrackerEntriesByRangeResult = Record<string, TrackerEntryByDate[]>;

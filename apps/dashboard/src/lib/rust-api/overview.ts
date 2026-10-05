import type { components } from "./openapi.generated";

export type OverviewSummary = {
  openInvoices: { count: number; totalAmount: number; currency: string };
  unbilledTime: {
    totalDuration: number;
    totalAmount: number;
    projectCount: number;
    currency: string;
  };
  inboxPending: { count: number };
  transactionsToReview: { count: number };
  cashBalance: { totalBalance: number; currency: string; accountCount: number };
  runway: number;
};

type RustOverviewSummary = components["schemas"]["OverviewSummary"];

export const overviewSummaryQueryKey = [
  "rust-api",
  "overview",
  "summary",
] as const;

export class RustApiError extends Error {
  data: { code: string };

  constructor(status: number, message: string) {
    super(message);
    this.name = "RustApiError";
    this.data = {
      code:
        status === 401
          ? "UNAUTHORIZED"
          : status === 403
            ? "FORBIDDEN"
            : status === 409
              ? "CONFLICT"
              : status === 404
                ? "NOT_FOUND"
                : "INTERNAL_SERVER_ERROR",
    };
  }
}

export function normalizeOverviewSummary(
  payload: RustOverviewSummary,
): OverviewSummary {
  return {
    openInvoices: {
      count: payload.open_invoices.count,
      totalAmount: payload.open_invoices.total_amount,
      currency: payload.open_invoices.currency,
    },
    unbilledTime: {
      totalDuration: payload.unbilled_time.total_duration,
      totalAmount: payload.unbilled_time.total_amount,
      projectCount: payload.unbilled_time.project_count,
      currency: payload.unbilled_time.currency,
    },
    inboxPending: { count: payload.inbox_pending.count },
    transactionsToReview: { count: payload.transactions_to_review.count },
    cashBalance: {
      totalBalance: payload.cash_balance.total_balance,
      currency: payload.cash_balance.currency,
      accountCount: payload.cash_balance.account_count,
    },
    runway: payload.runway,
  };
}

export async function fetchOverviewSummary(
  baseUrl: string,
  accessToken: string | null,
): Promise<OverviewSummary> {
  if (!accessToken) {
    throw new RustApiError(401, "Missing authorization token");
  }

  const response = await fetch(`${baseUrl}/api/v1/overview/summary`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return normalizeOverviewSummary(
    (await response.json()) as RustOverviewSummary,
  );
}

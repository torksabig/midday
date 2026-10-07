import type { DelegationFetch } from "../../../utils/delegation-fetch";
export type CheckInvoiceStatusRustBody = {
  executed: boolean;
  outcome: "skipped" | "paid" | "overdue" | "unchanged" | string;
  invoiceId: string;
  invoiceNumber?: string | null;
  status?: string | null;
  teamId?: string | null;
  customerName?: string | null;
  notify: boolean;
};

export type InvoiceStatusNotification = {
  invoiceId: string;
  invoiceNumber: string;
  status: "paid" | "overdue";
  teamId: string;
  customerName: string;
};

export function workerDelegationTarget(
  env: NodeJS.ProcessEnv = process.env,
): { mode: "dual" | "replacement"; url: string; token: string } | null {
  const mode = env.MIDDAY_BACKEND_MODE?.trim();
  const base = env.REPLACEMENT_API_URL?.trim().replace(/\/$/, "");
  const token = (env.MIDDAY_WORKER_TOKEN || env.REPLACEMENT_DELEGATION_TOKEN || "").trim();
  if ((mode !== "dual" && mode !== "replacement") || !base || !token) {
    return null;
  }
  return {
    mode,
    url: `${base}/api/v1/workers/check-invoice-status`,
    token,
  };
}

export function notificationFromRust(
  body: CheckInvoiceStatusRustBody,
): InvoiceStatusNotification | null {
  if (!body.notify) return null;
  if (body.status !== "paid" && body.status !== "overdue") return null;
  if (!body.invoiceNumber || !body.teamId || !body.customerName) return null;
  return {
    invoiceId: body.invoiceId,
    invoiceNumber: body.invoiceNumber,
    status: body.status,
    teamId: body.teamId,
    customerName: body.customerName,
  };
}

export async function postCheckInvoiceStatus(
  invoiceId: string,
  target: { url: string; token: string },
  fetchImpl: DelegationFetch = fetch,
): Promise<CheckInvoiceStatusRustBody> {
  const response = await fetchImpl(target.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${target.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ invoiceId }),
  });
  if (!response.ok) {
    throw new Error(`check-invoice-status rust failed: ${response.status}`);
  }
  return (await response.json()) as CheckInvoiceStatusRustBody;
}

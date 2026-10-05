import { getReplacementApiUrl } from "@midday/replacement-backend";

export type StoredInvoicePdfResult =
  | { kind: "pdf"; response: Response }
  | { kind: "needs_render" }
  | { kind: "not_found" }
  | { kind: "auth"; status: 401 | 403; message: string }
  | { kind: "error"; status: number; message: string };

/**
 * Try Rust `GET /files/download/invoice` for a stored vault PDF.
 * Drafts / missing `file_path` / receipts → `needs_render` (Node React-PDF).
 */
export async function fetchStoredInvoicePdfFromRust(
  search: string,
): Promise<StoredInvoicePdfResult> {
  const base = getReplacementApiUrl().replace(/\/$/, "");
  const qs = search.startsWith("?") ? search : `?${search}`;
  const res = await fetch(`${base}/files/download/invoice${qs}`, {
    method: "GET",
    signal: AbortSignal.timeout(30_000),
  });

  if (res.status === 200) {
    const headers = new Headers();
    for (const key of [
      "content-type",
      "content-disposition",
      "cache-control",
      "cross-origin-resource-policy",
    ]) {
      const value = res.headers.get(key);
      if (value) headers.set(key, value);
    }
    if (!headers.has("content-type")) {
      headers.set("content-type", "application/pdf");
    }
    return {
      kind: "pdf",
      response: new Response(res.body, { status: 200, headers }),
    };
  }

  let message = "";
  try {
    const body = (await res.json()) as {
      error?: { message?: string; code?: string } | string;
    };
    if (typeof body.error === "string") message = body.error;
    else if (body.error?.message) message = body.error.message;
  } catch {
    message = await res.text().catch(() => "");
  }

  const normalized = message.toLowerCase();

  if (res.status === 401 || res.status === 403) {
    return {
      kind: "auth",
      status: res.status as 401 | 403,
      message: message || "Unauthorized",
    };
  }

  if (
    res.status === 400 &&
    (normalized.includes("needs_render") || normalized.includes("receipt"))
  ) {
    return { kind: "needs_render" };
  }

  if (res.status === 404 && normalized.includes("no_stored_pdf")) {
    return { kind: "needs_render" };
  }

  if (res.status === 404) {
    return { kind: "not_found" };
  }

  return {
    kind: "error",
    status: res.status,
    message: message || `Rust invoice PDF HTTP ${res.status}`,
  };
}

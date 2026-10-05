import {
  getInvoiceFilesApiUrl,
  getVaultFilesApiUrl,
} from "@/lib/files-api-url";
import { saveFile } from "@/lib/save-file";

export type InvoicePdfQuery = {
  id?: string;
  token?: string;
  fk?: string;
  /** Receipts always need Node React-PDF. */
  type?: "invoice" | "receipt";
  preview?: boolean;
};

function buildInvoicePdfSearch(params: InvoicePdfQuery): string {
  const sp = new URLSearchParams();
  if (params.id) sp.set("id", params.id);
  if (params.token) sp.set("token", params.token);
  if (params.fk) sp.set("fk", params.fk);
  if (params.type && params.type !== "invoice") sp.set("type", params.type);
  if (params.preview) sp.set("preview", "true");
  return sp.toString();
}

/** True when Rust has no vault PDF (or receipt) and residual Node should React-PDF. */
export function shouldFallbackInvoicePdfToNode(
  status: number,
  bodyText: string,
): boolean {
  const normalized = bodyText.toLowerCase();
  if (status === 404 && normalized.includes("no_stored_pdf")) return true;
  if (
    status === 400 &&
    (normalized.includes("needs_render") || normalized.includes("receipt"))
  ) {
    return true;
  }
  // Rust unreachable / storage blip — Node may still React-PDF.
  if (status >= 500) return true;
  return false;
}

async function readErrorBody(res: Response): Promise<string> {
  try {
    const body = (await res.clone().json()) as {
      error?: { message?: string; code?: string } | string;
    };
    if (typeof body.error === "string") return body.error;
    if (body.error?.message) return body.error.message;
    if (body.error?.code) return body.error.code;
  } catch {
    // fall through to text
  }
  try {
    return await res.text();
  } catch {
    return "";
  }
}

type RustAttempt =
  | { kind: "pdf"; blob: Blob }
  | { kind: "fallback" }
  | { kind: "fatal"; message: string };

async function tryRustStoredPdf(qs: string): Promise<RustAttempt> {
  let rustRes: Response;
  try {
    rustRes = await fetch(
      `${getVaultFilesApiUrl()}/files/download/invoice?${qs}`,
    );
  } catch {
    // Network / CORS / Rust down → Node
    return { kind: "fallback" };
  }

  if (rustRes.ok) {
    return { kind: "pdf", blob: await rustRes.blob() };
  }

  const message = await readErrorBody(rustRes);

  if (rustRes.status === 401 || rustRes.status === 403) {
    return { kind: "fatal", message: message || "Unauthorized" };
  }

  if (shouldFallbackInvoicePdfToNode(rustRes.status, message)) {
    return { kind: "fallback" };
  }

  if (rustRes.status === 404) {
    return { kind: "fatal", message: message || "Invoice not found" };
  }

  return {
    kind: "fatal",
    message: message || `Invoice PDF failed: ${rustRes.status}`,
  };
}

/**
 * Blind invoice PDF fetch: try Rust stored vault PDF first, fall back to
 * residual Node React-PDF on `no_stored_pdf` / `needs_render` (or Rust down).
 * Receipts always hit Node.
 */
export async function fetchInvoicePdfBlob(
  params: InvoicePdfQuery,
): Promise<Blob> {
  const qs = buildInvoicePdfSearch(params);
  if (!qs) {
    throw new Error("Invoice PDF requires id+fk or token");
  }

  const isReceipt = params.type === "receipt";

  if (!isReceipt) {
    const rust = await tryRustStoredPdf(qs);
    if (rust.kind === "pdf") return rust.blob;
    if (rust.kind === "fatal") throw new Error(rust.message);
  }

  const nodeRes = await fetch(
    `${getInvoiceFilesApiUrl()}/files/download/invoice?${qs}`,
  );
  if (!nodeRes.ok) {
    const message = await readErrorBody(nodeRes);
    throw new Error(message || `Invoice PDF failed: ${nodeRes.status}`);
  }
  return nodeRes.blob();
}

/** Fetch invoice PDF (Rust→Node) and trigger a browser/desktop save. */
export async function downloadInvoicePdf(
  params: InvoicePdfQuery,
  filename: string,
): Promise<void> {
  const blob = await fetchInvoicePdfBlob(params);
  await saveFile(blob, filename);
}

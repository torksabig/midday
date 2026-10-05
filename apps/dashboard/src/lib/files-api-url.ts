/**
 * Vault proxy/download is served by the Rust API (`/files/proxy`, `/files/download/file`).
 * Stored invoice PDFs (`file_path` set) also hit Rust `/files/download/invoice` directly.
 * Blind downloads (token/zip without `file_path`) should use `fetchInvoicePdfBlob`
 * (Rust first, Node on `no_stored_pdf`). Receipts stay on residual Node React-PDF.
 */
export function getVaultFilesApiUrl(): string {
  const rust = process.env.NEXT_PUBLIC_RUST_API_URL?.replace(/\/$/, "");
  if (rust) return rust;
  if (process.env.NODE_ENV !== "production") return "http://127.0.0.1:8787";

  const node = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (node) return node;

  throw new Error(
    "NEXT_PUBLIC_RUST_API_URL (or NEXT_PUBLIC_API_URL) must be configured for vault files",
  );
}

/** Residual Node — React-PDF for drafts / receipts / no stored PDF. */
export function getInvoiceFilesApiUrl(): string {
  const node = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (node) return node;
  throw new Error("NEXT_PUBLIC_API_URL must be configured for invoice downloads");
}

/**
 * Prefer Rust when the UI already knows a stored vault `file_path` (skip Node hop).
 * Receipts and drafts without `file_path` stay on Node for live React-PDF.
 */
export function getInvoiceDownloadApiUrl(options?: {
  filePath?: string[] | string | null;
  isReceipt?: boolean;
}): string {
  if (options?.isReceipt) {
    return getInvoiceFilesApiUrl();
  }
  if (hasStoredInvoiceFilePath(options?.filePath)) {
    return getVaultFilesApiUrl();
  }
  return getInvoiceFilesApiUrl();
}

export function hasStoredInvoiceFilePath(
  filePath?: string[] | string | null,
): boolean {
  if (Array.isArray(filePath)) {
    return filePath.length > 0 && filePath.every((p) => typeof p === "string");
  }
  return typeof filePath === "string" && filePath.length > 0;
}

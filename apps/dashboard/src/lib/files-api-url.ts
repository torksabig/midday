/**
 * Vault proxy/download is served by the Rust API (`/files/proxy`, `/files/download/file`).
 * Invoice PDF generation remains on residual Node (`/files/download/invoice`).
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

export function getInvoiceFilesApiUrl(): string {
  const node = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (node) return node;
  throw new Error("NEXT_PUBLIC_API_URL must be configured for invoice downloads");
}

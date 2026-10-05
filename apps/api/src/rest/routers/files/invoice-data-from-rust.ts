import {
  getReplacementApiUrl,
  mapReplacementToInvoiceById,
} from "@midday/replacement-backend";

/**
 * Fetch invoice JSON for React-PDF from Rust (`GET /files/invoice-data`).
 * SQL + token/fk auth live on clone; Node only renders.
 */
export async function fetchInvoiceDataFromRust(params: {
  id?: string;
  token?: string;
  fk?: string;
}): Promise<unknown | null> {
  const base = getReplacementApiUrl().replace(/\/$/, "");
  const search = new URLSearchParams();
  if (params.id) search.set("id", params.id);
  if (params.token) search.set("token", params.token);
  if (params.fk) search.set("fk", params.fk);

  const res = await fetch(`${base}/files/invoice-data?${search}`, {
    method: "GET",
    signal: AbortSignal.timeout(15_000),
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Rust invoice-data HTTP ${res.status}${text ? `: ${text}` : ""}`,
    );
  }

  return mapReplacementToInvoiceById(await res.json());
}

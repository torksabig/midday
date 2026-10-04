import { getReplacementApiUrl } from "@midday/replacement-backend";
import type { Context } from "hono";

/**
 * Thin residual Node `/files/proxy` + `/files/download/file` by streaming from Rust.
 * Invoice PDF stays local (React PDF render).
 */
export async function forwardVaultFileToRust(c: Context): Promise<Response> {
  const base = getReplacementApiUrl();
  const url = new URL(c.req.url);
  const target = `${base}${url.pathname}${url.search}`;
  const upstream = await fetch(target, {
    method: "GET",
    headers: {
      // File auth is query `fk`; forward Accept for content negotiation.
      Accept: c.req.header("Accept") ?? "*/*",
    },
  });

  const headers = new Headers();
  const pass = [
    "content-type",
    "content-disposition",
    "cache-control",
    "cross-origin-resource-policy",
  ];
  for (const key of pass) {
    const value = upstream.headers.get(key);
    if (value) headers.set(key, value);
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers,
  });
}

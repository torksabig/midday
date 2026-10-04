"use client";

import { getAccessToken } from "@/utils/session";
import {
  createShortLinkForDocument,
  type CreateShortLinkForDocumentInput,
  type ShortLink,
} from "./short-links";

function getRustApiUrl() {
  const url = process.env.NEXT_PUBLIC_RUST_API_URL;

  if (url) return url.replace(/\/$/, "");
  if (process.env.NODE_ENV !== "production") return "http://127.0.0.1:8787";

  throw new Error("NEXT_PUBLIC_RUST_API_URL must be configured");
}

export async function createShortLinkForDocumentFromRust(
  input: CreateShortLinkForDocumentInput,
): Promise<ShortLink> {
  return createShortLinkForDocument(
    getRustApiUrl(),
    await getAccessToken(),
    input,
  );
}

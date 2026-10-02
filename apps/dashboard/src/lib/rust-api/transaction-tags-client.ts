"use client";

import { getAccessToken } from "@/utils/session";
import {
  createTransactionTag,
  deleteTransactionTag,
  type TransactionTagInput,
} from "./transaction-tags";

function getRustApiUrl() {
  const url = process.env.NEXT_PUBLIC_RUST_API_URL;

  if (url) return url.replace(/\/$/, "");
  if (process.env.NODE_ENV !== "production") return "http://127.0.0.1:8787";

  throw new Error("NEXT_PUBLIC_RUST_API_URL must be configured");
}

export async function createTransactionTagFromRust(input: TransactionTagInput) {
  return createTransactionTag(getRustApiUrl(), await getAccessToken(), input);
}

export async function deleteTransactionTagFromRust(input: TransactionTagInput) {
  return deleteTransactionTag(getRustApiUrl(), await getAccessToken(), input);
}

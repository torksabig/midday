"use client";

import { getAccessToken } from "@/utils/session";
import {
  type CreateAttachmentsInput,
  type CreateAttachmentsResult,
  type DeleteAttachmentInput,
  type DeleteAttachmentResult,
  createTransactionAttachments,
  deleteTransactionAttachment,
} from "./transaction-attachments";

function getRustApiUrl() {
  const url = process.env.NEXT_PUBLIC_RUST_API_URL;

  if (url) return url.replace(/\/$/, "");
  if (process.env.NODE_ENV !== "production") return "http://127.0.0.1:8787";

  throw new Error("NEXT_PUBLIC_RUST_API_URL must be configured");
}

export async function createTransactionAttachmentsFromRust(
  input: CreateAttachmentsInput,
): Promise<CreateAttachmentsResult> {
  return createTransactionAttachments(
    getRustApiUrl(),
    await getAccessToken(),
    input,
  );
}

export async function deleteTransactionAttachmentFromRust(
  input: DeleteAttachmentInput,
): Promise<DeleteAttachmentResult> {
  return deleteTransactionAttachment(
    getRustApiUrl(),
    await getAccessToken(),
    input,
  );
}

import type { RouterInputs, RouterOutputs } from "@api/trpc/routers/_app";
import type { components } from "./openapi.generated";
import { RustApiError } from "./overview";

type RawTransactionAttachment = components["schemas"]["TransactionAttachment"];

export type CreateAttachmentsInput =
  RouterInputs["transactionAttachments"]["createMany"];
export type DeleteAttachmentInput =
  RouterInputs["transactionAttachments"]["delete"];
export type CreateAttachmentsResult =
  RouterOutputs["transactionAttachments"]["createMany"];
export type DeleteAttachmentResult =
  RouterOutputs["transactionAttachments"]["delete"];

function snakeToCamelKey(key: string): string {
  return key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
}

export function deepCamelCaseKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(deepCamelCaseKeys);
  }
  if (value && typeof value === "object" && !(value instanceof Date)) {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nested]) => [
        snakeToCamelKey(key),
        deepCamelCaseKeys(nested),
      ]),
    );
  }
  return value;
}

export function normalizeTransactionAttachment(
  payload: RawTransactionAttachment | Record<string, unknown>,
): CreateAttachmentsResult[number] {
  return deepCamelCaseKeys(payload) as CreateAttachmentsResult[number];
}

export function normalizeTransactionAttachments(
  payload: Array<RawTransactionAttachment | Record<string, unknown>>,
): CreateAttachmentsResult {
  return (payload ?? []).map((row) => normalizeTransactionAttachment(row));
}

export async function createTransactionAttachments(
  baseUrl: string,
  accessToken: string | null,
  input: CreateAttachmentsInput,
): Promise<CreateAttachmentsResult> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(`${baseUrl}/api/v1/transaction-attachments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ attachments: input }),
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return normalizeTransactionAttachments(
    (await response.json()) as RawTransactionAttachment[],
  );
}

export async function deleteTransactionAttachment(
  baseUrl: string,
  accessToken: string | null,
  input: DeleteAttachmentInput,
): Promise<DeleteAttachmentResult> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const id = typeof input === "string" ? input : input.id;
  const response = await fetch(
    `${baseUrl}/api/v1/transaction-attachments/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(8_000),
    },
  );

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return normalizeTransactionAttachment(
    (await response.json()) as RawTransactionAttachment,
  ) as DeleteAttachmentResult;
}

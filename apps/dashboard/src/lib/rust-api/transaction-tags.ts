import type { components } from "./openapi.generated";
import { RustApiError } from "./overview";

type TransactionTagBody = components["schemas"]["TransactionTagBody"];
type TransactionTagRow = components["schemas"]["TransactionTagRow"];
type TransactionTagDeleteResponse =
  components["schemas"]["TransactionTagDeleteResponse"];

export type TransactionTagInput = {
  transactionId: string;
  tagId: string;
};

export type CreatedTransactionTag = {
  id: string;
  createdAt: string;
  teamId: string;
  transactionId: string;
  tagId: string;
};

export type DeletedTransactionTag = {
  rowCount: number;
};

async function sendTransactionTagRequest<T>(
  baseUrl: string,
  accessToken: string | null,
  method: "POST" | "DELETE",
  input: TransactionTagInput,
): Promise<T> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const body: TransactionTagBody = {
    transactionId: input.transactionId,
    tagId: input.tagId,
  };

  const response = await fetch(`${baseUrl}/api/v1/transaction-tags`, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return (await response.json()) as T;
}

export async function createTransactionTag(
  baseUrl: string,
  accessToken: string | null,
  input: TransactionTagInput,
): Promise<CreatedTransactionTag[]> {
  const payload = await sendTransactionTagRequest<TransactionTagRow[]>(
    baseUrl,
    accessToken,
    "POST",
    input,
  );

  return payload.map((row) => ({
    id: row.id,
    createdAt: row.createdAt,
    teamId: row.teamId,
    transactionId: row.transactionId,
    tagId: row.tagId,
  }));
}

export async function deleteTransactionTag(
  baseUrl: string,
  accessToken: string | null,
  input: TransactionTagInput,
): Promise<DeletedTransactionTag> {
  const payload = await sendTransactionTagRequest<TransactionTagDeleteResponse>(
    baseUrl,
    accessToken,
    "DELETE",
    input,
  );

  return { rowCount: payload.rowCount };
}

import { expect, test } from "bun:test";
import {
  normalizeTransactionAttachment,
  normalizeTransactionAttachments,
} from "./transaction-attachments";

test("normalizeTransactionAttachment maps snake_case and camelCase", () => {
  expect(
    normalizeTransactionAttachment({
      id: "a-1",
      created_at: "2026-01-01T00:00:00Z",
      type: "application/pdf",
      name: "receipt.pdf",
      size: 1024,
      path: ["team", "transactions", "tx", "receipt.pdf"],
      transaction_id: "tx-1",
      team_id: "team-1",
    }),
  ).toMatchObject({
    id: "a-1",
    createdAt: "2026-01-01T00:00:00Z",
    type: "application/pdf",
    name: "receipt.pdf",
    size: 1024,
    path: ["team", "transactions", "tx", "receipt.pdf"],
    transactionId: "tx-1",
    teamId: "team-1",
  });
});

test("normalizeTransactionAttachments maps list payloads", () => {
  expect(
    normalizeTransactionAttachments([
      {
        id: "a-2",
        name: "scan.png",
        createdAt: "2026-02-01T00:00:00Z",
      },
    ]),
  ).toEqual([
    {
      id: "a-2",
      name: "scan.png",
      createdAt: "2026-02-01T00:00:00Z",
    },
  ]);
});

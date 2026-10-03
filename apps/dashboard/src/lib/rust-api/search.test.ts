import { expect, test } from "bun:test";
import {
  buildGlobalSearchQuery,
  buildSearchAttachmentsQuery,
  normalizeGlobalSearchRows,
} from "./search";

test("buildGlobalSearchQuery encodes camelCase query params", () => {
  expect(buildGlobalSearchQuery({ searchTerm: "" })).toBe("");
  expect(
    buildGlobalSearchQuery({
      searchTerm: "acme",
      language: "english",
      limit: 20,
      itemsPerTableLimit: 5,
      relevanceThreshold: 0.1,
    }),
  ).toBe(
    "?searchTerm=acme&language=english&limit=20&itemsPerTableLimit=5&relevanceThreshold=0.1",
  );
});

test("normalizeGlobalSearchRows keeps created_at snake_case", () => {
  expect(
    normalizeGlobalSearchRows([
      {
        id: "1",
        type: "transaction",
        title: "Coffee",
        relevance: 0.9,
        created_at: "2026-01-01T00:00:00Z",
        data: { amount: 12 },
      },
    ]),
  ).toEqual([
    {
      id: "1",
      type: "transaction",
      title: "Coffee",
      relevance: 0.9,
      created_at: "2026-01-01T00:00:00Z",
      data: { amount: 12 },
    },
  ]);
});

test("buildSearchAttachmentsQuery encodes camelCase filters", () => {
  expect(buildSearchAttachmentsQuery({})).toBe("");
  expect(
    buildSearchAttachmentsQuery({
      q: "receipt",
      transactionId: "tx-1",
      limit: 30,
    }),
  ).toBe("?q=receipt&transactionId=tx-1&limit=30");
});

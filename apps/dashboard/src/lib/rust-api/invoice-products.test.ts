import { expect, test } from "bun:test";
import {
  buildInvoiceProductsListQuery,
  normalizeInvoiceProduct,
  normalizeInvoiceProducts,
  normalizeSaveLineItemAsProduct,
} from "./invoice-products";

test("buildInvoiceProductsListQuery encodes camelCase filters", () => {
  expect(
    buildInvoiceProductsListQuery({
      sortBy: "recent",
      limit: 100,
      includeInactive: true,
      currency: "USD",
    }),
  ).toBe("?sortBy=recent&limit=100&includeInactive=true&currency=USD");
});

test("normalizeInvoiceProduct maps snake_case and camelCase to tRPC shape", () => {
  expect(
    normalizeInvoiceProduct({
      id: "p-1",
      name: "Design",
      created_at: "2026-01-01T00:00:00Z",
      team_id: "t-1",
      is_active: true,
      usage_count: 3,
      tax_rate: 25,
      last_used_at: null,
    }),
  ).toMatchObject({
    id: "p-1",
    name: "Design",
    createdAt: "2026-01-01T00:00:00Z",
    teamId: "t-1",
    isActive: true,
    usageCount: 3,
    taxRate: 25,
    lastUsedAt: null,
  });

  expect(
    normalizeInvoiceProducts([
      {
        id: "p-2",
        name: "Dev",
        createdAt: "2026-02-01T00:00:00Z",
        isActive: false,
        usageCount: 0,
      },
    ]),
  ).toEqual([
    {
      id: "p-2",
      name: "Dev",
      createdAt: "2026-02-01T00:00:00Z",
      isActive: false,
      usageCount: 0,
    },
  ]);
});

test("normalizeSaveLineItemAsProduct preserves product link flags", () => {
  expect(
    normalizeSaveLineItemAsProduct({
      product: {
        id: "p-3",
        name: "Retainer",
        price: 1000,
      },
      shouldClearProductId: false,
    }),
  ).toEqual({
    product: {
      id: "p-3",
      name: "Retainer",
      price: 1000,
    },
    shouldClearProductId: false,
  });

  expect(
    normalizeSaveLineItemAsProduct({
      product: null,
      should_clear_product_id: true,
    }),
  ).toEqual({
    product: null,
    shouldClearProductId: true,
  });
});

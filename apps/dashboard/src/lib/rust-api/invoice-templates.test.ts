import { expect, test } from "bun:test";
import {
  deepCamelCaseKeys,
  normalizeDeleteInvoiceTemplate,
  normalizeInvoiceTemplate,
  normalizeInvoiceTemplates,
} from "./invoice-templates";

test("normalizeInvoiceTemplate maps snake_case SQL payload to tRPC shape", () => {
  expect(
    normalizeInvoiceTemplate({
      id: "t-1",
      name: "Standard",
      is_default: true,
      customer_label: "Bill to",
      payment_terms_days: 30,
      include_vat: true,
      tax_rate: 25,
      payment_details: { type: "doc" },
    }),
  ).toMatchObject({
    id: "t-1",
    name: "Standard",
    isDefault: true,
    customerLabel: "Bill to",
    paymentTermsDays: 30,
    includeVat: true,
    taxRate: 25,
    paymentDetails: { type: "doc" },
  });
});

test("normalizeInvoiceTemplates maps list payloads", () => {
  expect(
    normalizeInvoiceTemplates([
      {
        id: "t-2",
        name: "Consulting",
        isDefault: false,
      },
    ]),
  ).toEqual([
    {
      id: "t-2",
      name: "Consulting",
      isDefault: false,
    },
  ]);
});

test("normalizeDeleteInvoiceTemplate maps new_default", () => {
  expect(
    normalizeDeleteInvoiceTemplate({
      deleted: { id: "t-old", name: "Old", is_default: true },
      new_default: { id: "t-new", name: "New", is_default: true },
    }),
  ).toEqual({
    deleted: { id: "t-old", name: "Old", isDefault: true },
    newDefault: { id: "t-new", name: "New", isDefault: true },
  });
});

test("deepCamelCaseKeys is idempotent for camelCase keys", () => {
  expect(deepCamelCaseKeys({ isDefault: true, logoUrl: null })).toEqual({
    isDefault: true,
    logoUrl: null,
  });
});

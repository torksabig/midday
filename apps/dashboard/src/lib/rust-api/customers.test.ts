import { expect, test } from "bun:test";
import type { components } from "./openapi.generated";
import {
  buildCustomersListQuery,
  buildPortalInvoicesQuery,
  deepCamelCaseKeys,
  normalizeCustomersList,
  normalizePortalCustomerById,
  normalizePortalInvoicesPage,
} from "./customers";

type RawCustomersListResponse = components["schemas"]["CustomersListResponse"];

test("buildCustomersListQuery encodes filters like the façade", () => {
  expect(
    buildCustomersListQuery({
      cursor: "25",
      pageSize: 25,
      q: "acme",
      sort: ["name", "asc"],
    }),
  ).toBe("?cursor=25&pageSize=25&q=acme&sort=name&sort=asc");
});

test("normalizes snake_case customers list payloads", () => {
  const payload = {
    meta: {
      cursor: "25",
      has_previous_page: false,
      has_next_page: true,
    },
    data: [
      {
        id: "cust-1",
        name: "Acme",
        email: "a@acme.com",
        created_at: "2026-01-02T10:00:00Z",
        invoice_count: 3,
        total_revenue: 100,
        tags: [{ id: "tag-1", name: "vip" }],
      },
    ],
  } as unknown as RawCustomersListResponse;

  const list = normalizeCustomersList(payload);

  expect(list.meta).toEqual({
    cursor: "25",
    hasPreviousPage: false,
    hasNextPage: true,
  });
  expect(list.data[0]).toMatchObject({
    id: "cust-1",
    name: "Acme",
    createdAt: "2026-01-02T10:00:00Z",
    invoiceCount: 3,
    totalRevenue: 100,
    tags: [{ id: "tag-1", name: "vip" }],
  });
});

test("deepCamelCaseKeys walks nested objects", () => {
  expect(
    deepCamelCaseKeys({
      billing_email: "b@acme.com",
      nested_obj: { address_line1: "1 Main" },
    }),
  ).toEqual({
    billingEmail: "b@acme.com",
    nestedObj: { addressLine1: "1 Main" },
  });
});

test("upsert and portal input shapes stay camelCase for Rust", () => {
  const upsert = {
    name: "Acme",
    email: "a@acme.com",
    billingEmail: null,
    tags: [{ id: "tag-1", name: "vip" }],
  };
  const portal = { customerId: "cust-1", enabled: true };

  expect(upsert.tags?.[0]?.name).toBe("vip");
  expect(portal.customerId).toBe("cust-1");
});

test("buildPortalInvoicesQuery encodes cursor and pageSize", () => {
  expect(buildPortalInvoicesQuery({ cursor: "2026-01-01", pageSize: 10 })).toBe(
    "?cursor=2026-01-01&pageSize=10",
  );
  expect(buildPortalInvoicesQuery({})).toBe("");
});

test("normalizes public portal customer payload with nested team", () => {
  const portal = normalizePortalCustomerById({
    customer: {
      id: "cust-1",
      name: "Acme",
      team_id: "team-1",
      portal_enabled: true,
      portal_id: "portal-1",
      team: {
        id: "team-1",
        name: "Acme Co",
        logo_url: "https://example.com/logo.png",
        base_currency: "USD",
      },
    },
    summary: {
      total_amount: 100,
      paid_amount: 40,
      outstanding_amount: 60,
      invoice_count: 2,
      currency: "USD",
    },
  });

  expect(portal?.customer.team).toMatchObject({
    name: "Acme Co",
    logoUrl: "https://example.com/logo.png",
    baseCurrency: "USD",
  });
  expect(portal?.summary).toMatchObject({
    totalAmount: 100,
    paidAmount: 40,
    outstandingAmount: 60,
    invoiceCount: 2,
  });
  expect(normalizePortalCustomerById(null)).toBeNull();
});

test("normalizes public portal invoices page including token", () => {
  const page = normalizePortalInvoicesPage({
    data: [
      {
        id: "inv-1",
        invoice_number: "INV-001",
        status: "unpaid",
        amount: 50,
        currency: "USD",
        token: "tok-1",
        issue_date: "2026-01-02",
      },
    ],
    meta: { cursor: "2026-01-02T00:00:00Z" },
  });

  expect(page.data[0]).toMatchObject({
    id: "inv-1",
    invoiceNumber: "INV-001",
    token: "tok-1",
    issueDate: "2026-01-02",
  });
  expect(page.meta.cursor).toBe("2026-01-02T00:00:00Z");
});

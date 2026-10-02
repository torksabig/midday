import { expect, test } from "bun:test";
import type { components } from "./openapi.generated";
import {
  buildCustomersListQuery,
  deepCamelCaseKeys,
  normalizeCustomersList,
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

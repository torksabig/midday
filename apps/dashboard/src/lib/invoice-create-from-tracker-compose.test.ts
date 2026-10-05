import { expect, test } from "bun:test";
import {
  composeInvoiceDraftFromTracker,
  CreateFromTrackerError,
} from "./invoice-create-from-tracker-compose";

const baseSettings = {
  nextInvoiceNumber: "INV-0042",
  team: { id: "team-1", baseCurrency: "EUR" },
  user: { id: "user-1", dateFormat: "yyyy-MM-dd" },
  template: {
    paymentTermsDays: 14,
    deliveryType: "create",
    size: "a4",
  },
};

test("composeInvoiceDraftFromTracker builds line item from tracker hours", () => {
  const draft = composeInvoiceDraftFromTracker({
    input: {
      projectId: "proj-1",
      dateFrom: "2026-01-01",
      dateTo: "2026-01-31",
    },
    project: {
      id: "proj-1",
      name: "Website",
      billable: true,
      rate: 100,
      currency: "usd",
      customerId: "cust-1",
    },
    trackerData: {
      result: {
        "2026-01-02": [{ id: "e1", duration: 7200 }],
      },
    },
    settings: baseSettings,
    teamId: "team-1",
    userId: "user-1",
    customer: { name: "Acme Corp" },
  });

  expect(draft.invoiceNumber).toBe("INV-0042");
  expect(draft.currency).toBe("USD");
  expect(draft.amount).toBe(200);
  expect(draft.lineItems).toEqual([
    {
      name: "Website (2026-01-01 - 2026-01-31)",
      quantity: 2,
      price: 100,
      vat: 0,
    },
  ]);
  expect(draft.customerName).toBe("Acme Corp");
});

test("composeInvoiceDraftFromTracker rejects non-billable projects", () => {
  expect(() =>
    composeInvoiceDraftFromTracker({
      input: {
        projectId: "proj-1",
        dateFrom: "2026-01-01",
        dateTo: "2026-01-31",
      },
      project: {
        id: "proj-1",
        name: "Internal",
        billable: false,
        rate: 50,
      },
      trackerData: { result: {} },
      settings: baseSettings,
      teamId: "team-1",
      userId: "user-1",
    }),
  ).toThrow(new CreateFromTrackerError("PROJECT_NOT_BILLABLE"));
});

test("composeInvoiceDraftFromTracker rejects zero tracked hours", () => {
  expect(() =>
    composeInvoiceDraftFromTracker({
      input: {
        projectId: "proj-1",
        dateFrom: "2026-01-01",
        dateTo: "2026-01-31",
      },
      project: {
        id: "proj-1",
        name: "Website",
        billable: true,
        rate: 80,
      },
      trackerData: { result: { "2026-01-01": [{ id: "e1", duration: 0 }] } },
      settings: baseSettings,
      teamId: "team-1",
      userId: "user-1",
    }),
  ).toThrow(new CreateFromTrackerError("NO_TRACKED_HOURS"));
});

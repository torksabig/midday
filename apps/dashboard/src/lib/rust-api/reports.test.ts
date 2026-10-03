import { expect, test } from "bun:test";
import {
  buildReportDateRangeQuery,
  deepCamelCaseKeys,
  normalizeCreatedReport,
  normalizePublicReport,
} from "./reports";

test("buildReportDateRangeQuery encodes filters", () => {
  expect(
    buildReportDateRangeQuery({
      from: "2026-01-01",
      to: "2026-03-31",
      currency: "USD",
      revenueType: "net",
    }),
  ).toBe("?from=2026-01-01&to=2026-03-31&currency=USD&revenueType=net");
});

test("deepCamelCaseKeys normalizes report chart payloads", () => {
  expect(
    deepCamelCaseKeys({
      summary: { current_total: 10, prev_total: 5, currency: "USD" },
      result: [{ date: "2026-01-01", current: { value: 10 } }],
    }),
  ).toEqual({
    summary: { currentTotal: 10, prevTotal: 5, currency: "USD" },
    result: [{ date: "2026-01-01", current: { value: 10 } }],
  });
});

test("normalizePublicReport and created report preserve linkId", () => {
  expect(
    normalizePublicReport({
      id: "r-1",
      linkId: "abc",
      type: "revenue",
      team_name: "Acme",
    }),
  ).toMatchObject({
    id: "r-1",
    linkId: "abc",
    type: "revenue",
    teamName: "Acme",
  });

  expect(normalizePublicReport(null)).toBeNull();

  expect(
    normalizeCreatedReport({
      id: "r-2",
      link_id: "xyz",
      type: "profit",
    }),
  ).toMatchObject({
    id: "r-2",
    linkId: "xyz",
    type: "profit",
  });
});

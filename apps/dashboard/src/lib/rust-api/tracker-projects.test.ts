import { expect, test } from "bun:test";
import {
  buildTrackerProjectsListQuery,
  normalizeTrackerProject,
  normalizeTrackerProjectsList,
} from "./tracker-projects";

test("buildTrackerProjectsListQuery encodes filters", () => {
  expect(
    buildTrackerProjectsListQuery({
      pageSize: 25,
      q: "build",
      status: "in_progress",
      customers: ["c1"],
      tags: ["t1"],
      sort: ["name", "asc"],
    }),
  ).toBe(
    "?pageSize=25&q=build&status=in_progress&customers=c1&tags=t1&sort=name&sort=asc",
  );
  expect(buildTrackerProjectsListQuery({})).toBe("");
});

test("normalizeTrackerProjectsList camelCases paginated payload", () => {
  expect(
    normalizeTrackerProjectsList({
      meta: {
        cursor: "25",
        has_previous_page: false,
        has_next_page: true,
      },
      data: [
        {
          id: "p1",
          name: "Build",
          customer_id: "c1",
          customer: { id: "c1", name: "Acme" },
        },
      ],
    }),
  ).toEqual({
    meta: {
      cursor: "25",
      hasPreviousPage: false,
      hasNextPage: true,
    },
    data: [
      {
        id: "p1",
        name: "Build",
        customerId: "c1",
        customer: { id: "c1", name: "Acme" },
      },
    ],
  });
});

test("normalizeTrackerProject camelCases detail payload", () => {
  expect(
    normalizeTrackerProject({
      id: "p1",
      customer_id: "c1",
      total_duration: 3600,
    }),
  ).toEqual({
    id: "p1",
    customerId: "c1",
    totalDuration: 3600,
  });
});

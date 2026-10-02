import { expect, test } from "bun:test";
import {
  buildTrackerEntriesByDateQuery,
  buildTrackerEntriesByRangeQuery,
  buildTrackerTimerQuery,
  deepCamelCaseKeys,
} from "./tracker-entries";

test("buildTrackerTimerQuery encodes assignedId", () => {
  expect(buildTrackerTimerQuery({ assignedId: "user-1" })).toBe(
    "?assignedId=user-1",
  );
  expect(buildTrackerTimerQuery({})).toBe("");
});

test("buildTrackerEntriesByRangeQuery encodes range filters", () => {
  expect(
    buildTrackerEntriesByRangeQuery({
      from: "2026-01-01",
      to: "2026-01-07",
      projectId: "proj-1",
    }),
  ).toBe("?from=2026-01-01&to=2026-01-07&projectId=proj-1");
});

test("buildTrackerEntriesByDateQuery encodes date filters", () => {
  expect(
    buildTrackerEntriesByDateQuery({
      date: "2026-01-02",
      projectId: "proj-1",
    }),
  ).toBe("?date=2026-01-02&projectId=proj-1");
});

test("deepCamelCaseKeys normalizes timer status payloads", () => {
  expect(
    deepCamelCaseKeys({
      is_running: true,
      elapsed_time: 12,
      current_entry: {
        project_id: "proj-1",
        tracker_project: { id: "proj-1", name: "Build" },
      },
    }),
  ).toEqual({
    isRunning: true,
    elapsedTime: 12,
    currentEntry: {
      projectId: "proj-1",
      trackerProject: { id: "proj-1", name: "Build" },
    },
  });
});

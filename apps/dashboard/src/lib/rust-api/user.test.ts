import { expect, test } from "bun:test";
import { normalizeSwitchTeam } from "./user";

test("normalizeSwitchTeam maps switch payload", () => {
  expect(
    normalizeSwitchTeam({
      id: "user-1",
      teamId: "team-2",
      previousTeamId: "team-1",
    }),
  ).toEqual({
    id: "user-1",
    teamId: "team-2",
    previousTeamId: "team-1",
  });
});

import { afterEach, describe, expect, it } from "bun:test";
import { isBlockedNewUser, NEW_USER_CUTOFF } from "./new-user-gate";

const originalNodeEnv = process.env.NODE_ENV;

afterEach(() => {
  process.env.NODE_ENV = originalNodeEnv;
});

describe("isBlockedNewUser", () => {
  it("blocks users created on or after the cutoff outside development", () => {
    process.env.NODE_ENV = "production";

    expect(isBlockedNewUser(NEW_USER_CUTOFF)).toBe(true);
  });

  it("does not block new users in local development", () => {
    process.env.NODE_ENV = "development";

    expect(isBlockedNewUser(NEW_USER_CUTOFF)).toBe(false);
  });

  it("does not block when the creation date is missing", () => {
    process.env.NODE_ENV = "production";

    expect(isBlockedNewUser(undefined)).toBe(false);
  });
});

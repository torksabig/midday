import { afterEach, describe, expect, it } from "bun:test";
import { isBlockedNewUser, NEW_USER_CUTOFF } from "./new-user-gate";

function setNodeEnv(value: string) {
  Object.defineProperty(process.env, "NODE_ENV", {
    value,
    configurable: true,
    writable: true,
  });
}

const originalNodeEnv = process.env.NODE_ENV;

afterEach(() => {
  setNodeEnv(originalNodeEnv ?? "test");
});

describe("isBlockedNewUser", () => {
  it("blocks users created on or after the cutoff outside development", () => {
    setNodeEnv("production");

    expect(isBlockedNewUser(NEW_USER_CUTOFF)).toBe(true);
  });

  it("does not block new users in local development", () => {
    setNodeEnv("development");

    expect(isBlockedNewUser(NEW_USER_CUTOFF)).toBe(false);
  });

  it("does not block when the creation date is missing", () => {
    setNodeEnv("production");

    expect(isBlockedNewUser(undefined)).toBe(false);
  });
});

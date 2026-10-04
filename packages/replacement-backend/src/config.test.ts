import { afterEach, describe, expect, test } from "bun:test";
import {
  getBackendMode,
  getReplacementApiUrl,
  shouldDelegateToReplacementBackend,
  shouldProbeReplacementBackend,
} from "./config";

const env = process.env;

afterEach(() => {
  process.env = { ...env };
});

describe("replacement backend config", () => {
  test("defaults to replacement mode (Stage 4)", () => {
    delete process.env.MIDDAY_BACKEND_MODE;
    expect(getBackendMode()).toBe("replacement");
    expect(shouldProbeReplacementBackend()).toBe(true);
    expect(shouldDelegateToReplacementBackend()).toBe(true);
  });

  test("dual mode enables probing", () => {
    process.env.MIDDAY_BACKEND_MODE = "dual";
    expect(getBackendMode()).toBe("dual");
    expect(shouldProbeReplacementBackend()).toBe(true);
    expect(shouldDelegateToReplacementBackend()).toBe(true);
  });

  test("legacy mode does not delegate", () => {
    process.env.MIDDAY_BACKEND_MODE = "legacy";
    expect(shouldDelegateToReplacementBackend()).toBe(false);
  });

  test("normalizes replacement API URL", () => {
    process.env.REPLACEMENT_API_URL = "http://127.0.0.1:8787/";
    expect(getReplacementApiUrl()).toBe("http://127.0.0.1:8787");
  });
});

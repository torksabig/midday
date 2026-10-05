import { afterEach, describe, expect, test } from "bun:test";
import {
  extractBearerToken,
  formatVaultPresignedUrlResult,
  normalizeVaultObjectPath,
} from "../../rest/services/vault-presigned-url";

describe("REST vault presigned URL helpers", () => {
  afterEach(() => {
    // no env mutation in these unit tests
  });

  test("normalizeVaultObjectPath joins token arrays", () => {
    expect(normalizeVaultObjectPath(["team", "file.pdf"])).toBe("team/file.pdf");
    expect(normalizeVaultObjectPath("team/file.pdf")).toBe("team/file.pdf");
    expect(normalizeVaultObjectPath([])).toBeNull();
    expect(normalizeVaultObjectPath(null)).toBeNull();
  });

  test("extractBearerToken parses Authorization header", () => {
    expect(extractBearerToken("Bearer session-jwt")).toBe("session-jwt");
    expect(extractBearerToken(undefined)).toBeNull();
    expect(extractBearerToken("Basic abc")).toBeNull();
  });

  test("formatVaultPresignedUrlResult sets expiry metadata", () => {
    const now = Date.now();
    const result = formatVaultPresignedUrlResult(
      "https://signed.example/vault",
      60,
      "file.pdf",
    );
    expect(result.url).toBe("https://signed.example/vault");
    expect(result.fileName).toBe("file.pdf");
    const expiresMs = new Date(result.expiresAt).getTime();
    expect(expiresMs - now).toBeGreaterThanOrEqual(59_000);
    expect(expiresMs - now).toBeLessThanOrEqual(61_000);
  });
});

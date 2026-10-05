import { afterEach, describe, expect, test } from "bun:test";
import {
  getInvoiceDownloadApiUrl,
  getInvoiceFilesApiUrl,
  getVaultFilesApiUrl,
  hasStoredInvoiceFilePath,
} from "./files-api-url";

const envSnapshot = { ...process.env };

afterEach(() => {
  process.env = { ...envSnapshot };
});

describe("files-api-url invoice download routing", () => {
  test("hasStoredInvoiceFilePath accepts non-empty path arrays", () => {
    expect(
      hasStoredInvoiceFilePath(["team", "invoices", "INV.pdf"]),
    ).toBe(true);
    expect(hasStoredInvoiceFilePath([])).toBe(false);
    expect(hasStoredInvoiceFilePath(null)).toBe(false);
    expect(hasStoredInvoiceFilePath("team/invoices/INV.pdf")).toBe(true);
  });

  test("stored PDF uses Rust vault URL; drafts/receipts use Node", () => {
    process.env.NEXT_PUBLIC_RUST_API_URL = "http://127.0.0.1:8787";
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:3003";

    expect(
      getInvoiceDownloadApiUrl({
        filePath: ["team", "invoices", "INV.pdf"],
      }),
    ).toBe(getVaultFilesApiUrl());

    expect(getInvoiceDownloadApiUrl({})).toBe(getInvoiceFilesApiUrl());
    expect(
      getInvoiceDownloadApiUrl({
        filePath: ["team", "invoices", "INV.pdf"],
        isReceipt: true,
      }),
    ).toBe(getInvoiceFilesApiUrl());
  });
});

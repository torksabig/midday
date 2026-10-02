import { expect, test } from "bun:test";
import { slugifyDocumentTagName } from "./document-tags";

test("slugifyDocumentTagName lowercases and hyphenates", () => {
  expect(slugifyDocumentTagName("Invoice Receipt")).toBe("invoice-receipt");
  expect(slugifyDocumentTagName("  Tax_2024  ")).toBe("tax-2024");
});

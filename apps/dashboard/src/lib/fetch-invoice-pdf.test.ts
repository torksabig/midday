import { afterEach, describe, expect, mock, test } from "bun:test";
import {
  fetchInvoicePdfBlob,
  shouldFallbackInvoicePdfToNode,
} from "./fetch-invoice-pdf";

const envSnapshot = { ...process.env };

afterEach(() => {
  process.env = { ...envSnapshot };
  mock.restore();
});

describe("shouldFallbackInvoicePdfToNode", () => {
  test("falls back on no_stored_pdf and needs_render", () => {
    expect(shouldFallbackInvoicePdfToNode(404, "no_stored_pdf")).toBe(true);
    expect(
      shouldFallbackInvoicePdfToNode(404, '{"error":{"message":"no_stored_pdf"}}'),
    ).toBe(true);
    expect(shouldFallbackInvoicePdfToNode(400, "needs_render")).toBe(true);
    expect(shouldFallbackInvoicePdfToNode(500, "boom")).toBe(true);
  });

  test("does not fall back on auth or plain 404", () => {
    expect(shouldFallbackInvoicePdfToNode(401, "Unauthorized")).toBe(false);
    expect(shouldFallbackInvoicePdfToNode(404, "Invoice not found")).toBe(
      false,
    );
    expect(shouldFallbackInvoicePdfToNode(403, "forbidden")).toBe(false);
  });
});

describe("fetchInvoicePdfBlob", () => {
  test("returns Rust blob when stored PDF exists", async () => {
    process.env.NEXT_PUBLIC_RUST_API_URL = "http://127.0.0.1:8787";
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:3003";

    const rustBlob = new Blob(["rust-pdf"], { type: "application/pdf" });
    const fetchMock = mock((url: string | URL | Request) => {
      const href = String(url);
      if (href.includes("127.0.0.1:8787")) {
        return Promise.resolve(new Response(rustBlob, { status: 200 }));
      }
      return Promise.resolve(new Response("should-not-hit-node", { status: 500 }));
    });
    globalThis.fetch = fetchMock as typeof fetch;

    const blob = await fetchInvoicePdfBlob({ token: "tok-1" });
    expect(await blob.text()).toBe("rust-pdf");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test("falls back to Node on no_stored_pdf", async () => {
    process.env.NEXT_PUBLIC_RUST_API_URL = "http://127.0.0.1:8787";
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:3003";

    const nodeBlob = new Blob(["node-pdf"], { type: "application/pdf" });
    const fetchMock = mock((url: string | URL | Request) => {
      const href = String(url);
      if (href.includes("127.0.0.1:8787")) {
        return Promise.resolve(
          new Response(JSON.stringify({ error: { message: "no_stored_pdf" } }), {
            status: 404,
            headers: { "content-type": "application/json" },
          }),
        );
      }
      return Promise.resolve(new Response(nodeBlob, { status: 200 }));
    });
    globalThis.fetch = fetchMock as typeof fetch;

    const blob = await fetchInvoicePdfBlob({
      id: "inv-1",
      fk: "fk-1",
    });
    expect(await blob.text()).toBe("node-pdf");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  test("receipts skip Rust and hit Node", async () => {
    process.env.NEXT_PUBLIC_RUST_API_URL = "http://127.0.0.1:8787";
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:3003";

    const nodeBlob = new Blob(["receipt"], { type: "application/pdf" });
    const fetchMock = mock((url: string | URL | Request) => {
      const href = String(url);
      expect(href).toContain("localhost:3003");
      expect(href).toContain("type=receipt");
      return Promise.resolve(new Response(nodeBlob, { status: 200 }));
    });
    globalThis.fetch = fetchMock as typeof fetch;

    const blob = await fetchInvoicePdfBlob({
      token: "tok-1",
      type: "receipt",
    });
    expect(await blob.text()).toBe("receipt");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test("auth errors from Rust do not fall back", async () => {
    process.env.NEXT_PUBLIC_RUST_API_URL = "http://127.0.0.1:8787";
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:3003";

    globalThis.fetch = mock(() =>
      Promise.resolve(
        new Response(JSON.stringify({ error: { message: "Unauthorized" } }), {
          status: 401,
          headers: { "content-type": "application/json" },
        }),
      ),
    ) as typeof fetch;

    await expect(fetchInvoicePdfBlob({ token: "bad" })).rejects.toThrow(
      /Unauthorized/,
    );
  });
});

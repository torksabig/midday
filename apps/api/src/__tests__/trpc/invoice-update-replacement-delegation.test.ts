import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mocks } from "../setup";
import { createCallerFactory } from "../../trpc/init";
import { invoiceRouter } from "../../trpc/routers/invoice";
import { createTestContext } from "../helpers/test-context";

const createCaller = createCallerFactory(invoiceRouter);
const env = process.env;

describe("tRPC: invoice.update replacement delegation", () => {
  beforeEach(() => {
    mocks.updateInvoice.mockReset();
    process.env = {
      ...env,
      SUPABASE_URL: env.SUPABASE_URL ?? "https://test.supabase.co",
      MIDDAY_BACKEND_MODE: "dual",
      REPLACEMENT_DELEGATION_USE_DEMO: "true",
      REPLACEMENT_API_URL: "http://127.0.0.1:8787",
    };
  });

  afterEach(() => {
    process.env = { ...env };
  });

  test("returns mapped invoice when replacement API is reachable", async () => {
    const healthOk = await fetch("http://127.0.0.1:8787/api/v1/health", {
      signal: AbortSignal.timeout(500),
    })
      .then((r) => r.ok)
      .catch(() => false);

    if (!healthOk) {
      console.warn("skip: replacement API not running on :8787");
      return;
    }

    const listRes = await fetch(
      "http://127.0.0.1:8787/api/v1/invoices?pageSize=1",
      {
        headers: {
          Authorization: `Bearer ${await demoToken()}`,
        },
        signal: AbortSignal.timeout(2000),
      },
    );
    if (!listRes.ok) {
      console.warn("skip: could not list invoices from replacement API");
      return;
    }
    const list = (await listRes.json()) as { data?: Array<{ id: string }> };
    const id = list.data?.[0]?.id;
    if (!id) {
      console.warn("skip: no invoices in replacement API");
      return;
    }

    const caller = createCaller(createTestContext());
    const result = await caller.update({
      id,
      internalNote: "delegation-ap-14",
    });

    expect(result).toBeDefined();
    expect((result as { id?: string })?.id).toBe(id);
    expect(mocks.updateInvoice).not.toHaveBeenCalled();
  });

  test("replacement mode throws without calling Drizzle when API is down", async () => {
    process.env.MIDDAY_BACKEND_MODE = "replacement";
    delete process.env.REPLACEMENT_DELEGATION_USE_DEMO;
    process.env.REPLACEMENT_API_URL = "http://127.0.0.1:1";

    const caller = createCaller(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );

    await expect(
      caller.update({
        id: "b3b7c8e2-1f2a-4c3d-9e4f-5a6b7c8d9e0f",
        status: "paid",
      }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.updateInvoice).not.toHaveBeenCalled();
  });
});

async function demoToken(): Promise<string> {
  const loginRes = await fetch("http://127.0.0.1:8787/api/v1/auth/demo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: AbortSignal.timeout(2000),
  });
  const body = (await loginRes.json()) as { token?: string };
  return body.token ?? "";
}

import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mocks } from "../setup";
import { createCallerFactory } from "../../trpc/init";
import { documentTagsRouter } from "../../trpc/routers/document-tags";
import { createTestContext } from "../helpers/test-context";

const createCaller = createCallerFactory(documentTagsRouter);
const TAG_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const envSnapshot = { ...process.env };

describe("tRPC: documentTags mutations replacement delegation", () => {
  beforeEach(() => {
    mocks.createDocumentTag.mockReset();
    mocks.createDocumentTagEmbedding.mockReset();
    mocks.deleteDocumentTag.mockReset();
    process.env = {
      ...envSnapshot,
      SUPABASE_URL: envSnapshot.SUPABASE_URL ?? "https://test.supabase.co",
      MIDDAY_BACKEND_MODE: "dual",
      REPLACEMENT_DELEGATION_USE_DEMO: "true",
      REPLACEMENT_API_URL: "http://127.0.0.1:8787",
    };
  });

  afterEach(() => {
    process.env = { ...envSnapshot };
  });

  test("replacement mode create throws without calling Drizzle when API is down", async () => {
    process.env.MIDDAY_BACKEND_MODE = "replacement";
    delete process.env.REPLACEMENT_DELEGATION_USE_DEMO;
    process.env.REPLACEMENT_API_URL = "http://127.0.0.1:1";

    const caller = createCaller(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );

    await expect(caller.create({ name: "Important" })).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.createDocumentTag).not.toHaveBeenCalled();
  });

  test("replacement mode delete throws without calling Drizzle when API is down", async () => {
    process.env.MIDDAY_BACKEND_MODE = "replacement";
    delete process.env.REPLACEMENT_DELEGATION_USE_DEMO;
    process.env.REPLACEMENT_API_URL = "http://127.0.0.1:1";

    const caller = createCaller(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );

    await expect(caller.delete({ id: TAG_ID })).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.deleteDocumentTag).not.toHaveBeenCalled();
  });
});

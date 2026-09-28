import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mocks } from "../setup";
import { createCallerFactory } from "../../trpc/init";
import { documentTagAssignmentsRouter } from "../../trpc/routers/document-tag-assignments";
import { createTestContext } from "../helpers/test-context";

const createCaller = createCallerFactory(documentTagAssignmentsRouter);
const DOCUMENT_ID = "b2c3d4e5-f6a7-8901-bcde-f12345678901";
const TAG_ID = "c3d4e5f6-a7b8-9012-cdef-123456789012";
const envSnapshot = { ...process.env };

describe("tRPC: documentTagAssignments replacement delegation", () => {
  beforeEach(() => {
    mocks.createDocumentTagAssignment.mockReset();
    mocks.deleteDocumentTagAssignment.mockReset();
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

    await expect(
      caller.create({ documentId: DOCUMENT_ID, tagId: TAG_ID }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.createDocumentTagAssignment).not.toHaveBeenCalled();
  });

  test("replacement mode delete throws without calling Drizzle when API is down", async () => {
    process.env.MIDDAY_BACKEND_MODE = "replacement";
    delete process.env.REPLACEMENT_DELEGATION_USE_DEMO;
    process.env.REPLACEMENT_API_URL = "http://127.0.0.1:1";

    const caller = createCaller(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );

    await expect(
      caller.delete({ documentId: DOCUMENT_ID, tagId: TAG_ID }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.deleteDocumentTagAssignment).not.toHaveBeenCalled();
  });
});

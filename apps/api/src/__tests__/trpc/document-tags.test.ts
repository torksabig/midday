import { beforeEach, describe, expect, test } from "bun:test";
import { createCallerFactory } from "../../trpc/init";
import { documentTagsRouter } from "../../trpc/routers/document-tags";
import { createTestContext } from "../helpers/test-context";
import { mocks } from "../setup";

const TAG_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

const createCaller = createCallerFactory(documentTagsRouter);

describe("tRPC: documentTags Stage 4 fail-closed", () => {
  beforeEach(() => {
    process.env.MIDDAY_BACKEND_MODE = "replacement";
    delete process.env.REPLACEMENT_DELEGATION_USE_DEMO;
    mocks.getDocumentTags.mockReset();
    mocks.createDocumentTag.mockReset();
    mocks.createDocumentTagEmbedding.mockReset();
    mocks.deleteDocumentTag.mockReset();
  });

  test("get rejects without session", async () => {
    const ctx = createTestContext();
    const caller = createCaller({ ...ctx, session: null });

    await expect(caller.get()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  test("get does not call Drizzle when replacement API is down", async () => {
    const caller = createCaller(createTestContext());

    await expect(caller.get()).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.getDocumentTags).not.toHaveBeenCalled();
  });

  test("create does not call Drizzle when replacement API is down", async () => {
    const caller = createCaller(createTestContext());

    await expect(caller.create({ name: "Important" })).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.createDocumentTag).not.toHaveBeenCalled();
    expect(mocks.createDocumentTagEmbedding).not.toHaveBeenCalled();
  });

  test("delete does not call Drizzle when replacement API is down", async () => {
    const caller = createCaller(createTestContext());

    await expect(caller.delete({ id: TAG_ID })).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.deleteDocumentTag).not.toHaveBeenCalled();
  });
});

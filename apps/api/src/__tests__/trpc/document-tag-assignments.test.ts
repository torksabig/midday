import { beforeEach, describe, expect, test } from "bun:test";
import { createCallerFactory } from "../../trpc/init";
import { documentTagAssignmentsRouter } from "../../trpc/routers/document-tag-assignments";
import { createTestContext } from "../helpers/test-context";
import { mocks } from "../setup";

const DOCUMENT_ID = "b2c3d4e5-f6a7-8901-bcde-f12345678901";
const TAG_ID = "c3d4e5f6-a7b8-9012-cdef-123456789012";

const createCaller = createCallerFactory(documentTagAssignmentsRouter);

describe("tRPC: documentTagAssignments Stage 4 fail-closed", () => {
  beforeEach(() => {
    process.env.MIDDAY_BACKEND_MODE = "replacement";
    delete process.env.REPLACEMENT_DELEGATION_USE_DEMO;
    mocks.createDocumentTagAssignment.mockReset();
    mocks.deleteDocumentTagAssignment.mockReset();
  });

  test("create rejects without session", async () => {
    const ctx = createTestContext();
    const caller = createCaller({ ...ctx, session: null });

    await expect(
      caller.create({ documentId: DOCUMENT_ID, tagId: TAG_ID }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  test("create does not call Drizzle when replacement API is down", async () => {
    const caller = createCaller(createTestContext());

    await expect(
      caller.create({ documentId: DOCUMENT_ID, tagId: TAG_ID }),
    ).rejects.toMatchObject({ code: "INTERNAL_SERVER_ERROR" });
    expect(mocks.createDocumentTagAssignment).not.toHaveBeenCalled();
  });

  test("delete rejects without session", async () => {
    const ctx = createTestContext();
    const caller = createCaller({ ...ctx, session: null });

    await expect(
      caller.delete({ documentId: DOCUMENT_ID, tagId: TAG_ID }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  test("delete does not call Drizzle when replacement API is down", async () => {
    const caller = createCaller(createTestContext());

    await expect(
      caller.delete({ documentId: DOCUMENT_ID, tagId: TAG_ID }),
    ).rejects.toMatchObject({ code: "INTERNAL_SERVER_ERROR" });
    expect(mocks.deleteDocumentTagAssignment).not.toHaveBeenCalled();
  });
});

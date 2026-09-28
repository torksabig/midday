import { beforeEach, describe, expect, test } from "bun:test";
import { createCallerFactory } from "../../trpc/init";
import { tagsRouter } from "../../trpc/routers/tags";
import { createTestContext } from "../helpers/test-context";
import { mocks } from "../setup";

const createCaller = createCallerFactory(tagsRouter);

const TAG_ID = "b3b6e2c2-1f2a-4e3b-9c1d-2a4b6e2c21f2";

describe("tRPC: tags.get", () => {
  beforeEach(() => {
    mocks.getTags.mockReset();
    mocks.getTags.mockImplementation(() => Promise.resolve([]));
  });

  test("returns tags list", async () => {
    mocks.getTags.mockImplementation(() => Promise.resolve([]));

    const caller = createCaller(createTestContext());
    const result = await caller.get();

    expect(result).toEqual([]);
  });

  test("passes teamId to DB query", async () => {
    mocks.getTags.mockImplementation(() => Promise.resolve([]));

    const caller = createCaller(createTestContext());
    await caller.get();

    expect(mocks.getTags).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ teamId: "test-team-id" }),
    );
  });

  test("handles empty list", async () => {
    mocks.getTags.mockImplementation(() => Promise.resolve([]));

    const caller = createCaller(createTestContext());
    const result = await caller.get();

    expect(result).toHaveLength(0);
  });
});

describe("tRPC: tags.create", () => {
  beforeEach(() => {
    mocks.createTag.mockReset();
    mocks.createTag.mockImplementation(() =>
      Promise.resolve({ id: TAG_ID, name: "Important" }),
    );
  });

  test("creates tag with valid name", async () => {
    const caller = createCaller(createTestContext());
    const result = await caller.create({ name: "Important" });

    expect(result).toEqual({ id: TAG_ID, name: "Important" });
    expect(mocks.createTag).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        teamId: "test-team-id",
        name: "Important",
      }),
    );
  });

  test("passes teamId to DB query", async () => {
    const caller = createCaller(createTestContext());
    await caller.create({ name: "X" });

    expect(mocks.createTag).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ teamId: "test-team-id" }),
    );
  });

  test("allows empty string name", async () => {
    mocks.createTag.mockImplementation(() =>
      Promise.resolve({ id: TAG_ID, name: "" }),
    );

    const caller = createCaller(createTestContext());
    const result = await caller.create({ name: "" });

    expect(result).toEqual({ id: TAG_ID, name: "" });
  });
});

describe("tRPC: tags.update", () => {
  beforeEach(() => {
    mocks.updateTag.mockReset();
    mocks.updateTag.mockImplementation(() =>
      Promise.resolve({ id: TAG_ID, name: "Urgent" }),
    );
  });

  test("updates tag name", async () => {
    const caller = createCaller(createTestContext());
    const result = await caller.update({ id: TAG_ID, name: "Urgent" });

    expect(result).toEqual({ id: TAG_ID, name: "Urgent" });
    expect(mocks.updateTag).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        id: TAG_ID,
        name: "Urgent",
        teamId: "test-team-id",
      }),
    );
  });

  test("passes teamId to DB query", async () => {
    const caller = createCaller(createTestContext());
    await caller.update({ id: TAG_ID, name: "X" });

    expect(mocks.updateTag).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ teamId: "test-team-id" }),
    );
  });

  test("allows empty string as new name", async () => {
    mocks.updateTag.mockImplementation(() =>
      Promise.resolve({ id: TAG_ID, name: "" }),
    );

    const caller = createCaller(createTestContext());
    const result = await caller.update({ id: TAG_ID, name: "" });

    expect(result).toEqual({ id: TAG_ID, name: "" });
  });
});

describe("tRPC: tags.delete", () => {
  beforeEach(() => {
    mocks.deleteTag.mockReset();
    mocks.deleteTag.mockImplementation(() =>
      Promise.resolve({ id: TAG_ID, name: "Important" }),
    );
  });

  test("deletes tag by id", async () => {
    const caller = createCaller(createTestContext());
    const result = await caller.delete({ id: TAG_ID });

    expect(result).toEqual({ id: TAG_ID, name: "Important" });
    expect(mocks.deleteTag).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        id: TAG_ID,
        teamId: "test-team-id",
      }),
    );
  });

  test("passes teamId to DB query", async () => {
    const caller = createCaller(createTestContext());
    await caller.delete({ id: TAG_ID });

    expect(mocks.deleteTag).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ teamId: "test-team-id" }),
    );
  });

  test("returns undefined when tag was not found", async () => {
    mocks.deleteTag.mockImplementation(() => Promise.resolve(undefined));

    const caller = createCaller(createTestContext());
    const result = await caller.delete({ id: TAG_ID });

    expect(result).toBeUndefined();
  });
});

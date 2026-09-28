import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mocks } from "../setup";
import { createCallerFactory } from "../../trpc/init";
import { tagsRouter } from "../../trpc/routers/tags";
import { createTestContext } from "../helpers/test-context";

const createCaller = createCallerFactory(tagsRouter);
const TAG_ID = "b3b6e2c2-1f2a-4e3b-9c1d-2a4b6e2c21f2";
const env = process.env;

describe("tRPC: tags mutations replacement delegation", () => {
  beforeEach(() => {
    mocks.createTag.mockReset();
    mocks.updateTag.mockReset();
    mocks.deleteTag.mockReset();
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

  test("replacement mode create throws without calling Drizzle when API is down", async () => {
    process.env.MIDDAY_BACKEND_MODE = "replacement";
    delete process.env.REPLACEMENT_DELEGATION_USE_DEMO;
    process.env.REPLACEMENT_API_URL = "http://127.0.0.1:1";

    const caller = createCaller(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );

    await expect(caller.create({ name: "Urgent" })).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.createTag).not.toHaveBeenCalled();
  });

  test("replacement mode update throws without calling Drizzle when API is down", async () => {
    process.env.MIDDAY_BACKEND_MODE = "replacement";
    delete process.env.REPLACEMENT_DELEGATION_USE_DEMO;
    process.env.REPLACEMENT_API_URL = "http://127.0.0.1:1";

    const caller = createCaller(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );

    await expect(
      caller.update({ id: TAG_ID, name: "Urgent" }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.updateTag).not.toHaveBeenCalled();
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
    expect(mocks.deleteTag).not.toHaveBeenCalled();
  });
});

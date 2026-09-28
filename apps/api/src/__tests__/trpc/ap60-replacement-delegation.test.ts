import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mocks } from "../setup";
import { createCallerFactory } from "../../trpc/init";
import { accountingRouter } from "../../trpc/routers/accounting";
import { documentsRouter } from "../../trpc/routers/documents";
import { inboxAccountsRouter } from "../../trpc/routers/inbox-accounts";
import { teamRouter } from "../../trpc/routers/team";
import { createTestContext } from "../helpers/test-context";

const envSnapshot = { ...process.env };
const ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

describe("tRPC: AP-60 processDocument/export/invite/sync hybrid fail-closed", () => {
  beforeEach(() => {
    mocks.updateDocuments?.mockReset?.();
    mocks.getAppByAppId?.mockReset?.();
    mocks.createTeamInvites?.mockReset?.();
    mocks.getInboxAccountById?.mockReset?.();
    mocks.triggerJob?.mockReset?.();
    mocks.triggerJob?.mockImplementation?.(() => ({ id: "job-1" }));
    process.env = {
      ...envSnapshot,
      SUPABASE_URL: envSnapshot.SUPABASE_URL ?? "https://test.supabase.co",
      MIDDAY_BACKEND_MODE: "replacement",
      REPLACEMENT_API_URL: "http://127.0.0.1:1",
    };
    delete process.env.REPLACEMENT_DELEGATION_USE_DEMO;
  });

  afterEach(() => {
    process.env = { ...envSnapshot };
  });

  test("documents.processDocument throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(documentsRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(
      caller.processDocument([
        {
          filePath: ["team", "file.xyz"],
          mimetype: "application/x-unsupported",
          size: 12,
        },
      ]),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.updateDocuments).not.toHaveBeenCalled();
    expect(mocks.triggerJob).not.toHaveBeenCalled();
  });

  test("accounting.export throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(accountingRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(
      caller.export({
        providerId: "xero",
        transactionIds: [ID],
      }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.getAppByAppId).not.toHaveBeenCalled();
    expect(mocks.triggerJob).not.toHaveBeenCalled();
  });

  test("team.invite throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(teamRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(
      caller.invite([{ email: "new@example.com", role: "member" }]),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.createTeamInvites).not.toHaveBeenCalled();
  });

  test("inboxAccounts.sync throws without Drizzle when API is down", async () => {
    const caller = createCallerFactory(inboxAccountsRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await expect(caller.sync({ id: ID })).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.getInboxAccountById).not.toHaveBeenCalled();
  });
});

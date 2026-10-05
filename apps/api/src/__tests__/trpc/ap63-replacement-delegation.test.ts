// Mocks for @trigger.dev/sdk and @midday/job-client are registered via bunfig preload (setup.ts).
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mocks } from "../setup";
import { createCallerFactory } from "../../trpc/init";
import { accountingRouter } from "../../trpc/routers/accounting";
import { customersRouter } from "../../trpc/routers/customers";
import { documentsRouter } from "../../trpc/routers/documents";
import { inboxAccountsRouter } from "../../trpc/routers/inbox-accounts";
import { inboxRouter } from "../../trpc/routers/inbox";
import { oauthApplicationsRouter } from "../../trpc/routers/oauth-applications";
import { teamRouter } from "../../trpc/routers/team";
import { transactionAttachmentsRouter } from "../../trpc/routers/transaction-attachments";
import { transactionsRouter } from "../../trpc/routers/transactions";
import { createTestContext } from "../helpers/test-context";

const envSnapshot = { ...process.env };
const ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

describe("tRPC: AP-63 team.enqueueInviteTeamEmails (email-only hybrid)", () => {
  beforeEach(() => {
    mocks.triggerDevTask?.mockReset?.();
    mocks.triggerDevTask?.mockImplementation?.(() =>
      Promise.resolve({ id: "evt_trigger_test" }),
    );
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

  test("enqueueInviteTeamEmails triggers invite-team-members without Drizzle", async () => {
    const caller = createCallerFactory(teamRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await caller.enqueueInviteTeamEmails({
      invites: [
        {
          email: "new@example.com",
          invitedByName: "Ada",
          invitedByEmail: "ada@example.com",
          teamName: "Acme",
        },
      ],
    });
    expect(mocks.triggerDevTask).toHaveBeenCalledWith("invite-team-members", {
      teamId: "test-team-id",
      invites: [
        {
          email: "new@example.com",
          invitedByName: "Ada",
          invitedByEmail: "ada@example.com",
          teamName: "Acme",
        },
      ],
      ip: "127.0.0.1",
      locale: "en",
    });
  });
});

describe("tRPC: AP-63 team.enqueueUpdateBaseCurrency (job-only hybrid)", () => {
  beforeEach(() => {
    mocks.triggerJob?.mockReset?.();
    mocks.triggerJob?.mockImplementation?.(() => ({ id: "job-base-currency" }));
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

  test("enqueueUpdateBaseCurrency triggers update-base-currency without Drizzle", async () => {
    const caller = createCallerFactory(teamRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await caller.enqueueUpdateBaseCurrency({ baseCurrency: "EUR" });
    expect(mocks.triggerJob).toHaveBeenCalledWith(
      "update-base-currency",
      {
        teamId: "test-team-id",
        baseCurrency: "EUR",
      },
      "transactions",
    );
  });
});

describe("tRPC: AP-63 team.enqueueExportAllData (job-only hybrid)", () => {
  beforeEach(() => {
    mocks.triggerJob?.mockReset?.();
    mocks.triggerJob?.mockImplementation?.(() => ({ id: "job-export" }));
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

  test("enqueueExportAllData triggers export-team-data without Drizzle", async () => {
    const caller = createCallerFactory(teamRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await caller.enqueueExportAllData({});
    expect(mocks.triggerJob).toHaveBeenCalledWith(
      "export-team-data",
      {
        teamId: "test-team-id",
        userId: "test-user-id",
        userEmail: "test@example.com",
      },
      "transactions",
    );
  });
});

describe("tRPC: AP-65 oauthApplications.enqueueOAuthAppInstalledEmail (email-only hybrid)", () => {
  beforeEach(() => {
    mocks.resendEmailsSend.mockReset();
    mocks.resendEmailsSend.mockImplementation(() => Promise.resolve());
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

  test("enqueueOAuthAppInstalledEmail completes without Drizzle", async () => {
    const caller = createCallerFactory(oauthApplicationsRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    const result = await caller.enqueueOAuthAppInstalledEmail({
      email: "user@example.com",
      teamName: "Acme",
      appName: "Raycast",
    });
    expect(result).toEqual({ sent: true });
  });
});

describe("tRPC: AP-65 oauthApplications.enqueueOAuthApprovalReviewEmail (email-only hybrid)", () => {
  beforeEach(() => {
    mocks.resendEmailsSend.mockReset();
    mocks.resendEmailsSend.mockImplementation(() => Promise.resolve());
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

  test("enqueueOAuthApprovalReviewEmail completes without Drizzle", async () => {
    const caller = createCallerFactory(oauthApplicationsRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    const result = await caller.enqueueOAuthApprovalReviewEmail({
      applicationName: "My App",
      developerName: "Ada",
      teamName: "Acme",
      userEmail: "ada@example.com",
    });
    expect(result).toEqual({ sent: true });
  });
});

describe("tRPC: AP-64 inboxAccounts.enqueueDeleteInboxAccountSchedule (schedule-only hybrid)", () => {
  beforeEach(() => {
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

  test("enqueueDeleteInboxAccountSchedule deletes Trigger schedule without Drizzle", async () => {
    const caller = createCallerFactory(inboxAccountsRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await caller.enqueueDeleteInboxAccountSchedule({
      scheduleId: "sched_inbox_1",
    });
  });
});

describe("tRPC: AP-64 inboxAccounts.enqueueSyncInboxAccount (trigger-only hybrid)", () => {
  beforeEach(() => {
    mocks.triggerDevTask?.mockReset?.();
    mocks.triggerDevTask?.mockImplementation?.(() =>
      Promise.resolve({
        id: "evt_sync_test",
        publicAccessToken: "pub_tok",
      }),
    );
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

  test("enqueueSyncInboxAccount triggers sync-inbox-account without Drizzle", async () => {
    const caller = createCallerFactory(inboxAccountsRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await caller.enqueueSyncInboxAccount({ id: ID, manualSync: true });
    expect(mocks.triggerDevTask).toHaveBeenCalledWith("sync-inbox-account", {
      id: ID,
      manualSync: true,
    });
  });
});

describe("tRPC: AP-63 team.enqueueDeleteTeamJob (job-only hybrid)", () => {
  beforeEach(() => {
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

  test("enqueueDeleteTeamJob triggers delete-team without Drizzle", async () => {
    const caller = createCallerFactory(teamRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await caller.enqueueDeleteTeamJob({
      teamId: ID,
      connections: [
        {
          referenceId: "ref-1",
          provider: "plaid",
          accessToken: "tok",
        },
      ],
    });
    expect(mocks.triggerJob).toHaveBeenCalledWith(
      "delete-team",
      {
        teamId: ID,
        connections: [
          {
            referenceId: "ref-1",
            provider: "plaid",
            accessToken: "tok",
          },
        ],
      },
      "teams",
    );
  });
});

describe("tRPC: AP-66 inbox.enqueueProcessAttachments (job-only hybrid)", () => {
  beforeEach(() => {
    mocks.triggerJob?.mockReset?.();
    mocks.triggerJob?.mockImplementation?.(() => ({ id: "job-inbox-attach" }));
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

  test("enqueueProcessAttachments triggers process-attachment + inbox_new without Drizzle", async () => {
    const caller = createCallerFactory(inboxRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await caller.enqueueProcessAttachments([
      {
        filePath: ["team-1", "inbox", "receipt.pdf"],
        mimetype: "application/pdf",
        size: 1024,
      },
    ]);
    expect(mocks.triggerJob).toHaveBeenCalledWith(
      "process-attachment",
      {
        filePath: ["team-1", "inbox", "receipt.pdf"],
        mimetype: "application/pdf",
        size: 1024,
        teamId: "test-team-id",
        referenceId: undefined,
        website: undefined,
        senderEmail: undefined,
        inboxAccountId: undefined,
      },
      "inbox",
    );
    expect(mocks.triggerJob).toHaveBeenCalledWith(
      "notification",
      {
        type: "inbox_new",
        teamId: "test-team-id",
        totalCount: 1,
        inboxType: "upload",
      },
      "notifications",
    );
  });
});

describe("tRPC: AP-66 inbox.enqueueRetryMatching (job-only hybrid)", () => {
  beforeEach(() => {
    mocks.triggerJob?.mockReset?.();
    mocks.triggerJob?.mockImplementation?.(() => ({ id: "job-retry-match" }));
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

  test("enqueueRetryMatching triggers batch-process-matching without Drizzle", async () => {
    const caller = createCallerFactory(inboxRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    const result = await caller.enqueueRetryMatching({ id: ID });
    expect(result.jobId).toBe("job-retry-match");
    expect(mocks.triggerJob).toHaveBeenCalledWith(
      "batch-process-matching",
      {
        teamId: "test-team-id",
        inboxIds: [ID],
      },
      "inbox",
    );
  });
});

describe("tRPC: documents.enqueueProcessDocument (job-only hybrid)", () => {
  beforeEach(() => {
    mocks.triggerJob?.mockReset?.();
    mocks.triggerJob?.mockImplementation?.(() => ({ id: "job-process-doc" }));
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

  test("enqueueProcessDocument triggers process-document without Drizzle", async () => {
    const caller = createCallerFactory(documentsRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    const result = await caller.enqueueProcessDocument([
      {
        filePath: ["team-1", "vault", "invoice.pdf"],
        mimetype: "application/pdf",
        size: 2048,
      },
    ]);
    expect(result.jobs).toEqual([{ id: "job-process-doc" }]);
    expect(mocks.triggerJob).toHaveBeenCalledWith(
      "process-document",
      {
        filePath: ["team-1", "vault", "invoice.pdf"],
        mimetype: "application/pdf",
        teamId: "test-team-id",
      },
      "documents",
      {
        jobId: "process-doc_test-team-id_team-1/vault/invoice.pdf",
      },
    );
  });
});

describe("tRPC: AP-67 transactions.enqueueExportTransactions (job-only hybrid)", () => {
  beforeEach(() => {
    mocks.triggerJob?.mockReset?.();
    mocks.triggerJob?.mockImplementation?.(() => ({ id: "job-tx-export" }));
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

  test("enqueueExportTransactions triggers export-transactions without Drizzle", async () => {
    const caller = createCallerFactory(transactionsRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    const txId = "a1a2b3c4-5d6e-4f8a-9b0c-1d2e3f4a5b6c";
    await caller.enqueueExportTransactions({
      transactionIds: [txId],
      locale: "en",
    });
    expect(mocks.triggerJob).toHaveBeenCalledWith(
      "export-transactions",
      expect.objectContaining({
        teamId: "test-team-id",
        userId: "test-user-id",
        transactionIds: [txId],
      }),
      "transactions",
    );
  });
});

describe("tRPC: AP-68 accounting.enqueueExportToAccounting (job-only hybrid)", () => {
  beforeEach(() => {
    mocks.triggerJob?.mockReset?.();
    mocks.triggerJob?.mockImplementation?.(() => ({ id: "job-acct-export" }));
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

  test("enqueueExportToAccounting triggers export-to-accounting without Drizzle", async () => {
    const caller = createCallerFactory(accountingRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    const txId = "a1a2b3c4-5d6e-4f8a-9b0c-1d2e3f4a5b6c";
    await caller.enqueueExportToAccounting({
      providerId: "xero",
      transactionIds: [txId],
    });
    expect(mocks.getAppByAppId).not.toHaveBeenCalled();
    expect(mocks.triggerJob).toHaveBeenCalledWith(
      "export-to-accounting",
      {
        teamId: "test-team-id",
        userId: "test-user-id",
        providerId: "xero",
        transactionIds: [txId],
      },
      "accounting",
    );
  });
});

describe("tRPC: AP-67 transactions.enqueueImportTransactions (job-only hybrid)", () => {
  beforeEach(() => {
    mocks.triggerJob?.mockReset?.();
    mocks.triggerJob?.mockImplementation?.(() => ({ id: "job-tx-import" }));
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

  test("enqueueImportTransactions triggers import-transactions without Drizzle", async () => {
    const caller = createCallerFactory(transactionsRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await caller.enqueueImportTransactions({
      filePath: ["team-1", "imports", "file.csv"],
      bankAccountId: ID,
      currency: "USD",
      inverted: false,
      mappings: {
        amount: "Amount",
        date: "Date",
        description: "Description",
      },
    });
    expect(mocks.getBankAccountById).not.toHaveBeenCalled();
    expect(mocks.triggerJob).toHaveBeenCalledWith(
      "import-transactions",
      {
        filePath: ["team-1", "imports", "file.csv"],
        bankAccountId: ID,
        currency: "USD",
        mappings: {
          amount: "Amount",
          date: "Date",
          description: "Description",
        },
        teamId: "test-team-id",
        inverted: false,
      },
      "transactions",
    );
  });
});

describe("tRPC: AP-66 transactionAttachments.enqueueProcessTransactionAttachments (job-only hybrid)", () => {
  beforeEach(() => {
    mocks.triggerJob?.mockReset?.();
    mocks.triggerJob?.mockImplementation?.(() => ({ id: "job-tx-attach" }));
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

  test("enqueueProcessTransactionAttachments triggers process-transaction-attachment without Drizzle", async () => {
    const caller = createCallerFactory(transactionAttachmentsRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await caller.enqueueProcessTransactionAttachments([
      {
        transactionId: ID,
        mimetype: "application/pdf",
        filePath: ["team-1", "transactions", "receipt.pdf"],
      },
    ]);
    expect(mocks.triggerJob).toHaveBeenCalledWith(
      "process-transaction-attachment",
      {
        filePath: ["team-1", "transactions", "receipt.pdf"],
        mimetype: "application/pdf",
        teamId: "test-team-id",
        transactionId: ID,
      },
      "transactions",
    );
  });
});

describe("tRPC: AP-65 customers.enqueueEnrichCustomer (trigger-only hybrid)", () => {
  beforeEach(() => {
    mocks.getCustomerById?.mockReset?.();
    mocks.updateCustomerEnrichmentStatus?.mockReset?.();
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

  test("enqueueEnrichCustomer triggers enrich-customer without Drizzle", async () => {
    const caller = createCallerFactory(customersRouter)(
      createTestContext({ accessToken: "fake-session-jwt" }),
    );
    await caller.enqueueEnrichCustomer({ id: ID });
    expect(mocks.getCustomerById).not.toHaveBeenCalled();
    expect(mocks.updateCustomerEnrichmentStatus).not.toHaveBeenCalled();
    expect(mocks.triggerJob).toHaveBeenCalledWith(
      "enrich-customer",
      {
        customerId: ID,
        teamId: "test-team-id",
      },
      "customers",
      { attempts: 1 },
    );
  });
});

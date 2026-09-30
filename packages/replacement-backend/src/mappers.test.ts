import { describe, expect, test } from "bun:test";
import {
  mapReplacementToBankAccountsGet,
  mapReplacementToCustomersGet,
  mapReplacementToDocumentsGet,
  mapReplacementToInboxById,
  mapReplacementToInboxByStatus,
  mapReplacementToInboxCheckAttachments,
  mapReplacementToInboxGet,
  mapReplacementToInboxSearch,
  mapReplacementToGlobalSearch,
  mapReplacementToInvoiceSummary,
  mapReplacementToPaymentStatus,
  mapReplacementToRelatedDocuments,
  mapReplacementToReportJson,
  mapReplacementToTeamCurrent,
  mapReplacementToTransactionById,
  mapReplacementToTransactionCategoriesGet,
  mapReplacementToTransactionsGet,
  mapReplacementToUserMe,
  mapReplacementToTrackerProjectsGet,
  mapReplacementToTrackerEntriesByRange,
  mapReplacementToTrackerTimerStatus,
  mapReplacementToAccountingConnections,
  mapReplacementToBankConnectionsGet,
  mapReplacementToUserInvites,
  mapReplacementToBankAccountsBalances,
  mapReplacementToDocumentTagsGet,
  mapReplacementToTagsGet,
  mapReplacementToBankAccountTransactionCount,
  buildReplacementTransactionUpdateBody,
  mapReplacementToNotificationsList,
  mapReplacementToNotification,
  mapReplacementToNotificationsUpdateAll,
  mapReplacementToUserUpdate,
  buildReplacementUserUpdateBody,
  mapReplacementToTeamUpdate,
  buildReplacementTeamUpdateBody,
  mapReplacementToTagMutation,
  mapReplacementToDocumentTagCreate,
  mapReplacementToDocumentTagDelete,
  mapReplacementToDocumentTagAssignment,
  mapReplacementToTransactionTagCreate,
  mapReplacementToCategoryById,
  mapReplacementToMostActiveClient,
  mapReplacementToAverageInvoiceSize,
  mapReplacementToTopRevenueClient,
  mapReplacementToCountMetric,
  mapReplacementToAppsGet,
  mapReplacementToOAuthApplicationsList,
  mapReplacementToInboxAccountsGet,
} from "./mappers";

describe("replacement mappers", () => {
  test("mapReplacementToUserMe maps clone auth/me to Midday user.me", () => {
    const mapped = mapReplacementToUserMe(
      {
        user: { id: "u1", email: "a@b.com", name: "Ada" },
        team: { id: "t1", name: "Team" },
        settings: { currency: "EUR", locale: "de-DE" },
      },
      "file-key",
    );

    expect(mapped).toMatchObject({
      id: "u1",
      email: "a@b.com",
      fullName: "Ada",
      teamId: "t1",
      fileKey: "file-key",
      team: {
        id: "t1",
        name: "Team",
        baseCurrency: "EUR",
      },
      locale: "de-DE",
    });
  });

  test("mapReplacementToTeamCurrent maps team/current payload", () => {
    const mapped = mapReplacementToTeamCurrent({
      id: "t1",
      name: "Acme",
      base_currency: "USD",
      locale: "en-US",
    });

    expect(mapped).toMatchObject({
      id: "t1",
      name: "Acme",
      baseCurrency: "USD",
      plan: "trial",
    });
  });

  test("mapReplacementToTransactionsGet maps list payload to transactions.get", () => {
    const mapped = mapReplacementToTransactionsGet({
      meta: {
        cursor: "40",
        has_previous_page: false,
        has_next_page: true,
      },
      data: [
        {
          id: "tx1",
          date: "2026-09-01",
          amount: -49.5,
          currency: "USD",
          method: "card",
          status: "posted",
          manual: false,
          internal: false,
          name: "Software",
          created_at: "2026-09-01T12:00:00Z",
          enrichment_completed: false,
          is_fulfilled: false,
          has_pending_suggestion: false,
          is_exported: false,
          has_export_error: false,
          counterparty_name: "Figma",
          account: {
            id: "ba1",
            name: "Main",
            currency: "USD",
            connection: null,
          },
        },
      ],
    });

    expect(mapped.meta).toMatchObject({
      cursor: "40",
      hasNextPage: true,
    });
    expect(mapped.data[0]).toMatchObject({
      id: "tx1",
      amount: -49.5,
      counterpartyName: "Figma",
      account: { id: "ba1", name: "Main", currency: "USD" },
    });
  });

  test("mapReplacementToTransactionsGet maps attachments and tags", () => {
    const mapped = mapReplacementToTransactionsGet({
      meta: {
        has_previous_page: false,
        has_next_page: false,
      },
      data: [
        {
          id: "tx1",
          date: "2026-09-01",
          amount: -10,
          currency: "USD",
          method: "card",
          status: "posted",
          manual: false,
          internal: false,
          name: "Item",
          created_at: "2026-09-01T12:00:00Z",
          enrichment_completed: false,
          is_fulfilled: true,
          has_pending_suggestion: false,
          is_exported: false,
          has_export_error: false,
          attachments: [
            {
              id: "att1",
              filename: "receipt.pdf",
              path: "/p",
              type: "application/pdf",
              size: 42,
            },
          ],
          tags: [{ id: "tag1", name: "Travel" }],
        },
      ],
    });

    expect(mapped.data[0]?.attachments).toEqual([
      {
        id: "att1",
        filename: "receipt.pdf",
        path: "/p",
        type: "application/pdf",
        size: 42,
      },
    ]);
    expect(mapped.data[0]?.tags).toEqual([{ id: "tag1", name: "Travel" }]);
  });

  test("mapReplacementToTransactionById maps detail payload with suggestion", () => {
    const mapped = mapReplacementToTransactionById({
      id: "tx1",
      date: "2026-09-01",
      amount: -49.5,
      currency: "USD",
      method: "card",
      status: "posted",
      manual: false,
      internal: false,
      name: "Software",
      created_at: "2026-09-01T12:00:00Z",
      enrichment_completed: false,
      is_fulfilled: false,
      has_pending_suggestion: true,
      is_exported: false,
      has_export_error: false,
      suggestion: {
        suggestion_id: "s1",
        inbox_id: "in1",
        document_name: "Receipt.pdf",
        confidence_score: 0.92,
      },
    });

    expect(mapped).toMatchObject({
      id: "tx1",
      hasPendingSuggestion: true,
      suggestion: {
        suggestionId: "s1",
        inboxId: "in1",
        documentName: "Receipt.pdf",
        confidenceScore: 0.92,
      },
    });
  });

  test("mapReplacementToTransactionCategoriesGet maps nested children", () => {
    const mapped = mapReplacementToTransactionCategoriesGet([
      {
        id: "c1",
        name: "Travel",
        slug: "travel",
        children: [
          {
            id: "c2",
            name: "Flights",
            slug: "flights",
            parent_id: "c1",
          },
        ],
      },
    ]);

    expect(mapped[0]?.children[0]).toMatchObject({
      id: "c2",
      name: "Flights",
      slug: "flights",
      parentId: "c1",
    });
  });

  test("mapReplacementToBankAccountsGet maps bank connection without token", () => {
    const mapped = mapReplacementToBankAccountsGet([
      {
        id: "ba1",
        created_at: "2026-01-01T00:00:00Z",
        created_by: "u1",
        team_id: "t1",
        enabled: true,
        account_id: "ext-1",
        bank_connection: {
          id: "bc1",
          created_at: "2026-01-01T00:00:00Z",
          institution_id: "ins",
          team_id: "t1",
          name: "Chase",
          provider: "plaid",
        },
      },
    ]);

    expect(mapped[0]?.bankConnection).toMatchObject({
      id: "bc1",
      name: "Chase",
      accessToken: null,
    });
  });

  test("mapReplacementToInboxGet maps paginated inbox list", () => {
    const mapped = mapReplacementToInboxGet({
      meta: {
        cursor: "20",
        has_previous_page: true,
        has_next_page: false,
      },
      data: [
        {
          id: "in1",
          file_name: "inv.pdf",
          file_path: ["vault", "inv.pdf"],
          display_name: "Invoice",
          status: "pending",
          created_at: "2026-09-01T00:00:00Z",
          related_count: 2,
          inbox_account: { id: "ia1", email: "in@co.com", provider: "gmail" },
          transaction: {
            id: "tx1",
            amount: 10,
            currency: "USD",
            name: "Coffee",
            date: "2026-08-30",
          },
        },
      ],
    });

    expect(mapped.meta).toMatchObject({
      cursor: "20",
      hasPreviousPage: true,
      hasNextPage: false,
    });
    expect(mapped.data[0]).toMatchObject({
      id: "in1",
      fileName: "inv.pdf",
      relatedCount: 2,
      inboxAccount: { id: "ia1", email: "in@co.com", provider: "gmail" },
      transaction: { id: "tx1", name: "Coffee" },
    });
  });

  test("mapReplacementToInboxById maps detail fields", () => {
    const mapped = mapReplacementToInboxById({
      id: "in1",
      status: "suggested_match",
      created_at: "2026-09-01T00:00:00Z",
      related_count: 0,
      grouped_inbox_id: null,
      suggestion: {
        id: "s1",
        transaction_id: "tx9",
        confidence_score: 0.91,
        match_type: "amount",
        status: "pending",
        suggested_transaction: {
          id: "tx9",
          name: "Vendor",
          amount: 50,
          currency: "USD",
          date: "2026-08-01",
        },
      },
    });

    expect(mapped.suggestion).toMatchObject({
      id: "s1",
      transactionId: "tx9",
      confidenceScore: 0.91,
      suggestedTransaction: { id: "tx9", name: "Vendor" },
    });
  });

  test("mapReplacementToInboxSearch maps search rows", () => {
    const mapped = mapReplacementToInboxSearch([
      {
        id: "in1",
        created_at: "2026-09-01T00:00:00Z",
        display_name: "Receipt",
        status: "pending",
      },
    ]);
    expect(mapped[0]).toMatchObject({
      id: "in1",
      displayName: "Receipt",
      createdAt: "2026-09-01T00:00:00Z",
    });
  });

  test("mapReplacementToInboxByStatus maps status list", () => {
    const mapped = mapReplacementToInboxByStatus([
      {
        id: "in1",
        display_name: "Doc",
        status: "pending",
        created_at: "2026-09-01T00:00:00Z",
      },
    ]);
    expect(mapped[0]).toMatchObject({
      displayName: "Doc",
      transactionId: null,
    });
  });

  test("mapReplacementToInboxCheckAttachments maps attachment probe", () => {
    const mapped = mapReplacementToInboxCheckAttachments({
      has_attachments: true,
      attachments: [{ id: "a1", transaction_id: "tx1", name: "file.pdf" }],
      file_name: "file.pdf",
    });
    expect(mapped).toMatchObject({
      hasAttachments: true,
      fileName: "file.pdf",
      attachments: [{ id: "a1", transactionId: "tx1", name: "file.pdf" }],
    });
  });

  test("mapReplacementToDocumentsGet camelCases paginated rows", () => {
    const mapped = mapReplacementToDocumentsGet({
      meta: { cursor: "20", has_previous_page: true, has_next_page: false },
      data: [
        {
          id: "d1",
          path_tokens: ["a", "b"],
          processing_status: "completed",
          document_tag_assignments: [
            { document_tag: { id: "t1", name: "Tax", slug: "tax" } },
          ],
        },
      ],
    });
    expect(mapped.meta.hasPreviousPage).toBe(true);
    expect(mapped.data[0]).toMatchObject({
      pathTokens: ["a", "b"],
      processingStatus: "completed",
    });
  });

  test("mapReplacementToCustomersGet maps list meta", () => {
    const mapped = mapReplacementToCustomersGet({
      meta: { cursor: null, has_previous_page: false, has_next_page: true },
      data: [{ id: "c1", billing_email: "bill@co.com", invoice_count: 2 }],
    });
    expect(mapped.meta.hasNextPage).toBe(true);
    expect(mapped.data[0]).toMatchObject({
      billingEmail: "bill@co.com",
      invoiceCount: 2,
    });
  });

  test("mapReplacementToPaymentStatus maps score label", () => {
    const mapped = mapReplacementToPaymentStatus({
      score: 85,
      payment_status: "good",
    });
    expect(mapped).toEqual({ score: 85, paymentStatus: "good" });
  });

  test("mapReplacementToInvoiceSummary maps FX breakdown", () => {
    const mapped = mapReplacementToInvoiceSummary({
      total_amount: 100.5,
      invoice_count: 2,
      currency: "USD",
      breakdown: [
        {
          currency: "EUR",
          original_amount: 50,
          converted_amount: 55,
          count: 1,
        },
      ],
    });
    expect(mapped).toMatchObject({
      totalAmount: 100.5,
      invoiceCount: 2,
      breakdown: [{ originalAmount: 50, convertedAmount: 55 }],
    });
  });

  test("mapReplacementToRelatedDocuments maps path tokens", () => {
    const mapped = mapReplacementToRelatedDocuments([
      {
        id: "d2",
        name: "a.pdf",
        path_tokens: ["vault", "a.pdf"],
        title: "Tax doc",
      },
    ]);
    expect(mapped[0]).toMatchObject({
      id: "d2",
      pathTokens: ["vault", "a.pdf"],
      title: "Tax doc",
    });
  });

  test("mapReplacementToReportJson camelCases chart summary", () => {
    const mapped = mapReplacementToReportJson({
      summary: { current_total: 100, prev_total: 50, currency: "USD" },
    }) as { summary: { currentTotal: number } };
    expect(mapped.summary.currentTotal).toBe(100);
  });

  test("mapReplacementToReportJson camelCases revenue forecast meta", () => {
    const mapped = mapReplacementToReportJson({
      meta: { forecast_method: "bottom_up", team_collection_metrics: { on_time_rate: 70 } },
    }) as { meta: { forecastMethod: string; teamCollectionMetrics: { onTimeRate: number } } };
    expect(mapped.meta.forecastMethod).toBe("bottom_up");
    expect(mapped.meta.teamCollectionMetrics.onTimeRate).toBe(70);
  });

  test("mapReplacementToGlobalSearch preserves FTS row shape", () => {
    const mapped = mapReplacementToGlobalSearch([
      {
        id: "1",
        type: "customer",
        title: "Acme",
        relevance: 0.9,
        created_at: "2026-01-01",
        data: { name: "Acme" },
      },
    ]);
    expect(mapped[0]).toMatchObject({
      type: "customer",
      created_at: "2026-01-01",
    });
  });

  test("mapReplacementToTrackerProjectsGet camelCases paginated projects", () => {
    const mapped = mapReplacementToTrackerProjectsGet({
      meta: {
        cursor: "25",
        has_previous_page: false,
        has_next_page: true,
      },
      data: [{ id: "p1", total_duration: 100, customer: { name: "Acme" } }],
    });
    expect(mapped.meta.hasNextPage).toBe(true);
    expect(mapped.data[0]).toMatchObject({
      id: "p1",
      totalDuration: 100,
    });
  });

  test("mapReplacementToTrackerEntriesByRange camelCases nested result", () => {
    const mapped = mapReplacementToTrackerEntriesByRange({
      meta: { total_duration: 3600, total_amount: 50, from: "2024-04-01", to: "2024-04-30" },
      result: { "2024-04-15": [{ id: "e1", tracker_project: { billable: true } }] },
    }) as { meta: { totalDuration: number }; result: Record<string, unknown[]> };
    expect(mapped.meta.totalDuration).toBe(3600);
    expect(mapped.result["2024-04-15"][0]).toMatchObject({ id: "e1" });
  });

  test("mapReplacementToAccountingConnections maps provider rows", () => {
    const mapped = mapReplacementToAccountingConnections([
      {
        app_id: "xero",
        settings: { sync: true },
        config: { provider: "xero", tenantName: "Acme Ltd" },
      },
    ]);
    expect(mapped[0]).toEqual({
      providerId: "xero",
      tenantName: "Acme Ltd",
      settings: { sync: true },
      connectedAt: null,
    });
  });

  test("mapReplacementToTrackerTimerStatus camelCases status payload", () => {
    const mapped = mapReplacementToTrackerTimerStatus({
      is_running: true,
      elapsed_time: 42,
      current_entry: { project_id: "p1" },
    }) as { isRunning: boolean; elapsedTime: number };
    expect(mapped.isRunning).toBe(true);
    expect(mapped.elapsedTime).toBe(42);
  });

  test("mapReplacementToBankConnectionsGet camelCases nested accounts", () => {
    const mapped = mapReplacementToBankConnectionsGet([
      {
        id: "bc1",
        logo_url: "https://x",
        bank_accounts: [{ account_id: "a1", error_retries: 0 }],
      },
    ]);
    expect(mapped[0]).toMatchObject({
      id: "bc1",
      logoUrl: "https://x",
      bankAccounts: [{ accountId: "a1", errorRetries: 0 }],
    });
  });

  test("mapReplacementToUserInvites maps nested team invite rows", () => {
    const mapped = mapReplacementToUserInvites([
      {
        id: "inv1",
        email: "a@b.com",
        code: "abc",
        role: "member",
        user: { id: "u1", full_name: "Ada", email: "ada@b.com" },
        team: { id: "t1", name: "Acme", logo_url: "https://logo" },
      },
    ]);
    expect(mapped[0]).toMatchObject({
      id: "inv1",
      user: { fullName: "Ada" },
      team: { logoUrl: "https://logo" },
    });
  });

  test("mapReplacementToBankAccountsBalances preserves logo_url", () => {
    const mapped = mapReplacementToBankAccountsBalances([
      {
        id: "ba1",
        currency: "USD",
        balance: 100,
        name: "Checking",
        logo_url: "",
      },
    ]);
    expect(mapped[0]).toMatchObject({ logo_url: "" });
  });

  test("mapReplacementToMostActiveClient camelCases client metrics", () => {
    const mapped = mapReplacementToMostActiveClient({
      customer_id: "c1",
      customer_name: "Acme",
      invoice_count: 2,
      total_tracker_time: 3600,
    });
    expect(mapped).toMatchObject({
      customerId: "c1",
      totalTrackerTime: 3600,
    });
  });

  test("mapReplacementToCountMetric parses scalar counts", () => {
    expect(mapReplacementToCountMetric(7)).toBe(7);
  });

  test("mapReplacementToAverageInvoiceSize maps currency rows", () => {
    const mapped = mapReplacementToAverageInvoiceSize([
      { currency: "EUR", average_amount: 99.5, invoice_count: 3 },
    ]);
    expect(mapped[0]).toMatchObject({ averageAmount: 99.5, invoiceCount: 3 });
  });

  test("mapReplacementToTopRevenueClient maps revenue row", () => {
    const mapped = mapReplacementToTopRevenueClient({
      customer_id: "c1",
      customer_name: "Big Co",
      total_revenue: 5000,
      currency: "USD",
      invoice_count: 4,
    });
    expect(mapped).toMatchObject({ totalRevenue: 5000, invoiceCount: 4 });
  });

  test("mapReplacementToDocumentTagsGet maps vault tag list", () => {
    const mapped = mapReplacementToDocumentTagsGet([{ id: "t1", name: "Tax" }]);
    expect(mapped[0]).toEqual({ id: "t1", name: "Tax" });
  });

  test("mapReplacementToTagsGet maps transaction tag list", () => {
    const mapped = mapReplacementToTagsGet([
      {
        id: "t1",
        name: "Travel",
        teamId: "team-1",
        createdAt: "2024-01-01T00:00:00.000Z",
      },
    ]);
    expect(mapped[0]).toMatchObject({ name: "Travel", teamId: "team-1" });
  });

  test("mapReplacementToBankAccountTransactionCount maps count wrapper", () => {
    expect(mapReplacementToBankAccountTransactionCount({ count: 12 })).toEqual({
      count: 12,
    });
  });

  test("mapReplacementToNotificationsList maps activity feed rows", () => {
    const mapped = mapReplacementToNotificationsList({
      meta: {
        cursor: "20",
        has_previous_page: true,
        has_next_page: false,
      },
      data: [
        {
          id: "a1",
          created_at: "2024-01-01T00:00:00.000Z",
          team_id: "team-1",
          user_id: "user-1",
          type: "transactions_created",
          priority: 3,
          group_id: null,
          source: "system",
          metadata: { count: 2 },
          status: "unread",
          last_used_at: null,
        },
      ],
    });
    expect(mapped.data[0]?.createdAt).toBe("2024-01-01T00:00:00.000Z");
    expect(mapped.meta.hasPreviousPage).toBe(true);
  });

  test("mapReplacementToNotification maps a single activity row", () => {
    const mapped = mapReplacementToNotification({
      id: "a1",
      created_at: "2024-01-01T00:00:00.000Z",
      team_id: "team-1",
      user_id: "user-1",
      type: "transactions_created",
      priority: 3,
      group_id: null,
      source: "system",
      metadata: { count: 2 },
      status: "read",
      last_used_at: null,
    });
    expect(mapped).toMatchObject({
      id: "a1",
      status: "read",
      teamId: "team-1",
      createdAt: "2024-01-01T00:00:00.000Z",
    });
  });

  test("mapReplacementToNotificationsUpdateAll maps activity array", () => {
    const mapped = mapReplacementToNotificationsUpdateAll([
      {
        id: "a1",
        created_at: "2024-01-01T00:00:00.000Z",
        team_id: "team-1",
        user_id: "user-1",
        type: "transactions_created",
        priority: 3,
        group_id: null,
        source: "system",
        metadata: {},
        status: "read",
        last_used_at: null,
      },
    ]);
    expect(mapped).toHaveLength(1);
    expect(mapped[0]?.status).toBe("read");
  });

  test("mapReplacementToUserUpdate camelCases preference fields", () => {
    expect(
      mapReplacementToUserUpdate({
        id: "u1",
        full_name: "Jane Doe",
        email: "jane@example.com",
        avatar_url: null,
        locale: "en-US",
        time_format: 24,
        date_format: "yyyy-MM-dd",
        week_starts_on_monday: true,
        timezone: "UTC",
        timezone_auto_sync: false,
        team_id: "t1",
      }),
    ).toEqual({
      id: "u1",
      fullName: "Jane Doe",
      email: "jane@example.com",
      avatarUrl: null,
      locale: "en-US",
      timeFormat: 24,
      dateFormat: "yyyy-MM-dd",
      weekStartsOnMonday: true,
      timezone: "UTC",
      timezoneAutoSync: false,
      teamId: "t1",
    });
  });

  test("buildReplacementUserUpdateBody omits undefined fields", () => {
    expect(
      buildReplacementUserUpdateBody({
        fullName: "Ada",
        timezone: undefined,
        locale: null,
      }),
    ).toEqual({ fullName: "Ada", locale: null });
  });

  test("mapReplacementToTeamUpdate camelCases team fields", () => {
    expect(
      mapReplacementToTeamUpdate({
        id: "t1",
        name: "Acme",
        logo_url: null,
        email: "team@acme.com",
        inbox_id: "abc123",
        plan: "pro",
        subscription_status: "active",
        base_currency: "USD",
        country_code: "US",
        fiscal_year_start_month: 4,
      }),
    ).toEqual({
      id: "t1",
      name: "Acme",
      logoUrl: null,
      email: "team@acme.com",
      inboxId: "abc123",
      plan: "pro",
      subscriptionStatus: "active",
      baseCurrency: "USD",
      countryCode: "US",
      fiscalYearStartMonth: 4,
    });
  });

  test("buildReplacementTeamUpdateBody omits undefined fields", () => {
    expect(
      buildReplacementTeamUpdateBody({
        name: "Acme",
        email: undefined,
        baseCurrency: "EUR",
      }),
    ).toEqual({ name: "Acme", baseCurrency: "EUR" });
  });

  test("mapReplacementToTagMutation returns id and name", () => {
    expect(mapReplacementToTagMutation({ id: "tag-1", name: "Urgent" })).toEqual({
      id: "tag-1",
      name: "Urgent",
    });
  });

  test("mapReplacementToDocumentTagCreate returns id name slug", () => {
    expect(
      mapReplacementToDocumentTagCreate({
        id: "dt-1",
        name: "Tax",
        slug: "tax",
      }),
    ).toEqual({ id: "dt-1", name: "Tax", slug: "tax" });
  });

  test("mapReplacementToDocumentTagDelete returns id", () => {
    expect(mapReplacementToDocumentTagDelete({ id: "dt-1" })).toEqual({
      id: "dt-1",
    });
  });

  test("mapReplacementToDocumentTagAssignment returns camelCase keys", () => {
    expect(
      mapReplacementToDocumentTagAssignment({
        documentId: "doc-1",
        tagId: "tag-1",
        teamId: "team-1",
      }),
    ).toEqual({
      documentId: "doc-1",
      tagId: "tag-1",
      teamId: "team-1",
    });
  });

  test("mapReplacementToTransactionTagCreate returns array of links", () => {
    expect(
      mapReplacementToTransactionTagCreate([
        {
          teamId: "team-1",
          transactionId: "tx-1",
          tagId: "tag-1",
        },
      ]),
    ).toEqual([
      {
        teamId: "team-1",
        transactionId: "tx-1",
        tagId: "tag-1",
      },
    ]);
  });

  test("mapReplacementToCategoryById returns camelCase category tree", () => {
    expect(
      mapReplacementToCategoryById({
        id: "cat-1",
        name: "Office",
        taxRate: 0.2,
        children: [{ id: "cat-2", name: "Supplies" }],
      }),
    ).toMatchObject({
      id: "cat-1",
      name: "Office",
      taxRate: 0.2,
      children: [{ id: "cat-2", name: "Supplies" }],
    });
  });

  test("buildReplacementTransactionUpdateBody omits id and undefined fields", () => {
    expect(
      buildReplacementTransactionUpdateBody({
        id: "tx-1",
        name: "Updated",
        status: undefined,
        categorySlug: null,
      }),
    ).toEqual({ name: "Updated", categorySlug: null });
  });

  test("mapReplacementToAppsGet preserves snake_case app_id", () => {
    expect(
      mapReplacementToAppsGet([{ app_id: "slack", settings: [], config: {} }]),
    ).toEqual([{ app_id: "slack", settings: [], config: {} }]);
  });

  test("mapReplacementToOAuthApplicationsList camelCases nested user", () => {
    expect(
      mapReplacementToOAuthApplicationsList({
        data: [
          {
            id: "oa1",
            created_by_user: { id: "u1", full_name: "Ada", avatar_url: null },
          },
        ],
      }),
    ).toEqual({
      data: [
        {
          id: "oa1",
          createdByUser: { id: "u1", fullName: "Ada", avatarUrl: null },
        },
      ],
    });
  });

  test("mapReplacementToInboxAccountsGet camelCases fields", () => {
    expect(
      mapReplacementToInboxAccountsGet([
        {
          id: "ia1",
          email: "a@b.com",
          last_accessed: "2026-01-01",
          error_message: null,
        },
      ]),
    ).toEqual([
      {
        id: "ia1",
        email: "a@b.com",
        lastAccessed: "2026-01-01",
        errorMessage: null,
      },
    ]);
  });
});

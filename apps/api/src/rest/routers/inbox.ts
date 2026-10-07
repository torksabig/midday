import type { Context } from "@api/rest/types";
import {
  confirmMatchSchema,
  createInboxBlocklistSchema,
  createInboxItemSchema,
  declineMatchSchema,
  deleteInboxBlocklistSchema,
  deleteInboxManySchema,
  deleteInboxResponseSchema,
  deleteInboxSchema,
  getInboxByIdSchema,
  getInboxByStatusSchema,
  getInboxPreSignedUrlSchema,
  getInboxSchema,
  inboxBlocklistItemResponseSchema,
  inboxBlocklistResponseSchema,
  inboxItemResponseSchema,
  inboxPreSignedUrlResponseSchema,
  inboxResponseSchema,
  matchInboxItemBodySchema,
  searchInboxSchema,
  updateInboxSchema,
} from "@api/schemas/inbox";
import {
  confirmInboxMatchForRest,
  createInboxBlocklistForRest,
  createInboxForRest,
  declineInboxMatchForRest,
  deleteInboxBlocklistForRest,
  deleteInboxForRest,
  deleteInboxManyForRest,
  fetchInboxBlocklistForRest,
  fetchInboxByIdForRest,
  fetchInboxByStatusForRest,
  fetchInboxListForRest,
  fetchInboxSearchForRest,
  matchInboxForRest,
  unmatchInboxForRest,
  updateInboxForRest,
} from "@api/rest/services/replacement-rest-inbox";
import {
  extractBearerToken,
  fetchReplacementVaultPresignedUrl,
  normalizeVaultObjectPath,
} from "@api/rest/services/vault-presigned-url";
import { tryDelegateInboxGetById } from "@api/services/replacement-delegation";
import { createAdminClient } from "@api/services/supabase";
import { validateResponse } from "@api/utils/validate-response";
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import {
  confirmSuggestedMatch,
  createInbox,
  createInboxBlocklist,
  declineSuggestedMatch,
  deleteInbox,
  deleteInboxBlocklist,
  deleteInboxMany,
  getInbox,
  getInboxBlocklist,
  getInboxById,
  getInboxByStatus,
  getInboxSearch,
  matchTransaction,
  unmatchTransaction,
  updateInbox,
} from "@midday/db/queries";
import { signedUrl } from "@midday/supabase/storage";
import { HTTPException } from "hono/http-exception";
import { withRequiredScope } from "../middleware";

const app = new OpenAPIHono<Context>();

app.openapi(
  createRoute({
    method: "get",
    path: "/",
    summary: "List all inbox items",
    operationId: "listInboxItems",
    "x-speakeasy-name-override": "list",
    description: "Retrieve a list of inbox items for the authenticated team.",
    tags: ["Inbox"],
    request: {
      query: getInboxSchema,
    },
    responses: {
      200: {
        description:
          "Retrieve a list of inbox items for the authenticated team.",
        content: {
          "application/json": {
            schema: inboxResponseSchema,
          },
        },
      },
    },
    middleware: [withRequiredScope("inbox.read")],
  }),
  async (c) => {
    const db = c.get("db");
    const teamId = c.get("teamId");
    const { pageSize, cursor, order, ...filter } = c.req.valid("query");

    const result = await fetchInboxListForRest(
      {
        cursor,
        pageSize,
        order,
        ...filter,
      },
      c.req.header("Authorization"),
      () =>
        getInbox(db, {
          teamId,
          pageSize,
          cursor,
          order,
          ...filter,
        }),
    );

    return c.json(validateResponse(result, inboxResponseSchema));
  },
);

app.openapi(
  createRoute({
    method: "post",
    path: "/",
    summary: "Create an inbox item",
    operationId: "createInboxItem",
    "x-speakeasy-name-override": "create",
    description:
      "Create an inbox item row for the authenticated team (typically before attachment processing).",
    tags: ["Inbox"],
    request: {
      body: {
        required: true,
        content: {
          "application/json": {
            schema: createInboxItemSchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: "Inbox item created",
        content: {
          "application/json": {
            schema: inboxItemResponseSchema,
          },
        },
      },
    },
    middleware: [withRequiredScope("inbox.write")],
  }),
  async (c) => {
    const db = c.get("db");
    const teamId = c.get("teamId");
    const input = c.req.valid("json");

    const result = await createInboxForRest(
      {
        displayName: input.filename,
        filePath: input.filePath,
        fileName: input.filename,
        contentType: input.mimetype,
        size: input.size,
        status: "processing",
      },
      c.req.header("Authorization"),
      () =>
        createInbox(db, {
          displayName: input.filename,
          teamId,
          filePath: input.filePath,
          fileName: input.filename,
          contentType: input.mimetype,
          size: input.size,
          status: "processing",
        }),
    );

    return c.json(validateResponse(result, inboxItemResponseSchema), 201);
  },
);

app.openapi(
  createRoute({
    method: "get",
    path: "/search",
    summary: "Search inbox items",
    operationId: "searchInboxItems",
    "x-speakeasy-name-override": "search",
    description: "Search unmatched inbox items for matching.",
    tags: ["Inbox"],
    request: {
      query: searchInboxSchema,
    },
    responses: {
      200: {
        description: "Search results",
        content: {
          "application/json": {
            schema: z.array(inboxItemResponseSchema),
          },
        },
      },
    },
    middleware: [withRequiredScope("inbox.read")],
  }),
  async (c) => {
    const db = c.get("db");
    const teamId = c.get("teamId");
    const { q, transactionId, limit = 10 } = c.req.valid("query");

    const result = await fetchInboxSearchForRest(
      { q, transactionId, limit },
      c.req.header("Authorization"),
      () =>
        getInboxSearch(db, {
          teamId,
          q,
          transactionId,
          limit,
        }),
    );

    return c.json(validateResponse(result, z.array(inboxItemResponseSchema)));
  },
);

app.openapi(
  createRoute({
    method: "get",
    path: "/by-status",
    summary: "List inbox items by status",
    operationId: "listInboxItemsByStatus",
    "x-speakeasy-name-override": "listByStatus",
    description: "Retrieve inbox items filtered by processing status.",
    tags: ["Inbox"],
    request: {
      query: getInboxByStatusSchema,
    },
    responses: {
      200: {
        description: "Inbox items for the given status",
        content: {
          "application/json": {
            schema: z.array(inboxItemResponseSchema),
          },
        },
      },
    },
    middleware: [withRequiredScope("inbox.read")],
  }),
  async (c) => {
    const db = c.get("db");
    const teamId = c.get("teamId");
    const { status } = c.req.valid("query");

    const result = await fetchInboxByStatusForRest(
      { status },
      c.req.header("Authorization"),
      () =>
        getInboxByStatus(db, {
          teamId,
          status,
        }),
    );

    return c.json(validateResponse(result, z.array(inboxItemResponseSchema)));
  },
);

app.openapi(
  createRoute({
    method: "get",
    path: "/blocklist",
    summary: "List inbox blocklist entries",
    operationId: "listInboxBlocklist",
    "x-speakeasy-name-override": "listBlocklist",
    description: "Retrieve blocked email addresses and domains for the team inbox.",
    tags: ["Inbox"],
    responses: {
      200: {
        description: "Blocklist entries",
        content: {
          "application/json": {
            schema: inboxBlocklistResponseSchema,
          },
        },
      },
    },
    middleware: [withRequiredScope("inbox.read")],
  }),
  async (c) => {
    const db = c.get("db");
    const teamId = c.get("teamId");

    const entries = await fetchInboxBlocklistForRest(
      c.req.header("Authorization"),
      () => getInboxBlocklist(db, { teamId }),
    );

    return c.json(
      validateResponse({ entries }, inboxBlocklistResponseSchema),
    );
  },
);

app.openapi(
  createRoute({
    method: "post",
    path: "/blocklist",
    summary: "Create inbox blocklist entry",
    operationId: "createInboxBlocklistEntry",
    "x-speakeasy-name-override": "createBlocklistEntry",
    description: "Block an email address or domain from the team inbox.",
    tags: ["Inbox"],
    request: {
      body: {
        required: true,
        content: {
          "application/json": {
            schema: createInboxBlocklistSchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: "Blocklist entry created",
        content: {
          "application/json": {
            schema: inboxBlocklistItemResponseSchema,
          },
        },
      },
    },
    middleware: [withRequiredScope("inbox.write")],
  }),
  async (c) => {
    const db = c.get("db");
    const teamId = c.get("teamId");
    const body = c.req.valid("json");

    const entry = await createInboxBlocklistForRest(
      { type: body.type, value: body.value },
      c.req.header("Authorization"),
      () =>
        createInboxBlocklist(db, {
          teamId,
          type: body.type,
          value: body.value,
        }),
    );

    return c.json(
      validateResponse(entry, inboxBlocklistItemResponseSchema),
      201,
    );
  },
);

app.openapi(
  createRoute({
    method: "delete",
    path: "/blocklist/{id}",
    summary: "Delete inbox blocklist entry",
    operationId: "deleteInboxBlocklistEntry",
    "x-speakeasy-name-override": "deleteBlocklistEntry",
    description: "Remove a blocked email or domain from the team inbox blocklist.",
    tags: ["Inbox"],
    request: {
      params: deleteInboxBlocklistSchema.pick({ id: true }),
    },
    responses: {
      200: {
        description: "Blocklist entry deleted",
        content: {
          "application/json": {
            schema: deleteInboxResponseSchema,
          },
        },
      },
    },
    middleware: [withRequiredScope("inbox.write")],
  }),
  async (c) => {
    const db = c.get("db");
    const teamId = c.get("teamId");
    const { id } = c.req.valid("param");

    const result = await deleteInboxBlocklistForRest(
      id,
      c.req.header("Authorization"),
      async () => {
        const deleted = await deleteInboxBlocklist(db, { id, teamId });
        if (!deleted) {
          throw new HTTPException(404, { message: "Blocklist entry not found" });
        }
        return deleted;
      },
    );

    return c.json(validateResponse(result, deleteInboxResponseSchema));
  },
);

app.openapi(
  createRoute({
    method: "post",
    path: "/confirm-match",
    summary: "Confirm a suggested inbox match",
    operationId: "confirmInboxMatch",
    "x-speakeasy-name-override": "confirmMatch",
    description: "Confirm an AI-suggested match between an inbox item and a transaction.",
    tags: ["Inbox"],
    request: {
      body: {
        required: true,
        content: {
          "application/json": {
            schema: confirmMatchSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Confirmed match",
        content: {
          "application/json": {
            schema: inboxItemResponseSchema,
          },
        },
      },
    },
    middleware: [withRequiredScope("inbox.write")],
  }),
  async (c) => {
    const db = c.get("db");
    const teamId = c.get("teamId");
    const userId = c.get("session").user.id;
    const body = c.req.valid("json");

    const result = await confirmInboxMatchForRest(
      body,
      c.req.header("Authorization"),
      () =>
        confirmSuggestedMatch(db, {
          teamId,
          suggestionId: body.suggestionId,
          inboxId: body.inboxId,
          transactionId: body.transactionId,
          userId,
        }),
    );

    if (result == null) {
      throw new HTTPException(404, { message: "Inbox item not found" });
    }

    return c.json(validateResponse(result, inboxItemResponseSchema));
  },
);

app.openapi(
  createRoute({
    method: "post",
    path: "/decline-match",
    summary: "Decline a suggested inbox match",
    operationId: "declineInboxMatch",
    "x-speakeasy-name-override": "declineMatch",
    description: "Decline an AI-suggested match for an inbox item.",
    tags: ["Inbox"],
    request: {
      body: {
        required: true,
        content: {
          "application/json": {
            schema: declineMatchSchema,
          },
        },
      },
    },
    responses: {
      204: {
        description: "Suggestion declined",
      },
    },
    middleware: [withRequiredScope("inbox.write")],
  }),
  async (c) => {
    const db = c.get("db");
    const teamId = c.get("teamId");
    const userId = c.get("session").user.id;
    const body = c.req.valid("json");

    await declineInboxMatchForRest(
      body,
      c.req.header("Authorization"),
      () =>
        declineSuggestedMatch(db, {
          suggestionId: body.suggestionId,
          inboxId: body.inboxId,
          userId,
          teamId,
        }),
    );

    return c.body(null, 204);
  },
);

app.openapi(
  createRoute({
    method: "delete",
    path: "/bulk",
    summary: "Bulk delete inbox items",
    operationId: "deleteInboxItems",
    "x-speakeasy-name-override": "deleteMany",
    description: "Delete multiple inbox items for the authenticated team.",
    tags: ["Inbox"],
    request: {
      body: {
        required: true,
        content: {
          "application/json": {
            schema: deleteInboxManySchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Deleted inbox item IDs",
        content: {
          "application/json": {
            schema: z.array(deleteInboxResponseSchema),
          },
        },
      },
    },
    middleware: [withRequiredScope("inbox.write")],
  }),
  async (c) => {
    const db = c.get("db");
    const teamId = c.get("teamId");
    const ids = c.req.valid("json");

    const result = await deleteInboxManyForRest(
      ids,
      c.req.header("Authorization"),
      async () => {
        const rows = await deleteInboxMany(db, { ids, teamId });
        return rows.map((row) => ({ id: row.id }));
      },
    );

    return c.json(validateResponse(result, z.array(deleteInboxResponseSchema)));
  },
);

app.openapi(
  createRoute({
    method: "get",
    path: "/{id}",
    summary: "Retrieve a inbox item",
    operationId: "getInboxItemById",
    "x-speakeasy-name-override": "get",
    description:
      "Retrieve a inbox item by its unique identifier for the authenticated team.",
    tags: ["Inbox"],
    request: {
      params: getInboxByIdSchema.pick({ id: true }),
    },
    responses: {
      200: {
        description: "Retrieve an inbox item by its ID.",
        content: {
          "application/json": {
            schema: inboxItemResponseSchema,
          },
        },
      },
    },
    middleware: [withRequiredScope("inbox.read")],
  }),
  async (c) => {
    const db = c.get("db");
    const teamId = c.get("teamId");
    const { id } = c.req.valid("param");

    const result = await fetchInboxByIdForRest(
      id,
      c.req.header("Authorization"),
      () =>
        getInboxById(db, {
          id,
          teamId,
        }),
    );

    if (result == null) {
      throw new HTTPException(404, { message: "Inbox item not found" });
    }

    return c.json(validateResponse(result, inboxItemResponseSchema));
  },
);

app.openapi(
  createRoute({
    method: "post",
    path: "/{id}/presigned-url",
    summary: "Generate pre-signed URL for inbox attachment",
    operationId: "getInboxPreSignedUrl",
    "x-speakeasy-name-override": "getPreSignedUrl",
    description:
      "Generate a pre-signed URL for accessing an inbox attachment. The URL is valid for 60 seconds and allows secure temporary access to the attachment file.",
    tags: ["Inbox"],
    request: {
      params: getInboxPreSignedUrlSchema.pick({ id: true }),
      query: getInboxPreSignedUrlSchema.pick({ download: true }),
    },
    responses: {
      200: {
        description: "Pre-signed URL generated successfully",
        content: {
          "application/json": {
            schema: inboxPreSignedUrlResponseSchema,
          },
        },
      },
      400: {
        description: "Bad request - Attachment file path not available",
        content: {
          "application/json": {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
      },
      404: {
        description: "Inbox item not found",
        content: {
          "application/json": {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
      },
      500: {
        description:
          "Internal server error - Failed to generate pre-signed URL",
        content: {
          "application/json": {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
      },
    },
    middleware: [withRequiredScope("inbox.read")],
  }),
  async (c) => {
    const db = c.get("db");
    const teamId = c.get("teamId");
    const { id } = c.req.valid("param");
    const { download = true } = c.req.valid("query");
    const sessionAccessToken = extractBearerToken(c.req.header("Authorization"));
    const expireIn = 60;

    const delegatedInbox = await tryDelegateInboxGetById(id, sessionAccessToken);

    if (delegatedInbox.delegated) {
      const inboxItem = delegatedInbox.item;

      if (!inboxItem) {
        return c.json({ error: "Inbox item not found" }, 404);
      }

      const filePath = normalizeVaultObjectPath(inboxItem.filePath);
      if (!filePath) {
        return c.json({ error: "Attachment file path not available" }, 400);
      }

      const fileName =
        inboxItem.fileName ||
        (Array.isArray(inboxItem.filePath)
          ? inboxItem.filePath.at(-1)
          : null) ||
        null;

      const presigned = await fetchReplacementVaultPresignedUrl(
        filePath,
        expireIn,
        fileName,
        sessionAccessToken,
      );

      if (presigned !== "legacy") {
        return c.json(
          validateResponse(presigned, inboxPreSignedUrlResponseSchema),
          200,
        );
      }
    }

    const inboxItem = await getInboxById(db, {
      id,
      teamId,
    });

    if (!inboxItem) {
      return c.json({ error: "Inbox item not found" }, 404);
    }

    const filePath = normalizeVaultObjectPath(inboxItem.filePath);
    if (!filePath) {
      return c.json({ error: "Attachment file path not available" }, 400);
    }

    const supabase = await createAdminClient();

    const { data, error } = await signedUrl(supabase, {
      bucket: "vault",
      path: filePath,
      expireIn,
      options: {
        download,
      },
    });

    if (error || !data?.signedUrl) {
      return c.json({ error: "Failed to generate pre-signed URL" }, 500);
    }

    const result = {
      url: data.signedUrl,
      expiresAt: new Date(Date.now() + expireIn * 1000).toISOString(),
      fileName: inboxItem.fileName || inboxItem.filePath?.at(-1) || null,
    };

    return c.json(
      validateResponse(result, inboxPreSignedUrlResponseSchema),
      200,
    );
  },
);

app.openapi(
  createRoute({
    method: "post",
    path: "/{id}/match",
    summary: "Match inbox item to transaction",
    operationId: "matchInboxItem",
    "x-speakeasy-name-override": "match",
    description: "Link an inbox item to a transaction.",
    tags: ["Inbox"],
    request: {
      params: getInboxByIdSchema.pick({ id: true }),
      body: {
        required: true,
        content: {
          "application/json": {
            schema: matchInboxItemBodySchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Matched inbox item",
        content: {
          "application/json": {
            schema: inboxItemResponseSchema,
          },
        },
      },
    },
    middleware: [withRequiredScope("inbox.write")],
  }),
  async (c) => {
    const db = c.get("db");
    const teamId = c.get("teamId");
    const { id } = c.req.valid("param");
    const { transactionId } = c.req.valid("json");

    const result = await matchInboxForRest(
      id,
      transactionId,
      c.req.header("Authorization"),
      () => matchTransaction(db, { id, transactionId, teamId }),
    );

    if (result == null) {
      throw new HTTPException(404, { message: "Inbox item not found" });
    }

    return c.json(validateResponse(result, inboxItemResponseSchema));
  },
);

app.openapi(
  createRoute({
    method: "post",
    path: "/{id}/unmatch",
    summary: "Unmatch inbox item from transaction",
    operationId: "unmatchInboxItem",
    "x-speakeasy-name-override": "unmatch",
    description: "Remove the link between an inbox item and its transaction.",
    tags: ["Inbox"],
    request: {
      params: getInboxByIdSchema.pick({ id: true }),
    },
    responses: {
      200: {
        description: "Unmatched inbox rows",
        content: {
          "application/json": {
            schema: z.array(inboxItemResponseSchema),
          },
        },
      },
    },
    middleware: [withRequiredScope("inbox.write")],
  }),
  async (c) => {
    const db = c.get("db");
    const teamId = c.get("teamId");
    const userId = c.get("session").user.id;
    const { id } = c.req.valid("param");

    const result = await unmatchInboxForRest(
      id,
      c.req.header("Authorization"),
      () =>
        unmatchTransaction(db, {
          id,
          teamId,
          userId,
        }),
    );

    if (result == null) {
      throw new HTTPException(404, { message: "Inbox item not found" });
    }

    return c.json(validateResponse(result, z.array(inboxItemResponseSchema)));
  },
);

app.openapi(
  createRoute({
    method: "delete",
    path: "/{id}",
    summary: "Delete a inbox item",
    operationId: "deleteInboxItem",
    "x-speakeasy-name-override": "delete",
    description:
      "Delete a inbox item by its unique identifier for the authenticated team.",
    tags: ["Inbox"],
    request: {
      params: deleteInboxSchema.pick({ id: true }),
    },
    responses: {
      200: {
        description: "Delete a inbox item by its ID.",
        content: {
          "application/json": {
            schema: deleteInboxResponseSchema,
          },
        },
      },
    },
    middleware: [withRequiredScope("inbox.write")],
  }),
  async (c) => {
    const db = c.get("db");
    const teamId = c.get("teamId");
    const { id } = c.req.valid("param");

    const result = await deleteInboxForRest(
      id,
      c.req.header("Authorization"),
      async () => {
        try {
          const deleted = await deleteInbox(db, { id, teamId });
          if (!deleted?.id) {
            return null;
          }
          return { id: deleted.id };
        } catch {
          throw new HTTPException(404, { message: "Inbox item not found" });
        }
      },
    );

    if (!result) {
      throw new HTTPException(404, { message: "Inbox item not found" });
    }

    return c.json(validateResponse(result, deleteInboxResponseSchema));
  },
);

app.openapi(
  createRoute({
    method: "patch",
    path: "/{id}",
    summary: "Update a inbox item",
    operationId: "updateInboxItem",
    "x-speakeasy-name-override": "update",
    description:
      "Update fields of an inbox item by its unique identifier for the authenticated team.",
    tags: ["Inbox"],
    request: {
      params: updateInboxSchema.pick({ id: true }),
      body: {
        content: {
          "application/json": {
            schema: updateInboxSchema.omit({ id: true }),
          },
        },
        required: true,
      },
    },
    responses: {
      200: {
        description:
          "Update fields of an inbox item by its unique identifier for the authenticated team.",
        content: {
          "application/json": {
            schema: inboxItemResponseSchema,
          },
        },
      },
    },
    middleware: [withRequiredScope("inbox.write")],
  }),
  async (c) => {
    const db = c.get("db");
    const teamId = c.get("teamId");
    const id = c.req.valid("param").id;
    const body = c.req.valid("json");

    const result = await updateInboxForRest(
      id,
      body,
      c.req.header("Authorization"),
      () => updateInbox(db, { ...body, id, teamId }),
    );

    if (result == null) {
      throw new HTTPException(404, { message: "Inbox item not found" });
    }

    return c.json(validateResponse(result, inboxItemResponseSchema));
  },
);

export const inboxRouter = app;

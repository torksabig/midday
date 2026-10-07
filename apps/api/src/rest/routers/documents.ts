import type { Context } from "@api/rest/types";
import {
  deleteDocumentResponseSchema,
  deleteDocumentSchema,
  documentResponseSchema,
  documentsResponseSchema,
  getDocumentPreSignedUrlSchema,
  getDocumentSchema,
  getDocumentsSchema,
  preSignedUrlResponseSchema,
} from "@api/schemas/documents";
import {
  extractBearerToken,
  fetchReplacementVaultPresignedUrl,
  normalizeVaultObjectPath,
} from "@api/rest/services/vault-presigned-url";
import {
  deleteDocumentForRest,
  fetchDocumentByIdForRest,
  fetchDocumentsListForRest,
} from "@api/rest/services/replacement-rest-documents";
import { tryDelegateDocumentsGetById } from "@api/services/replacement-delegation";
import { createAdminClient } from "@api/services/supabase";
import { validateResponse } from "@api/utils/validate-response";
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";

const errorResponseSchema = z.object({
  error: z.string(),
});

import {
  deleteDocument,
  getDocumentById,
  getDocuments,
} from "@midday/db/queries";
import { signedUrl } from "@midday/supabase/storage";
import { withRequiredScope } from "../middleware";

const app = new OpenAPIHono<Context>();

app.openapi(
  createRoute({
    method: "get",
    path: "/",
    summary: "List all documents",
    operationId: "listDocuments",
    "x-speakeasy-name-override": "list",
    description: "Retrieve a list of documents for the authenticated team.",
    tags: ["Documents"],
    request: {
      query: getDocumentsSchema,
    },
    responses: {
      200: {
        description: "Retrieve a list of documents for the authenticated team.",
        content: {
          "application/json": {
            schema: documentsResponseSchema,
          },
        },
      },
    },
    middleware: [withRequiredScope("documents.read")],
  }),
  async (c) => {
    const db = c.get("db");
    const teamId = c.get("teamId");
    const { pageSize, cursor, sort: _sort, ...filter } = c.req.valid("query");

    const result = await fetchDocumentsListForRest(
      {
        cursor,
        pageSize,
        ...filter,
      },
      c.req.header("Authorization"),
      () =>
        getDocuments(db, {
          teamId,
          pageSize,
          cursor,
          ...filter,
        }),
    );

    return c.json(validateResponse(result, documentsResponseSchema));
  },
);

app.openapi(
  createRoute({
    method: "get",
    path: "/{id}",
    summary: "Retrieve a document",
    operationId: "getDocumentById",
    "x-speakeasy-name-override": "get",
    description:
      "Retrieve a document by its unique identifier for the authenticated team.",
    tags: ["Documents"],
    request: {
      params: getDocumentSchema.pick({ id: true }),
    },
    responses: {
      200: {
        description: "Retrieve a document by its unique identifier",
        content: {
          "application/json": {
            schema: documentResponseSchema,
          },
        },
      },
    },
    middleware: [withRequiredScope("documents.read")],
  }),
  async (c) => {
    const db = c.get("db");
    const teamId = c.get("teamId");
    const { id: documentId } = c.req.valid("param");
    if (!documentId) {
      throw new HTTPException(400, { message: "Missing document id" });
    }

    const result = await fetchDocumentByIdForRest(
      documentId,
      c.req.header("Authorization"),
      () =>
        getDocumentById(db, {
          teamId,
          id: documentId,
        }),
    );

    if (result == null) {
      throw new HTTPException(404, { message: "Document not found" });
    }

    return c.json(validateResponse(result, documentResponseSchema));
  },
);

app.openapi(
  createRoute({
    method: "post",
    path: "/{id}/presigned-url",
    summary: "Generate pre-signed URL for document",
    operationId: "getDocumentPreSignedUrl",
    "x-speakeasy-name-override": "getPreSignedUrl",
    description:
      "Generate a pre-signed URL for accessing a document. The URL is valid for 60 seconds and allows secure temporary access to the document file.",
    tags: ["Documents"],
    request: {
      params: getDocumentPreSignedUrlSchema.pick({ id: true }),
      query: getDocumentPreSignedUrlSchema.pick({ download: true }),
    },
    responses: {
      200: {
        description: "Pre-signed URL generated successfully",
        content: {
          "application/json": {
            schema: preSignedUrlResponseSchema,
          },
        },
      },
      400: {
        description: "Bad request - Document file path not available",
        content: {
          "application/json": {
            schema: errorResponseSchema,
          },
        },
      },
      404: {
        description: "Document not found",
        content: {
          "application/json": {
            schema: errorResponseSchema,
          },
        },
      },
      500: {
        description:
          "Internal server error - Failed to generate pre-signed URL",
        content: {
          "application/json": {
            schema: errorResponseSchema,
          },
        },
      },
    },
    middleware: [withRequiredScope("documents.read")],
  }),
  async (c) => {
    const db = c.get("db");
    const teamId = c.get("teamId");
    const { id } = c.req.valid("param");
    const { download = true } = c.req.valid("query");
    const sessionAccessToken = extractBearerToken(c.req.header("Authorization"));
    const expireIn = 60;

    try {
      const delegatedDoc = await tryDelegateDocumentsGetById(
        id,
        null,
        sessionAccessToken,
      );

      if (delegatedDoc.delegated) {
        const document = delegatedDoc.document as {
          pathTokens?: string[] | null;
          name?: string | null;
        } | null;

        if (!document) {
          return c.json({ error: "Document not found" }, 404);
        }

        const filePath = normalizeVaultObjectPath(document.pathTokens);
        if (!filePath) {
          return c.json({ error: "Document file path not available" }, 400);
        }

        const fileName =
          document.pathTokens?.at(-1) ||
          document.name?.split("/").at(-1) ||
          null;

        const presigned = await fetchReplacementVaultPresignedUrl(
          filePath,
          expireIn,
          fileName,
          sessionAccessToken,
        );

        if (presigned !== "legacy") {
          return c.json(
            validateResponse(presigned, preSignedUrlResponseSchema),
            200,
          );
        }
      }

      const document = await getDocumentById(db, {
        id,
        teamId,
      });

      if (!document) {
        return c.json({ error: "Document not found" }, 404);
      }

      const filePath = normalizeVaultObjectPath(document.pathTokens);
      if (!filePath) {
        return c.json({ error: "Document file path not available" }, 400);
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
        fileName:
          document.pathTokens?.at(-1) ||
          document.name?.split("/").at(-1) ||
          null,
      };

      return c.json(validateResponse(result, preSignedUrlResponseSchema), 200);
    } catch (_error) {
      return c.json({ error: "Failed to generate pre-signed URL" }, 500);
    }
  },
);

app.openapi(
  createRoute({
    method: "delete",
    path: "/{id}",
    summary: "Delete a document",
    operationId: "deleteDocument",
    "x-speakeasy-name-override": "delete",
    description:
      "Delete a document by its unique identifier for the authenticated team.",
    tags: ["Documents"],
    request: {
      params: deleteDocumentSchema,
    },
    responses: {
      200: {
        description: "Document deleted successfully",
        content: {
          "application/json": {
            schema: deleteDocumentResponseSchema,
          },
        },
      },
    },
    middleware: [withRequiredScope("documents.write")],
  }),
  async (c) => {
    const db = c.get("db");
    const teamId = c.get("teamId");
    const id = c.req.valid("param").id;

    const result = await deleteDocumentForRest(
      id,
      c.req.header("Authorization"),
      () => deleteDocument(db, { teamId, id }),
    );

    if (!result) {
      throw new HTTPException(404, { message: "Document not found" });
    }

    return c.json(validateResponse(result, deleteDocumentResponseSchema));
  },
);

export const documentsRouter = app;

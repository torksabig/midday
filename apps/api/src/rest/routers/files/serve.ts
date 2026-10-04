import type { Context } from "@api/rest/types";
import { proxyFileSchema } from "@api/schemas/files";
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { withDatabase } from "../../middleware/db";
import { withFileAuth } from "../../middleware/file-auth";
import { withClientIp } from "../../middleware/ip";
import { forwardVaultFileToRust } from "./forward-to-rust";

const app = new OpenAPIHono<Context>();

const errorResponseSchema = z.object({
  error: z.string(),
});

app.openapi(
  createRoute({
    method: "get",
    path: "/proxy",
    summary: "Proxy file from storage",
    operationId: "proxyFile",
    "x-speakeasy-name-override": "proxy",
    description:
      "Proxies a file from storage. Requires team file key (fk) query parameter for access.",
    tags: ["Files"],
    request: {
      query: proxyFileSchema,
    },
    responses: {
      200: {
        description: "File content",
        content: {
          "application/octet-stream": {
            schema: {
              type: "string",
              format: "binary",
            },
          },
        },
      },
      400: {
        description: "Bad request",
        content: {
          "application/json": {
            schema: errorResponseSchema,
          },
        },
      },
      404: {
        description: "Not found",
        content: {
          "application/json": {
            schema: errorResponseSchema,
          },
        },
      },
      500: {
        description: "Internal server error",
        content: {
          "application/json": {
            schema: errorResponseSchema,
          },
        },
      },
    },
    middleware: [withClientIp, withDatabase, withFileAuth],
  }),
  async (c) => {
    // Auth middleware already validated `fk` + path team; stream from Rust.
    return forwardVaultFileToRust(c);
  },
);

export { app as serveRouter };

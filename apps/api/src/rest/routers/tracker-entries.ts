import {
  bulkCreateTrackerEntriesForRest,
  deleteTrackerEntryForRest,
  fetchTrackerEntriesByRangeForRest,
  getCurrentTimerForRest,
  getTimerStatusForRest,
  mapTrackerEntriesForRestResponse,
  startTimerForRest,
  stopTimerForRest,
  upsertTrackerEntriesForRest,
} from "@api/rest/services/replacement-rest-tracker-entries";
import type { Context } from "@api/rest/types";
import {
  bulkCreateTrackerEntriesSchema,
  createTrackerEntriesResponseSchema,
  deleteTrackerEntrySchema,
  getCurrentTimerResponseSchema,
  getCurrentTimerSchema,
  getTimerStatusResponseSchema,
  getTrackerRecordsByRangeSchema,
  startTimerResponseSchema,
  startTimerSchema,
  stopTimerResponseSchema,
  stopTimerSchema,
  trackerEntriesResponseSchema,
  upsertTrackerEntriesSchema,
} from "@api/schemas/tracker-entries";
import { validateResponse } from "@api/utils/validate-response";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import {
  bulkCreateTrackerEntries,
  deleteTrackerEntry,
  getCurrentTimer,
  getTimerStatus,
  getTrackerRecordsByRange,
  startTimer,
  stopTimer,
  upsertTrackerEntries,
} from "@midday/db/queries";
import { HTTPException } from "hono/http-exception";
import { withRequiredScope } from "../middleware";

const app = new OpenAPIHono<Context>();

app.openapi(
  createRoute({
    method: "get",
    path: "/",
    summary: "List all tracker entries",
    operationId: "listTrackerEntries",
    "x-speakeasy-name-override": "list",
    description: "List all tracker entries for the authenticated team.",
    tags: ["Tracker Entries"],
    request: {
      query: getTrackerRecordsByRangeSchema,
    },
    responses: {
      200: {
        description: "List all tracker entries for the authenticated team.",
        content: {
          "application/json": {
            schema: trackerEntriesResponseSchema,
          },
        },
      },
    },
    middleware: [withRequiredScope("tracker-entries.read")],
  }),
  async (c) => {
    const db = c.get("db");
    const teamId = c.get("teamId");

    const query = c.req.valid("query");

    const result = await fetchTrackerEntriesByRangeForRest(
      query,
      c.req.header("Authorization"),
      () =>
        getTrackerRecordsByRange(db, {
          teamId,
          ...query,
        }),
    );

    return c.json(validateResponse(result, trackerEntriesResponseSchema));
  },
);

app.openapi(
  createRoute({
    method: "post",
    path: "/",
    summary: "Create a tracker entry",
    operationId: "createTrackerEntry",
    "x-speakeasy-name-override": "create",
    description: "Create a tracker entry for the authenticated team.",
    tags: ["Tracker Entries"],
    request: {
      body: {
        content: {
          "application/json": {
            schema: upsertTrackerEntriesSchema.omit({ id: true }),
          },
        },
      },
    },
    responses: {
      201: {
        description: "Tracker entry created successfully.",
        content: {
          "application/json": {
            schema: createTrackerEntriesResponseSchema,
          },
        },
      },
    },
    middleware: [withRequiredScope("tracker-entries.write")],
  }),
  async (c) => {
    const db = c.get("db");
    const teamId = c.get("teamId");
    const session = c.get("session");
    const { assignedId, ...rest } = c.req.valid("json");

    const result = await upsertTrackerEntriesForRest(
      {
        assignedId: assignedId ?? session.user.id,
        ...rest,
      },
      c.req.header("Authorization"),
      async () => {
        const rows = await upsertTrackerEntries(db, {
          teamId,
          assignedId: assignedId ?? session.user.id,
          ...rest,
        });
        return mapTrackerEntriesForRestResponse(rows);
      },
    );

    return c.json(
      validateResponse({ data: result }, createTrackerEntriesResponseSchema),
    );
  },
);

app.openapi(
  createRoute({
    method: "post",
    path: "/bulk",
    summary: "Create multiple tracker entries",
    operationId: "createTrackerEntriesBulk",
    "x-speakeasy-name-override": "createBulk",
    description:
      "Create multiple tracker entries in a single request for efficient data migration.",
    tags: ["Tracker Entries"],
    request: {
      body: {
        content: {
          "application/json": {
            schema: bulkCreateTrackerEntriesSchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: "Tracker entries created successfully.",
        content: {
          "application/json": {
            schema: createTrackerEntriesResponseSchema,
          },
        },
      },
    },
    middleware: [withRequiredScope("tracker-entries.write")],
  }),
  async (c) => {
    const db = c.get("db");
    const teamId = c.get("teamId");
    const session = c.get("session");
    const { entries } = c.req.valid("json");
    const normalizedEntries = entries.map(({ assignedId, ...rest }) => ({
      assignedId: assignedId ?? session.user.id,
      ...rest,
    }));

    const result = await bulkCreateTrackerEntriesForRest(
      normalizedEntries,
      c.req.header("Authorization"),
      async () => {
        const rows = await bulkCreateTrackerEntries(db, {
          teamId,
          entries: normalizedEntries,
        });
        return mapTrackerEntriesForRestResponse(rows) as unknown[];
      },
    );

    return c.json(
      validateResponse(
        { data: result },
        createTrackerEntriesResponseSchema,
      ),
    );
  },
);

app.openapi(
  createRoute({
    method: "patch",
    path: "/{id}",
    summary: "Update a tracker entry",
    operationId: "updateTrackerEntry",
    "x-speakeasy-name-override": "update",
    description: "Update a tracker entry for the authenticated team.",
    tags: ["Tracker Entries"],
    request: {
      params: deleteTrackerEntrySchema.pick({ id: true }),
      body: {
        content: {
          "application/json": {
            schema: upsertTrackerEntriesSchema.omit({ id: true }),
          },
        },
      },
    },
    responses: {
      200: {
        description: "Tracker entry updated successfully.",
        content: {
          "application/json": {
            schema: createTrackerEntriesResponseSchema,
          },
        },
      },
    },
    middleware: [withRequiredScope("tracker-entries.write")],
  }),
  async (c) => {
    const db = c.get("db");
    const teamId = c.get("teamId");
    const { id } = c.req.valid("param");
    const { assignedId, ...rest } = c.req.valid("json");

    const result = await upsertTrackerEntriesForRest(
      {
        id,
        ...rest,
        ...(assignedId !== undefined && { assignedId }),
      },
      c.req.header("Authorization"),
      async () => {
        const rows = await upsertTrackerEntries(db, {
          id,
          teamId,
          ...rest,
          ...(assignedId !== undefined && { assignedId }),
        });
        return mapTrackerEntriesForRestResponse(rows);
      },
    );

    return c.json(
      validateResponse({ data: result }, createTrackerEntriesResponseSchema),
    );
  },
);

app.openapi(
  createRoute({
    method: "delete",
    path: "/{id}",
    summary: "Delete a tracker entry",
    operationId: "deleteTrackerEntry",
    "x-speakeasy-name-override": "delete",
    description: "Delete a tracker entry for the authenticated team.",
    tags: ["Tracker Entries"],
    request: {
      params: deleteTrackerEntrySchema.pick({ id: true }),
    },
    responses: {
      200: {
        description: "Tracker entry deleted successfully.",
        content: {
          "application/json": {
            schema: deleteTrackerEntrySchema,
          },
        },
      },
    },
    middleware: [withRequiredScope("tracker-entries.write")],
  }),
  async (c) => {
    const db = c.get("db");
    const teamId = c.get("teamId");
    const { id } = c.req.valid("param");

    const result = await deleteTrackerEntryForRest(
      id,
      c.req.header("Authorization"),
      () => deleteTrackerEntry(db, { teamId, id }),
    );

    if (!result) {
      throw new HTTPException(404, { message: "Tracker entry not found" });
    }

    return c.json(validateResponse(result, deleteTrackerEntrySchema));
  },
);

// Timer endpoints
app.openapi(
  createRoute({
    method: "post",
    path: "/timer/start",
    summary: "Start a timer",
    operationId: "startTimer",
    "x-speakeasy-name-override": "startTimer",
    description: "Start a new timer or continue from a paused entry.",
    tags: ["Tracker Timer"],
    request: {
      body: {
        content: {
          "application/json": {
            schema: startTimerSchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: "Timer started successfully.",
        content: {
          "application/json": {
            schema: startTimerResponseSchema,
          },
        },
      },
    },
    middleware: [withRequiredScope("tracker-entries.write")],
  }),
  async (c) => {
    const db = c.get("db");
    const teamId = c.get("teamId");
    const session = c.get("session");
    const { assignedId, ...rest } = c.req.valid("json");

    const result = await startTimerForRest(
      {
        assignedId: assignedId ?? session.user.id,
        ...rest,
      },
      c.req.header("Authorization"),
      () =>
        startTimer(db, {
          teamId,
          assignedId: assignedId ?? session.user.id,
          ...rest,
        }),
    );

    return c.json(
      validateResponse({ data: result }, startTimerResponseSchema),
      201,
    );
  },
);

app.openapi(
  createRoute({
    method: "post",
    path: "/timer/stop",
    summary: "Stop a timer",
    operationId: "stopTimer",
    "x-speakeasy-name-override": "stopTimer",
    description: "Stop the current running timer or a specific timer entry.",
    tags: ["Tracker Timer"],
    request: {
      body: {
        content: {
          "application/json": {
            schema: stopTimerSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Timer stopped successfully.",
        content: {
          "application/json": {
            schema: stopTimerResponseSchema,
          },
        },
      },
    },
    middleware: [withRequiredScope("tracker-entries.write")],
  }),
  async (c) => {
    const db = c.get("db");
    const teamId = c.get("teamId");
    const session = c.get("session");
    const { assignedId, ...rest } = c.req.valid("json");

    let result: Awaited<ReturnType<typeof stopTimer>>;
    try {
      result = (await stopTimerForRest(
        {
          assignedId: assignedId ?? session.user.id,
          ...rest,
        },
        c.req.header("Authorization"),
        () =>
          stopTimer(db, {
            teamId,
            assignedId: assignedId ?? session.user.id,
            ...rest,
          }),
      )) as Awaited<ReturnType<typeof stopTimer>>;
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(404, { message: "No running timer found" });
    }

    return c.json(validateResponse({ data: result }, stopTimerResponseSchema));
  },
);

app.openapi(
  createRoute({
    method: "get",
    path: "/timer/current",
    summary: "Get current timer",
    operationId: "getCurrentTimer",
    "x-speakeasy-name-override": "getCurrentTimer",
    description: "Get the currently running timer for the authenticated user.",
    tags: ["Tracker Timer"],
    request: {
      query: getCurrentTimerSchema,
    },
    responses: {
      200: {
        description: "Current timer retrieved successfully.",
        content: {
          "application/json": {
            schema: getCurrentTimerResponseSchema,
          },
        },
      },
    },
    middleware: [withRequiredScope("tracker-entries.read")],
  }),
  async (c) => {
    const db = c.get("db");
    const teamId = c.get("teamId");
    const session = c.get("session");
    const { assignedId } = c.req.valid("query");

    const resolvedAssignedId = assignedId ?? session.user.id;

    const result = await getCurrentTimerForRest(
      { assignedId: resolvedAssignedId },
      c.req.header("Authorization"),
      () =>
        getCurrentTimer(db, {
          teamId,
          assignedId: resolvedAssignedId,
        }),
    );

    return c.json(
      validateResponse({ data: result }, getCurrentTimerResponseSchema),
    );
  },
);

app.openapi(
  createRoute({
    method: "get",
    path: "/timer/status",
    summary: "Get timer status",
    operationId: "getTimerStatus",
    "x-speakeasy-name-override": "getTimerStatus",
    description:
      "Get timer status including elapsed time for the authenticated user.",
    tags: ["Tracker Timer"],
    request: {
      query: getCurrentTimerSchema,
    },
    responses: {
      200: {
        description: "Timer status retrieved successfully.",
        content: {
          "application/json": {
            schema: getTimerStatusResponseSchema,
          },
        },
      },
    },
    middleware: [withRequiredScope("tracker-entries.read")],
  }),
  async (c) => {
    const db = c.get("db");
    const teamId = c.get("teamId");
    const session = c.get("session");
    const { assignedId } = c.req.valid("query");

    const resolvedAssignedId = assignedId ?? session.user.id;

    const result = await getTimerStatusForRest(
      { assignedId: resolvedAssignedId },
      c.req.header("Authorization"),
      () =>
        getTimerStatus(db, {
          teamId,
          assignedId: resolvedAssignedId,
        }),
    );

    return c.json(
      validateResponse({ data: result }, getTimerStatusResponseSchema),
    );
  },
);

export const trackerEntriesRouter = app;

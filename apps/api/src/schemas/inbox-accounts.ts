import { z } from "@hono/zod-openapi";

export const connectInboxAccountSchema = z.object({
  provider: z.enum(["gmail", "outlook"]),
  redirectPath: z.string().optional(),
});

export const exchangeCodeForAccountSchema = z.object({
  code: z.string(),
  provider: z.enum(["gmail", "outlook"]),
});

export const deleteInboxAccountSchema = z.object({ id: z.string() });

export const syncInboxAccountSchema = z.object({
  id: z.string(),
  manualSync: z.boolean().optional(),
});

/** Trigger.dev schedule teardown after dashboard Rust inbox account delete. */
export const enqueueDeleteInboxAccountScheduleSchema = z.object({
  scheduleId: z.string(),
});

export const initialSetupInboxAccountSchema = z.object({
  inboxAccountId: z.string().uuid(),
});

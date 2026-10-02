"use server";

import { LogEvents } from "@midday/events/events";
import type { SyncConnectionPayload } from "@midday/jobs/schema";
import { tasks } from "@trigger.dev/sdk";
import { z } from "zod";
import { authActionClient } from "@/actions/safe-action";
import { bankConnectionsServerQueryOptions } from "@/lib/rust-api/bank-connections-server";
import { getQueryClient, trpc } from "@/trpc/server";

export const manualSyncTransactionsAction = authActionClient
  .schema(
    z.object({
      connectionId: z.string(),
    }),
  )
  .metadata({
    name: "manual-sync-transactions",
    track: {
      event: LogEvents.TransactionsManualSync.name,
      channel: LogEvents.TransactionsManualSync.channel,
    },
  })
  .action(async ({ parsedInput: { connectionId } }) => {
    // Verify the connection belongs to the caller's team
    const queryClient = getQueryClient();
    const connections = await queryClient.fetchQuery(
      bankConnectionsServerQueryOptions(trpc.bankConnections.get.queryKey()),
    );

    const ownsConnection = connections?.some(
      (conn) => conn.id === connectionId,
    );

    if (!ownsConnection) {
      throw new Error("Connection not found");
    }

    const event = await tasks.trigger("sync-connection", {
      connectionId,
      manualSync: true,
    } satisfies SyncConnectionPayload);

    return event;
  });

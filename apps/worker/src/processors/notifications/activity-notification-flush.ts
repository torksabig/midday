import {
  buildBatchSummary,
  deliverActivityNotificationBatch,
  flushDueActivityNotificationBatches,
  type ProviderNotificationType,
} from "@midday/bot";
import type { Job } from "bullmq";
import { z } from "zod";
import { getDb } from "../../utils/db";
import { BaseProcessor } from "../base";
import {
  activityNotificationFlushDelegationTarget,
  postActivityNotificationFlushClaim,
  postActivityNotificationFlushComplete,
  type ActivityNotificationFlushCompletion,
  type ActivityNotificationPendingBatch,
} from "./activity-notification-flush-delegate";

const flushPayloadSchema = z.object({});

export class ActivityNotificationFlushProcessor extends BaseProcessor<
  z.infer<typeof flushPayloadSchema>
> {
  protected override getPayloadSchema() {
    return flushPayloadSchema;
  }

  async process(_job: Job<z.infer<typeof flushPayloadSchema>>) {
    const target = activityNotificationFlushDelegationTarget();
    if (target) {
      try {
        const claimed = await postActivityNotificationFlushClaim(target);
        const completions: ActivityNotificationFlushCompletion[] = [];

        for (const pending of claimed.pending) {
          completions.push(await this.deliverPending(pending));
        }

        if (completions.length > 0) {
          await postActivityNotificationFlushComplete(completions, target);
        }

        this.logger.info("activity-notification-flush completed via rust", {
          skipped: claimed.skipped,
          pending: claimed.pending.length,
          completed: completions.length,
        });

        return {
          flushed: true,
          skipped: claimed.skipped,
          delivered: completions.filter((c) => c.delivered).length,
        };
      } catch (error) {
        if (target.mode === "replacement") {
          throw error;
        }
        this.logger.warn(
          "activity-notification-flush rust failed; falling back to drizzle",
          {
            error: error instanceof Error ? error.message : "unknown",
          },
        );
      }
    }

    await flushDueActivityNotificationBatches(getDb());

    return { flushed: true };
  }

  private async deliverPending(
    pending: ActivityNotificationPendingBatch,
  ): Promise<ActivityNotificationFlushCompletion> {
    const eventFamily =
      pending.eventFamily as Exclude<ProviderNotificationType, "match">;
    const entries = Array.isArray(pending.entries) ? pending.entries : [];

    const summary = buildBatchSummary(eventFamily, entries, {
      teamId: pending.teamId,
      userId: pending.userId,
      provider: pending.provider as
        | "slack"
        | "telegram"
        | "whatsapp"
        | "sendblue",
    });

    if (!summary) {
      return { batchId: pending.batchId, delivered: false };
    }

    const sent = await deliverActivityNotificationBatch({
      app: {
        id: pending.app.id,
        appId: pending.app.appId,
        teamId: pending.app.teamId,
        config: pending.app.config,
        settings: pending.app.settings,
      },
      identity: {
        id: pending.identity.id,
        provider: pending.identity.provider,
        externalUserId: pending.identity.externalUserId,
        externalChannelId: pending.identity.externalChannelId,
        teamId: pending.identity.teamId,
        userId: pending.identity.userId,
        metadata: pending.identity.metadata,
      },
      text: summary.text,
      eventFamily: pending.eventFamily,
      entries,
    });

    if (!sent) {
      return { batchId: pending.batchId, delivered: false };
    }

    return {
      batchId: pending.batchId,
      identityId: pending.identity.id,
      delivered: true,
      notificationContext: summary.context,
      identityMetadata: {
        lastNotificationContext: summary.context,
        lastNotificationSentAt: summary.context.sentAt,
      },
    };
  }
}

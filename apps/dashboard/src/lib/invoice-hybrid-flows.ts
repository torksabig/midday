"use client";

import type { RouterInputs } from "@api/trpc/routers/_app";
import {
  deleteInvoiceRecurringFromRust,
  pauseInvoiceRecurringFromRust,
} from "@/lib/rust-api/invoice-recurring-client";
import {
  composeInvoiceDraftFromTracker,
  type CreateFromTrackerInput,
} from "@/lib/invoice-create-from-tracker-compose";
import { fetchCustomerByIdFromRust } from "@/lib/rust-api/customers-client";
import { fetchInvoiceDefaultSettingsDataFromRust } from "@/lib/rust-api/invoice-default-settings-client";
import {
  draftInvoiceFromRust,
  fetchInvoiceByIdFromRust,
  updateInvoiceFromRust,
} from "@/lib/rust-api/invoices-client";
import { fetchTrackerEntriesByRangeFromRust } from "@/lib/rust-api/tracker-entries-client";
import { fetchTrackerProjectByIdFromRust } from "@/lib/rust-api/tracker-projects-client";
import { fetchViewerFromRust } from "@/lib/rust-api/viewer-client";

type CreateInvoiceInput = RouterInputs["invoice"]["create"];

type EnqueueSendInvoiceReminder = (
  input: RouterInputs["invoice"]["enqueueSendInvoiceReminder"],
) => Promise<unknown>;

type EnqueueRemoveScheduledInvoiceJob = (
  input: RouterInputs["invoice"]["enqueueRemoveScheduledInvoiceJob"],
) => Promise<unknown>;

type EnqueueGenerateInvoice = (
  input: RouterInputs["invoice"]["enqueueGenerateInvoice"],
) => Promise<unknown>;

type EnqueueScheduleInvoice = (
  input: RouterInputs["invoice"]["enqueueScheduleInvoice"],
) => Promise<{ scheduledJobId: string }>;

type EnqueueInvoiceScheduledNotification = (
  input: RouterInputs["invoice"]["enqueueInvoiceScheduledNotification"],
) => Promise<unknown>;

type EnqueueRemoveInvoiceScheduledJobs = (
  input: RouterInputs["invoiceRecurring"]["enqueueRemoveInvoiceScheduledJobs"],
) => Promise<unknown>;

function hybridTrpcError(code: string, message: string) {
  return Object.assign(new Error(message), {
    data: { code },
  });
}

export async function remindInvoiceHybrid(
  input: { id: string; date: string },
  enqueueSendInvoiceReminder: EnqueueSendInvoiceReminder,
) {
  const invoice = await updateInvoiceFromRust({
    id: input.id,
    reminderSentAt: input.date,
  });
  await enqueueSendInvoiceReminder({ invoiceId: input.id });
  return invoice;
}

export async function cancelInvoiceScheduleHybrid(
  input: { id: string },
  enqueueRemoveScheduledInvoiceJob: EnqueueRemoveScheduledInvoiceJob,
) {
  const invoice = await fetchInvoiceByIdFromRust(input.id);
  if (!invoice) {
    throw hybridTrpcError("NOT_FOUND", "Scheduled invoice not found");
  }

  if (invoice.scheduledJobId) {
    await enqueueRemoveScheduledInvoiceJob({
      scheduledJobId: invoice.scheduledJobId,
    });
  }

  return updateInvoiceFromRust({
    id: input.id,
    status: "draft",
    scheduledAt: null,
    scheduledJobId: null,
  });
}

export async function createInvoiceHybrid(
  input: CreateInvoiceInput,
  deps: {
    enqueueGenerateInvoice: EnqueueGenerateInvoice;
    enqueueScheduleInvoice: EnqueueScheduleInvoice;
    enqueueInvoiceScheduledNotification: EnqueueInvoiceScheduledNotification;
    fetchExistingInvoice?: (id: string) => Promise<{ scheduledJobId?: string | null } | null>;
  },
) {
  if (input.deliveryType === "scheduled") {
    if (!input.scheduledAt) {
      throw hybridTrpcError(
        "BAD_REQUEST",
        "scheduledAt is required for scheduled delivery",
      );
    }

    const scheduledDate = new Date(input.scheduledAt);
    if (scheduledDate <= new Date()) {
      throw hybridTrpcError(
        "BAD_REQUEST",
        "scheduledAt must be in the future",
      );
    }

    const existing =
      (await deps.fetchExistingInvoice?.(input.id)) ??
      (await fetchInvoiceByIdFromRust(input.id));

    const { scheduledJobId } = await deps.enqueueScheduleInvoice({
      invoiceId: input.id,
      scheduledAt: input.scheduledAt,
      replaceScheduledJobId: existing?.scheduledJobId ?? null,
    });

    const data = await updateInvoiceFromRust({
      id: input.id,
      status: "scheduled",
      scheduledAt: input.scheduledAt,
      scheduledJobId,
    });

    if (data.invoiceNumber) {
      await deps.enqueueInvoiceScheduledNotification({
        invoiceId: input.id,
        invoiceNumber: data.invoiceNumber,
        scheduledAt: input.scheduledAt,
        customerName: data.customerName ?? null,
      });
    }

    return data;
  }

  const data = await updateInvoiceFromRust({
    id: input.id,
    status: "unpaid",
  });

  await deps.enqueueGenerateInvoice({
    id: input.id,
    deliveryType: input.deliveryType,
  });

  return data;
}

export async function pauseInvoiceRecurringHybrid(
  input: { id: string },
  enqueueRemoveInvoiceScheduledJobs: EnqueueRemoveInvoiceScheduledJobs,
) {
  const { recurring, jobIds } = await pauseInvoiceRecurringFromRust(input);
  if (jobIds.length) {
    await enqueueRemoveInvoiceScheduledJobs({ jobIds });
  }
  return recurring;
}

export async function deleteInvoiceRecurringHybrid(
  input: { id: string },
  enqueueRemoveInvoiceScheduledJobs: EnqueueRemoveInvoiceScheduledJobs,
) {
  const { recurring, jobIds } = await deleteInvoiceRecurringFromRust(input);
  if (jobIds.length) {
    await enqueueRemoveInvoiceScheduledJobs({ jobIds });
  }
  return { id: recurring?.id ?? input.id };
}

export async function createInvoiceFromTrackerHybrid(
  input: CreateFromTrackerInput,
) {
  const viewer = await fetchViewerFromRust();
  const teamId = viewer.teamId ?? viewer.team?.id;
  const userId = viewer.user?.id ?? viewer.id;

  if (!teamId || !userId) {
    throw hybridTrpcError(
      "UNAUTHORIZED",
      "Missing team or user context for invoice draft",
    );
  }

  const [project, trackerData, settings] = await Promise.all([
    fetchTrackerProjectByIdFromRust(input.projectId),
    fetchTrackerEntriesByRangeFromRust({
      from: input.dateFrom,
      to: input.dateTo,
      projectId: input.projectId,
    }),
    fetchInvoiceDefaultSettingsDataFromRust(),
  ]);

  const customerId = project?.customerId;
  const customer =
    customerId != null
      ? await fetchCustomerByIdFromRust(customerId)
      : null;

  const draftPayload = composeInvoiceDraftFromTracker({
    input,
    project,
    trackerData,
    settings,
    teamId,
    userId,
    customer,
  });

  return draftInvoiceFromRust(draftPayload);
}

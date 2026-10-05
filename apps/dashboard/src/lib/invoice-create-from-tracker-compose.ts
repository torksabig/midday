import { DEFAULT_TEMPLATE } from "@midday/invoice";
import { transformCustomerToContent } from "@midday/invoice/utils";
import { addDays, format, parseISO } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import type { components } from "./rust-api/openapi.generated";
import type { TrackerEntriesByRange } from "./rust-api/tracker-entries";
import type { TrackerProject } from "./rust-api/tracker-projects";

type InvoiceDefaultSettingsData =
  components["schemas"]["InvoiceDefaultSettingsData"];

export type CreateFromTrackerInput = {
  projectId: string;
  dateFrom: string;
  dateTo: string;
};

export class CreateFromTrackerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CreateFromTrackerError";
  }
}

function totalTrackedHours(trackerData: TrackerEntriesByRange): number {
  const allEntries = Object.values(trackerData.result ?? {}).flat();
  const totalDuration = allEntries.reduce(
    (sum, entry) => sum + (Number(entry.duration) || 0),
    0,
  );
  return Math.round((totalDuration / 3600) * 100) / 100;
}

export function composeInvoiceDraftFromTracker(params: {
  input: CreateFromTrackerInput;
  project: TrackerProject | null;
  trackerData: TrackerEntriesByRange;
  settings: InvoiceDefaultSettingsData;
  teamId: string;
  userId: string;
  customer?: {
    name?: string | null;
    [key: string]: unknown;
  } | null;
}): Record<string, unknown> {
  const { input, project, trackerData, settings, teamId, userId, customer } =
    params;

  if (!project) {
    throw new CreateFromTrackerError("PROJECT_NOT_FOUND");
  }

  if (!project.billable) {
    throw new CreateFromTrackerError("PROJECT_NOT_BILLABLE");
  }

  const rate = Number(project.rate);
  if (!project.rate || rate <= 0) {
    throw new CreateFromTrackerError("PROJECT_NO_RATE");
  }

  const totalHours = totalTrackedHours(trackerData);
  if (totalHours === 0) {
    throw new CreateFromTrackerError("NO_TRACKED_HOURS");
  }

  const template = settings.template as Record<string, unknown> | null;
  const defaultTemplate = DEFAULT_TEMPLATE;
  const currency = (
    project.currency ||
    settings.team?.baseCurrency ||
    "USD"
  ).toUpperCase();
  const amount = totalHours * rate;

  const userDateFormat =
    (template?.dateFormat as string | undefined) ??
    settings.user?.dateFormat ??
    defaultTemplate.dateFormat;

  const formattedDateFrom = format(parseISO(input.dateFrom), userDateFormat);
  const formattedDateTo = format(parseISO(input.dateTo), userDateFormat);
  const dateRangeDescription = `${project.name} (${formattedDateFrom} - ${formattedDateTo})`;

  const templateData = {
    ...defaultTemplate,
    currency,
    ...(template
      ? Object.fromEntries(
          Object.entries(template).map(([key, value]) => [
            key,
            value === null ? undefined : value,
          ]),
        )
      : {}),
    size: (template?.size === "a4" || template?.size === "letter"
      ? template.size
      : defaultTemplate.size) as "a4" | "letter",
    deliveryType: (template?.deliveryType === "create" ||
    template?.deliveryType === "create_and_send"
      ? template.deliveryType
      : defaultTemplate.deliveryType) as "create" | "create_and_send" | undefined,
  };

  const paymentTermsDays =
    (template?.paymentTermsDays as number | undefined) ?? 30;

  const invoiceId = uuidv4();

  return {
    id: invoiceId,
    teamId,
    userId,
    customerId: project.customerId ?? undefined,
    customerName: customer?.name ?? undefined,
    invoiceNumber: settings.nextInvoiceNumber,
    currency,
    amount,
    lineItems: [
      {
        name: dateRangeDescription,
        quantity: totalHours,
        price: rate,
        vat: 0,
      },
    ],
    issueDate: new Date().toISOString(),
    dueDate: addDays(new Date(), paymentTermsDays).toISOString(),
    template: templateData,
    fromDetails: (template?.fromDetails as string | null) || null,
    paymentDetails: (template?.paymentDetails as string | null) || null,
    customerDetails: customer
      ? JSON.stringify(transformCustomerToContent(customer as never))
      : null,
    noteDetails: null,
    topBlock: null,
    bottomBlock: null,
    vat: null,
    tax: null,
    discount: null,
    subtotal: null,
  };
}

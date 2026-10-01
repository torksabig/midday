import type { RouterOutputs } from "@api/trpc/routers/_app";
import { UTCDate } from "@date-fns/utc";
import { DEFAULT_TEMPLATE } from "@midday/invoice";
import { addDays } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import type { components } from "./openapi.generated";
import { RustApiError } from "./overview";

type InvoiceDefaultSettingsData =
  components["schemas"]["InvoiceDefaultSettingsData"];

type InvoiceDefaultSettings = RouterOutputs["invoice"]["defaultSettings"];

export const invoiceDefaultSettingsQueryKey = [
  "rust-api",
  "invoice",
  "default-settings",
] as const;

function isTaxCountry(countryCode: string) {
  return ["US", "CA", "AU", "NZ", "SG", "MY", "IN"].includes(countryCode);
}

export function normalizeInvoiceDefaultSettings(
  payload: InvoiceDefaultSettingsData,
): InvoiceDefaultSettings {
  const defaultTemplate = DEFAULT_TEMPLATE;
  const template = payload.template as Record<string, any> | null;
  const locale = payload.user?.locale ?? "en";
  const timezone = payload.user?.timezone ?? "America/New_York";
  const currency =
    template?.currency ??
    payload.team?.baseCurrency ??
    defaultTemplate.currency;
  const dateFormat =
    template?.dateFormat ??
    payload.user?.dateFormat ??
    defaultTemplate.dateFormat;
  const logoUrl = template?.logoUrl ?? defaultTemplate.logoUrl;
  const countryCode = "US";
  const includeTax = isTaxCountry(countryCode);
  const size = ["US", "CA"].includes(countryCode) ? "letter" : "a4";

  const savedTemplate = {
    id: template?.id,
    name: template?.name ?? "Default",
    isDefault: template?.isDefault ?? true,
    title: template?.title ?? defaultTemplate.title,
    logoUrl,
    currency,
    size: template?.size ?? defaultTemplate.size,
    includeTax: template?.includeTax ?? includeTax,
    includeVat: template?.includeVat ?? !includeTax,
    includeDiscount:
      template?.includeDiscount ?? defaultTemplate.includeDiscount,
    includeDecimals:
      template?.includeDecimals ?? defaultTemplate.includeDecimals,
    includeUnits: template?.includeUnits ?? defaultTemplate.includeUnits,
    includeQr: template?.includeQr ?? defaultTemplate.includeQr,
    includeLineItemTax:
      template?.includeLineItemTax ?? defaultTemplate.includeLineItemTax,
    lineItemTaxLabel:
      template?.lineItemTaxLabel ?? defaultTemplate.lineItemTaxLabel,
    includePdf: template?.includePdf ?? defaultTemplate.includePdf,
    sendCopy: template?.sendCopy ?? defaultTemplate.sendCopy,
    customerLabel: template?.customerLabel ?? defaultTemplate.customerLabel,
    fromLabel: template?.fromLabel ?? defaultTemplate.fromLabel,
    invoiceNoLabel: template?.invoiceNoLabel ?? defaultTemplate.invoiceNoLabel,
    subtotalLabel: template?.subtotalLabel ?? defaultTemplate.subtotalLabel,
    issueDateLabel: template?.issueDateLabel ?? defaultTemplate.issueDateLabel,
    totalSummaryLabel:
      template?.totalSummaryLabel ?? defaultTemplate.totalSummaryLabel,
    dueDateLabel: template?.dueDateLabel ?? defaultTemplate.dueDateLabel,
    discountLabel: template?.discountLabel ?? defaultTemplate.discountLabel,
    descriptionLabel:
      template?.descriptionLabel ?? defaultTemplate.descriptionLabel,
    priceLabel: template?.priceLabel ?? defaultTemplate.priceLabel,
    quantityLabel: template?.quantityLabel ?? defaultTemplate.quantityLabel,
    totalLabel: template?.totalLabel ?? defaultTemplate.totalLabel,
    vatLabel: template?.vatLabel ?? defaultTemplate.vatLabel,
    taxLabel: template?.taxLabel ?? defaultTemplate.taxLabel,
    paymentLabel: template?.paymentLabel ?? defaultTemplate.paymentLabel,
    noteLabel: template?.noteLabel ?? defaultTemplate.noteLabel,
    dateFormat,
    deliveryType: template?.deliveryType ?? defaultTemplate.deliveryType,
    taxRate: template?.taxRate ?? defaultTemplate.taxRate,
    vatRate: template?.vatRate ?? defaultTemplate.vatRate,
    fromDetails: template?.fromDetails ?? defaultTemplate.fromDetails,
    paymentDetails: template?.paymentDetails ?? defaultTemplate.paymentDetails,
    noteDetails: template?.noteDetails ?? defaultTemplate.noteDetails,
    timezone,
    locale,
    paymentEnabled: template?.paymentEnabled ?? defaultTemplate.paymentEnabled,
    paymentTermsDays: template?.paymentTermsDays ?? 30,
    emailSubject: template?.emailSubject ?? null,
    emailHeading: template?.emailHeading ?? null,
    emailBody: template?.emailBody ?? null,
    emailButtonText: template?.emailButtonText ?? null,
  };

  const paymentTermsDays = savedTemplate.paymentTermsDays ?? 30;

  return {
    id: uuidv4(),
    currency,
    status: "draft",
    size,
    includeTax: savedTemplate.includeTax ?? includeTax,
    includeVat: savedTemplate.includeVat ?? !includeTax,
    includeDiscount: false,
    includeDecimals: false,
    includePdf: false,
    sendCopy: false,
    includeUnits: false,
    includeQr: true,
    invoiceNumber: payload.nextInvoiceNumber,
    timezone,
    locale,
    fromDetails: savedTemplate.fromDetails,
    paymentDetails: savedTemplate.paymentDetails,
    customerDetails: undefined,
    noteDetails: savedTemplate.noteDetails,
    customerId: undefined,
    issueDate: new UTCDate().toISOString(),
    dueDate: addDays(new UTCDate(), paymentTermsDays).toISOString(),
    lineItems: [{ name: "", quantity: 0, price: 0, vat: 0 }],
    tax: undefined,
    token: undefined,
    discount: undefined,
    subtotal: undefined,
    topBlock: undefined,
    bottomBlock: undefined,
    amount: undefined,
    customerName: undefined,
    logoUrl: undefined,
    vat: undefined,
    template: savedTemplate,
  };
}

export async function fetchInvoiceDefaultSettings(
  baseUrl: string,
  accessToken: string | null,
): Promise<InvoiceDefaultSettings> {
  if (!accessToken) throw new RustApiError(401, "Missing authorization token");

  const response = await fetch(
    `${baseUrl}/api/v1/invoices/default-settings-data`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(8_000),
    },
  );

  if (!response.ok) {
    throw new RustApiError(
      response.status,
      `Rust API request failed with HTTP ${response.status}`,
    );
  }

  return normalizeInvoiceDefaultSettings(
    (await response.json()) as InvoiceDefaultSettingsData,
  );
}

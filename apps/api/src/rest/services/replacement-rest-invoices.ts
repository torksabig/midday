import {
  assertLegacyIdentityFallbackAllowed,
  tryDelegateCustomersGetById,
  tryDelegateInvoiceDelete,
  tryDelegateInvoiceDraft,
  tryDelegateInvoiceDefaultSettingsData,
  tryDelegateInvoicePaymentStatus,
  tryDelegateInvoiceSummary,
  tryDelegateInvoiceUpdate,
  tryDelegateInvoicesGet,
  tryDelegateInvoicesGetById,
  tryDelegateSearchInvoiceNumber,
} from "@api/services/replacement-delegation";
import type {
  ReplacementInvoiceSummaryQuery,
  ReplacementInvoiceUpdateInput,
  ReplacementInvoicesListQuery,
} from "@midday/replacement-backend";
import { shouldDelegateToReplacementBackend } from "@midday/replacement-backend";
import { transformCustomerToContent } from "@midday/invoice/utils";
import { addDays } from "date-fns";
import { HTTPException } from "hono/http-exception";
import { extractBearerToken } from "./vault-presigned-url";
import { mapDelegationErrorToHttp } from "./replacement-rest-documents";

export async function fetchInvoicesListForRest(
  params: ReplacementInvoicesListQuery,
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<unknown>,
): Promise<unknown> {
  if (!shouldDelegateToReplacementBackend()) {
    return fetchLegacy();
  }

  const sessionAccessToken = extractBearerToken(authorizationHeader);
  try {
    const delegated = await tryDelegateInvoicesGet(params, sessionAccessToken);
    if (delegated) {
      return delegated;
    }
    assertLegacyIdentityFallbackAllowed();
  } catch (error) {
    mapDelegationErrorToHttp(error);
  }

  return fetchLegacy();
}

export async function fetchInvoiceByIdForRest(
  id: string,
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<unknown>,
): Promise<unknown> {
  if (!shouldDelegateToReplacementBackend()) {
    return fetchLegacy();
  }

  const sessionAccessToken = extractBearerToken(authorizationHeader);
  try {
    const delegated = await tryDelegateInvoicesGetById(id, sessionAccessToken);
    if (delegated.delegated) {
      return delegated.invoice;
    }
    assertLegacyIdentityFallbackAllowed();
  } catch (error) {
    mapDelegationErrorToHttp(error);
  }

  return fetchLegacy();
}

export async function fetchInvoicePaymentStatusForRest(
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<unknown>,
): Promise<unknown> {
  if (!shouldDelegateToReplacementBackend()) {
    return fetchLegacy();
  }

  const sessionAccessToken = extractBearerToken(authorizationHeader);
  try {
    const delegated = await tryDelegateInvoicePaymentStatus(sessionAccessToken);
    if (delegated) {
      return delegated;
    }
    assertLegacyIdentityFallbackAllowed();
  } catch (error) {
    mapDelegationErrorToHttp(error);
  }

  return fetchLegacy();
}

export async function fetchInvoiceSummaryForRest(
  params: ReplacementInvoiceSummaryQuery,
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<unknown>,
): Promise<unknown> {
  if (!shouldDelegateToReplacementBackend()) {
    return fetchLegacy();
  }

  const sessionAccessToken = extractBearerToken(authorizationHeader);
  try {
    const delegated = await tryDelegateInvoiceSummary(params, sessionAccessToken);
    if (delegated) {
      return delegated;
    }
    assertLegacyIdentityFallbackAllowed();
  } catch (error) {
    mapDelegationErrorToHttp(error);
  }

  return fetchLegacy();
}

export async function updateInvoiceForRest(
  input: ReplacementInvoiceUpdateInput,
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<unknown>,
): Promise<unknown> {
  if (!shouldDelegateToReplacementBackend()) {
    return fetchLegacy();
  }

  const sessionAccessToken = extractBearerToken(authorizationHeader);
  try {
    const delegated = await tryDelegateInvoiceUpdate(input, sessionAccessToken);
    if (delegated.delegated) {
      return delegated.invoice;
    }
    assertLegacyIdentityFallbackAllowed();
  } catch (error) {
    mapDelegationErrorToHttp(error);
  }

  return fetchLegacy();
}

export async function deleteInvoiceForRest(
  id: string,
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<unknown>,
): Promise<unknown> {
  if (!shouldDelegateToReplacementBackend()) {
    return fetchLegacy();
  }

  const sessionAccessToken = extractBearerToken(authorizationHeader);
  try {
    const delegated = await tryDelegateInvoiceDelete(id, sessionAccessToken);
    if (delegated.delegated) {
      return delegated.result;
    }
    assertLegacyIdentityFallbackAllowed();
  } catch (error) {
    mapDelegationErrorToHttp(error);
  }

  return fetchLegacy();
}

type RestCreateInvoiceInput = {
  invoiceNumber?: string | null;
  issueDate?: string | null;
  dueDate?: string | null;
  template?: unknown;
  paymentDetails?: unknown;
  fromDetails?: unknown;
  noteDetails?: unknown;
  customerId: string;
  logoUrl?: string | null;
  vat?: number | null;
  tax?: number | null;
  discount?: number | null;
  topBlock?: unknown;
  bottomBlock?: unknown;
  amount?: number | null;
  lineItems?: Array<{ name: unknown; quantity?: number; price?: number; vat?: number }>;
};

export async function createRestInvoiceDraft(
  params: {
    invoiceId: string;
    teamId: string;
    userId: string;
    input: RestCreateInvoiceInput;
  },
  authorizationHeader: string | undefined,
  fetchLegacy: () => Promise<unknown>,
): Promise<unknown> {
  if (!shouldDelegateToReplacementBackend()) {
    return fetchLegacy();
  }

  const sessionAccessToken = extractBearerToken(authorizationHeader);
  const { invoiceId, teamId, userId, input } = params;

  try {
    const settingsDelegated =
      await tryDelegateInvoiceDefaultSettingsData(sessionAccessToken);
    if (!settingsDelegated.delegated) {
      assertLegacyIdentityFallbackAllowed();
      return fetchLegacy();
    }

    const finalInvoiceNumber =
      input.invoiceNumber ?? settingsDelegated.data.nextInvoiceNumber;

    if (input.invoiceNumber) {
      const searchDelegated = await tryDelegateSearchInvoiceNumber(
        finalInvoiceNumber,
        sessionAccessToken,
      );
      if (!searchDelegated.delegated) {
        assertLegacyIdentityFallbackAllowed();
        return fetchLegacy();
      }
      if (
        searchDelegated.value?.invoiceNumber &&
        searchDelegated.value.invoiceNumber === finalInvoiceNumber
      ) {
        throw new HTTPException(409, {
          message: `Invoice number '${finalInvoiceNumber}' is already used. Please provide a different invoice number or omit it to auto-generate one.`,
        });
      }
    }

    const template = settingsDelegated.data.template as {
      paymentTermsDays?: number | null;
    } | null;
    const paymentTermsDays = template?.paymentTermsDays ?? 30;

    const issueDate = input.issueDate || new Date().toISOString();
    const dueDate =
      input.dueDate ||
      addDays(new Date(issueDate), paymentTermsDays).toISOString();

    const customerDelegated = await tryDelegateCustomersGetById(
      input.customerId,
      sessionAccessToken,
    );
    if (!customerDelegated.delegated) {
      assertLegacyIdentityFallbackAllowed();
      return fetchLegacy();
    }
    const customer = customerDelegated.customer as { name?: string } | null;
    if (!customer) {
      throw new HTTPException(404, { message: "Customer not found" });
    }

    const customerDetails = transformCustomerToContent(
      customer as Record<string, unknown>,
    );

    const draftPayload = {
      id: invoiceId,
      teamId,
      userId,
      invoiceNumber: finalInvoiceNumber,
      issueDate,
      dueDate,
      template: input.template,
      paymentDetails: input.paymentDetails,
      fromDetails: input.fromDetails,
      customerDetails: customerDetails ? JSON.stringify(customerDetails) : null,
      noteDetails: input.noteDetails,
      customerId: input.customerId,
      customerName: customer.name,
      logoUrl: input.logoUrl,
      vat: input.vat,
      tax: input.tax,
      discount: input.discount,
      topBlock: input.topBlock,
      bottomBlock: input.bottomBlock,
      amount: input.amount,
      lineItems: input.lineItems?.map((item) => ({
        ...item,
        name: JSON.stringify(item.name),
      })),
    };

    const draftDelegated = await tryDelegateInvoiceDraft(
      draftPayload,
      sessionAccessToken,
    );
    if (!draftDelegated.delegated) {
      assertLegacyIdentityFallbackAllowed();
      return fetchLegacy();
    }

    return draftDelegated.invoice;
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    mapDelegationErrorToHttp(error);
  }

  return fetchLegacy();
}

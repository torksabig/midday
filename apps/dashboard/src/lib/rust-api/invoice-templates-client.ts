"use client";

import { type QueryKey, queryOptions } from "@tanstack/react-query";
import { getAccessToken } from "@/utils/session";
import {
  type CreateInvoiceTemplateInput,
  type InvoiceTemplateCount,
  type InvoiceTemplateCreate,
  type InvoiceTemplateDelete,
  type InvoiceTemplateDetail,
  type InvoiceTemplateList,
  type InvoiceTemplateSetDefault,
  type InvoiceTemplateUpsert,
  type UpsertInvoiceTemplateInput,
  createInvoiceTemplate,
  deleteInvoiceTemplate,
  fetchInvoiceTemplateById,
  fetchInvoiceTemplateCount,
  fetchInvoiceTemplates,
  setDefaultInvoiceTemplate,
  upsertInvoiceTemplate,
} from "./invoice-templates";

function getRustApiUrl() {
  const url = process.env.NEXT_PUBLIC_RUST_API_URL;

  if (url) return url.replace(/\/$/, "");
  if (process.env.NODE_ENV !== "production") return "http://127.0.0.1:8787";

  throw new Error("NEXT_PUBLIC_RUST_API_URL must be configured");
}

export function invoiceTemplatesQueryOptions(queryKey: QueryKey) {
  return queryOptions<InvoiceTemplateList>({
    queryKey,
    queryFn: async () =>
      fetchInvoiceTemplates(getRustApiUrl(), await getAccessToken()),
  });
}

export function invoiceTemplateByIdQueryOptions(
  queryKey: QueryKey,
  id: string,
  options: { enabled?: boolean } = {},
) {
  return queryOptions<InvoiceTemplateDetail>({
    queryKey,
    queryFn: async () =>
      fetchInvoiceTemplateById(getRustApiUrl(), await getAccessToken(), id),
    enabled: options.enabled,
  });
}

export function invoiceTemplateCountQueryOptions(queryKey: QueryKey) {
  return queryOptions<InvoiceTemplateCount>({
    queryKey,
    queryFn: async () =>
      fetchInvoiceTemplateCount(getRustApiUrl(), await getAccessToken()),
  });
}

export async function createInvoiceTemplateFromRust(
  input: CreateInvoiceTemplateInput,
): Promise<InvoiceTemplateCreate> {
  return createInvoiceTemplate(
    getRustApiUrl(),
    await getAccessToken(),
    input,
  );
}

export async function upsertInvoiceTemplateFromRust(
  input: UpsertInvoiceTemplateInput,
): Promise<InvoiceTemplateUpsert> {
  return upsertInvoiceTemplate(
    getRustApiUrl(),
    await getAccessToken(),
    input,
  );
}

export async function setDefaultInvoiceTemplateFromRust(input: {
  id: string;
}): Promise<InvoiceTemplateSetDefault> {
  return setDefaultInvoiceTemplate(
    getRustApiUrl(),
    await getAccessToken(),
    input.id,
  );
}

export async function deleteInvoiceTemplateFromRust(input: {
  id: string;
}): Promise<InvoiceTemplateDelete> {
  return deleteInvoiceTemplate(
    getRustApiUrl(),
    await getAccessToken(),
    input.id,
  );
}

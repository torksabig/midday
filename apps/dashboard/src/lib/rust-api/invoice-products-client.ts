"use client";

import { type QueryKey, queryOptions } from "@tanstack/react-query";
import { getAccessToken } from "@/utils/session";
import {
  type CreateInvoiceProductInput,
  type InvoiceProduct,
  type InvoiceProductDetail,
  type ListInvoiceProductsParams,
  type SaveLineItemAsProductInput,
  type SaveLineItemAsProductResult,
  type UpdateInvoiceProductInput,
  createInvoiceProduct,
  deleteInvoiceProduct,
  fetchInvoiceProductById,
  fetchInvoiceProducts,
  incrementInvoiceProductUsage,
  saveLineItemAsProduct,
  updateInvoiceProduct,
} from "./invoice-products";

function getRustApiUrl() {
  const url = process.env.NEXT_PUBLIC_RUST_API_URL;

  if (url) return url.replace(/\/$/, "");
  if (process.env.NODE_ENV !== "production") return "http://127.0.0.1:8787";

  throw new Error("NEXT_PUBLIC_RUST_API_URL must be configured");
}

export function invoiceProductsQueryOptions(
  queryKey: QueryKey,
  params: ListInvoiceProductsParams = {},
  options: { staleTime?: number } = {},
) {
  return queryOptions<InvoiceProduct[]>({
    queryKey,
    queryFn: async () =>
      fetchInvoiceProducts(getRustApiUrl(), await getAccessToken(), params),
    staleTime: options.staleTime,
  });
}

export function invoiceProductByIdQueryOptions(
  queryKey: QueryKey,
  id: string,
  options: { enabled?: boolean } = {},
) {
  return queryOptions<InvoiceProductDetail>({
    queryKey,
    queryFn: async () =>
      fetchInvoiceProductById(getRustApiUrl(), await getAccessToken(), id),
    enabled: options.enabled,
  });
}

export async function createInvoiceProductFromRust(
  input: CreateInvoiceProductInput,
) {
  return createInvoiceProduct(getRustApiUrl(), await getAccessToken(), input);
}

export async function updateInvoiceProductFromRust(
  input: UpdateInvoiceProductInput,
) {
  return updateInvoiceProduct(getRustApiUrl(), await getAccessToken(), input);
}

export async function deleteInvoiceProductFromRust(
  input: { id: string } | string,
) {
  const id = typeof input === "string" ? input : input.id;
  return deleteInvoiceProduct(getRustApiUrl(), await getAccessToken(), id);
}

export async function incrementInvoiceProductUsageFromRust(input: {
  id: string;
}) {
  return incrementInvoiceProductUsage(
    getRustApiUrl(),
    await getAccessToken(),
    input.id,
  );
}

export async function saveLineItemAsProductFromRust(
  input: SaveLineItemAsProductInput,
): Promise<SaveLineItemAsProductResult> {
  return saveLineItemAsProduct(getRustApiUrl(), await getAccessToken(), input);
}

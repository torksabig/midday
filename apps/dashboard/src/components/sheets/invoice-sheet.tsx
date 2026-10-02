"use client";

import { Sheet } from "@midday/ui/sheet";
import {
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { FormContext } from "@/components/invoice/form-context";
import { InvoiceContent } from "@/components/invoice-content";
import { useInvoiceParams } from "@/hooks/use-invoice-params";
import { invoiceDefaultSettingsQueryKey } from "@/lib/rust-api/invoice-default-settings";
import { invoiceDefaultSettingsQueryOptions } from "@/lib/rust-api/invoice-default-settings-client";
import { invoiceByIdQueryOptions } from "@/lib/rust-api/invoices-client";
import { useInvoiceEditorStore } from "@/store/invoice-editor";
import { useTRPC } from "@/trpc/client";

export function InvoiceSheet() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { setParams, invoiceType, invoiceId, canvas } = useInvoiceParams();
  const isOpen =
    !canvas &&
    (invoiceType === "create" ||
      invoiceType === "edit" ||
      invoiceType === "success");

  // Get default settings for new invoices
  const { data: defaultSettings } = useSuspenseQuery(
    invoiceDefaultSettingsQueryOptions(),
  );

  // Get draft invoice for edit
  const { data } = useQuery(
    invoiceByIdQueryOptions(
      trpc.invoice.getById.queryKey({ id: invoiceId! }),
      invoiceId!,
      {
        enabled: !!invoiceId,
        staleTime: 30 * 1000, // 30 seconds - prevents excessive refetches when reopening
      },
    ),
  );

  const handleOnOpenChange = (open: boolean) => {
    if (!open) {
      // Invalidate queries when closing the sheet to prevent stale data
      queryClient.invalidateQueries({
        queryKey: trpc.invoice.getById.queryKey(),
      });

      queryClient.invalidateQueries({
        queryKey: invoiceDefaultSettingsQueryKey,
      });

      // Clear the draft snapshot so the next open starts fresh
      useInvoiceEditorStore.getState().reset();
    }

    setParams(null);
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOnOpenChange}>
      <FormContext defaultSettings={defaultSettings} data={data}>
        <InvoiceContent />
      </FormContext>
    </Sheet>
  );
}

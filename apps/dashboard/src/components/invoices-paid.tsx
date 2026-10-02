"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useInvoiceFilterParams } from "@/hooks/use-invoice-filter-params";
import { invoiceSummaryQueryOptions } from "@/lib/rust-api/invoices-client";
import { useTRPC } from "@/trpc/client";
import { InvoiceSummary } from "./invoice-summary";

export function InvoicesPaid() {
  const { setFilter } = useInvoiceFilterParams();
  const trpc = useTRPC();
  const statuses = ["paid"] as const;
  const { data } = useSuspenseQuery(
    invoiceSummaryQueryOptions(
      trpc.invoice.invoiceSummary.queryKey({
        statuses: [...statuses],
      }),
      { statuses: [...statuses] },
    ),
  );

  return (
    <button
      type="button"
      onClick={() =>
        setFilter({
          statuses: ["paid"],
        })
      }
      className="hidden sm:block text-left"
    >
      <InvoiceSummary data={data} title="Paid" />
    </button>
  );
}

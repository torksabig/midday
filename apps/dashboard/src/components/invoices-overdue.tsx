"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useInvoiceFilterParams } from "@/hooks/use-invoice-filter-params";
import { invoiceSummaryQueryOptions } from "@/lib/rust-api/invoices-client";
import { useTRPC } from "@/trpc/client";
import { InvoiceSummary } from "./invoice-summary";

export function InvoicesOverdue() {
  const trpc = useTRPC();
  const { setFilter } = useInvoiceFilterParams();
  const statuses = ["overdue"] as const;
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
          statuses: ["overdue"],
        })
      }
      className="hidden sm:block text-left"
    >
      <InvoiceSummary data={data} title="Overdue" />
    </button>
  );
}

"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useInvoiceFilterParams } from "@/hooks/use-invoice-filter-params";
import { invoiceSummaryQueryOptions } from "@/lib/rust-api/invoices-client";
import { useTRPC } from "@/trpc/client";
import { InvoiceSummary } from "./invoice-summary";

export function InvoicesOpen() {
  const trpc = useTRPC();
  const statuses = ["draft", "scheduled", "unpaid"] as const;
  const { data } = useSuspenseQuery(
    invoiceSummaryQueryOptions(
      trpc.invoice.invoiceSummary.queryKey({
        statuses: [...statuses],
      }),
      { statuses: [...statuses] },
    ),
  );

  const { setFilter } = useInvoiceFilterParams();

  return (
    <button
      type="button"
      onClick={() =>
        setFilter({
          statuses: ["draft", "scheduled", "unpaid"],
        })
      }
      className="hidden sm:block text-left"
    >
      <InvoiceSummary data={data} title="Open" />
    </button>
  );
}

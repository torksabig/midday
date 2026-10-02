import { useQuery } from "@tanstack/react-query";
import { formatISO } from "date-fns";
import { trackerBillableHoursQueryOptions } from "@/lib/rust-api/tracker-entries-client";
import { useTRPC } from "@/trpc/client";

type UseBillableHoursParams = {
  date: Date | string;
  view: "week" | "month";
  weekStartsOnMonday?: boolean;
  enabled?: boolean;
  refetchInterval?: number | false;
  refetchOnWindowFocus?: boolean;
};

/**
 * Single source of truth for billable hours calculations.
 * All date range logic with 1-day buffer handled on backend.
 */
export function useBillableHours(params: UseBillableHoursParams) {
  const {
    date,
    view,
    weekStartsOnMonday = false,
    enabled = true,
    refetchInterval,
    refetchOnWindowFocus,
  } = params;
  const trpc = useTRPC();

  // Convert date to ISO string format (YYYY-MM-DD)
  const dateString =
    typeof date === "string"
      ? date
      : formatISO(date, { representation: "date" });

  const billableParams = {
    date: dateString,
    view,
    weekStartsOnMonday,
  };

  return useQuery(
    trackerBillableHoursQueryOptions(
      trpc.trackerEntries.getBillableHours.queryKey(billableParams),
      billableParams,
      {
        enabled,
        refetchInterval,
        refetchOnWindowFocus,
      },
    ),
  );
}

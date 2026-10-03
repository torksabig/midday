import type { Metadata } from "next";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import { Suspense } from "react";
import { ErrorFallback } from "@/components/error-fallback";
import { ProductsSkeleton } from "@/components/tables/products/skeleton";
import { DataTable } from "@/components/tables/products/table";
import { invoiceProductsServerQueryOptions } from "@/lib/rust-api/invoice-products-server";
import { batchPrefetch, HydrateClient, trpc } from "@/trpc/server";

export const metadata: Metadata = {
  title: "Products | Midday",
};

export default function Page() {
  const listParams = {
    sortBy: "recent" as const,
    limit: 100,
    includeInactive: true,
  };

  batchPrefetch([
    invoiceProductsServerQueryOptions(
      trpc.invoiceProducts.get.queryKey(listParams),
      listParams,
    ),
  ] as Parameters<typeof batchPrefetch>[0]);

  return (
    <HydrateClient>
      <div className="max-w-screen-lg">
        <ErrorBoundary errorComponent={ErrorFallback}>
          <Suspense fallback={<ProductsSkeleton />}>
            <DataTable />
          </Suspense>
        </ErrorBoundary>
      </div>
    </HydrateClient>
  );
}

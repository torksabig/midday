"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { viewerQueryKey } from "@/lib/rust-api/viewer";
import { viewerQueryOptions } from "@/lib/rust-api/viewer-client";
import { useTRPC } from "@/trpc/client";

export function useUserQuery() {
  // useQuery instead of useSuspenseQuery so components outside a Suspense
  // boundary don't blank the page during hydration. Data is always
  // pre-fetched by the (sidebar) layout which awaits the Rust viewer.
  const result = useQuery({
    ...viewerQueryOptions(),
    refetchInterval: 6 * 60 * 60 * 1000,
  });
  return result as typeof result & { data: NonNullable<typeof result.data> };
}

export function useUserMutation() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.user.update.mutationOptions({
      onMutate: async (newData) => {
        // Cancel outgoing refetches
        await queryClient.cancelQueries({
          queryKey: viewerQueryKey,
        });

        // Get current data
        const previousData = queryClient.getQueryData(viewerQueryKey);

        // Optimistically update
        queryClient.setQueryData(viewerQueryKey, (old: any) => ({
          ...old,
          ...newData,
        }));

        return { previousData };
      },
      onError: (_, __, context) => {
        // Rollback on error
        queryClient.setQueryData(viewerQueryKey, context?.previousData);
      },
      onSettled: () => {
        // Refetch after error or success
        queryClient.invalidateQueries({
          queryKey: viewerQueryKey,
        });
      },
    }),
  );
}

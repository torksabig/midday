"use client";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { teamCurrentQueryKey } from "@/lib/rust-api/team";
import { teamCurrentQueryOptions } from "@/lib/rust-api/team-client";
import { useTRPC } from "@/trpc/client";

export function useTeamQuery() {
  return useSuspenseQuery(teamCurrentQueryOptions());
}

export function useTeamMutation() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.team.update.mutationOptions({
      onMutate: async (newData) => {
        // Cancel outgoing refetches
        await queryClient.cancelQueries({
          queryKey: teamCurrentQueryKey,
        });

        // Get current data
        const previousData = queryClient.getQueryData(teamCurrentQueryKey);

        // Optimistically update
        queryClient.setQueryData(teamCurrentQueryKey, (old: any) => ({
          ...old,
          ...newData,
        }));

        return { previousData };
      },
      onError: (_, __, context) => {
        // Rollback on error
        queryClient.setQueryData(teamCurrentQueryKey, context?.previousData);
      },
      onSettled: () => {
        // Refetch after error or success
        queryClient.invalidateQueries({
          queryKey: teamCurrentQueryKey,
        });
      },
    }),
  );
}

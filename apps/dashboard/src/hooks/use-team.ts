"use client";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { teamCurrentQueryKey } from "@/lib/rust-api/team";
import {
  teamCurrentQueryOptions,
  updateTeamFromRust,
} from "@/lib/rust-api/team-client";

export function useTeamQuery() {
  return useSuspenseQuery(teamCurrentQueryOptions());
}

export function useTeamMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTeamFromRust,
    onMutate: async (newData) => {
      await queryClient.cancelQueries({
        queryKey: teamCurrentQueryKey,
      });

      const previousData = queryClient.getQueryData(teamCurrentQueryKey);

      queryClient.setQueryData(teamCurrentQueryKey, (old: any) => ({
        ...old,
        ...newData,
      }));

      return { previousData };
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(teamCurrentQueryKey, context?.previousData);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: teamCurrentQueryKey,
      });
    },
  });
}

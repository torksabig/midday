import type { Metadata } from "next";
import { TeamMembers } from "@/components/team-members";
import { teamMembersServerQueryOptions } from "@/lib/rust-api/team-server";
import { prefetch, trpc } from "@/trpc/server";

export const metadata: Metadata = {
  title: "Members | Midday",
};

export default function Members() {
  prefetch(teamMembersServerQueryOptions(trpc.team.members.queryKey()));
  prefetch(trpc.team.teamInvites.queryOptions());

  return <TeamMembers />;
}

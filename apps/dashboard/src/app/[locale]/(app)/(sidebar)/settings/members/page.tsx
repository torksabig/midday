import type { Metadata } from "next";
import { TeamMembers } from "@/components/team-members";
import {
  teamInvitesServerQueryOptions,
  teamMembersServerQueryOptions,
} from "@/lib/rust-api/team-server";
import { prefetch, trpc } from "@/trpc/server";

export const metadata: Metadata = {
  title: "Members | Midday",
};

export default function Members() {
  prefetch(teamMembersServerQueryOptions(trpc.team.members.queryKey()));
  prefetch(teamInvitesServerQueryOptions(trpc.team.teamInvites.queryKey()));

  return <TeamMembers />;
}

"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@midday/ui/dropdown-menu";
import { Icons } from "@midday/ui/icons";
import { ScrollArea } from "@midday/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader } from "@midday/ui/sheet";
import { useToast } from "@midday/ui/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useCopyToClipboard } from "usehooks-ts";
import { OAuthApplicationForm } from "@/components/forms/oauth-application-form";
import { DeleteOAuthApplicationModal } from "@/components/modals/delete-oauth-application-modal";
import { OAuthApplicationStatusBadge } from "@/components/oauth-application-status-badge";
import { useOAuthApplicationParams } from "@/hooks/use-oauth-application-params";
import {
  oauthApplicationByIdQueryOptions,
  updateOAuthApprovalStatusFromRust,
  updateOAuthApprovalStatusWithReviewEmail,
} from "@/lib/rust-api/oauth-applications-client";
import { useTeamQuery } from "@/hooks/use-team";
import { useUserQuery } from "@/hooks/use-user";
import { useTRPC } from "@/trpc/client";

export function OAuthApplicationEditSheet() {
  const trpc = useTRPC();
  const { data: team } = useTeamQuery();
  const { data: user } = useUserQuery();
  const { toast } = useToast();
  const [, copy] = useCopyToClipboard();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const queryClient = useQueryClient();
  const { setParams, applicationId, editApplication } =
    useOAuthApplicationParams();

  const isOpen = Boolean(applicationId && editApplication);

  const { data: application } = useQuery(
    oauthApplicationByIdQueryOptions(
      trpc.oauthApplications.get.queryKey({ id: applicationId! }),
      applicationId!,
      { enabled: isOpen },
    ),
  );

  const enqueueOAuthApprovalReviewEmailMutation = useMutation(
    trpc.oauthApplications.enqueueOAuthApprovalReviewEmail.mutationOptions(),
  );

  const invalidateOAuthApplicationQueries = () => {
    queryClient.invalidateQueries({
      queryKey: trpc.oauthApplications.list.queryKey(),
    });
    queryClient.invalidateQueries({
      queryKey: trpc.oauthApplications.get.queryKey(),
    });
  };

  const submitForReviewMutation = useMutation({
    mutationFn: async (input: { id: string; status: "pending" }) => {
      const userEmail = user?.email;
      const teamName = team?.name;
      if (!userEmail || !teamName) {
        throw new Error("Team and user email are required to submit for review");
      }

      return updateOAuthApprovalStatusWithReviewEmail({
        input,
        teamName,
        userEmail,
        developerName: application?.developerName,
        enqueueReviewEmail: (payload) =>
          enqueueOAuthApprovalReviewEmailMutation.mutateAsync(payload),
      });
    },
    onSuccess: () => {
      invalidateOAuthApplicationQueries();
      toast({
        title: "Submitted for review",
        description:
          "Your application has been submitted for review and will be visible once approved.",
        variant: "success",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit for review",
      });
    },
  });

  const makeDraftMutation = useMutation({
    mutationFn: (input: { id: string; status: "draft" }) =>
      updateOAuthApprovalStatusFromRust(input),
    onSuccess: () => {
      invalidateOAuthApplicationQueries();
      toast({
        title: "Application moved to draft",
        description:
          "Your application has been moved back to draft status and removed from review.",
        variant: "success",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to move to draft",
      });
    },
  });

  const handleCopyClientId = () => {
    if (application?.clientId) {
      copy(application.clientId);
      toast({
        title: "Client ID copied to clipboard",
        variant: "success",
      });
    }
  };

  const handleSubmitForReview = () => {
    if (applicationId) {
      submitForReviewMutation.mutate({
        id: applicationId,
        status: "pending",
      });
    }
  };

  const handleMakeDraft = () => {
    if (applicationId) {
      makeDraftMutation.mutate({
        id: applicationId,
        status: "draft",
      });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={() => setParams(null)}>
      <SheetContent stack>
        <SheetHeader className="mb-6 flex justify-between items-center flex-row">
          <h2 className="text-xl">Edit OAuth Application</h2>

          <div className="flex items-center gap-2">
            {application?.status && (
              <OAuthApplicationStatusBadge status={application.status} />
            )}

            {applicationId && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button">
                    <Icons.MoreVertical className="size-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent sideOffset={10} align="end">
                  <DropdownMenuItem onClick={handleCopyClientId}>
                    Copy Client ID
                  </DropdownMenuItem>
                  {application?.status === "draft" && (
                    <DropdownMenuItem
                      onClick={handleSubmitForReview}
                      disabled={submitForReviewMutation.isPending}
                    >
                      {submitForReviewMutation.isPending
                        ? "Submitting..."
                        : "Submit for review"}
                    </DropdownMenuItem>
                  )}
                  {application?.status === "pending" && (
                    <DropdownMenuItem
                      onClick={handleMakeDraft}
                      disabled={makeDraftMutation.isPending}
                    >
                      {makeDraftMutation.isPending
                        ? "Cancelling review..."
                        : "Cancel review"}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="h-full p-0 pb-10" hideScrollbar>
          <OAuthApplicationForm data={application} key={application?.id} />
        </ScrollArea>
      </SheetContent>

      <DeleteOAuthApplicationModal
        applicationId={applicationId!}
        applicationName={application?.name || ""}
        isOpen={showDeleteModal}
        onOpenChange={setShowDeleteModal}
      />
    </Sheet>
  );
}

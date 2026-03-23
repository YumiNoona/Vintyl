"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useMutationData } from "@/hooks/useMutationData";
import { acceptInvite } from "@/actions/workspace";
import { UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function InviteAcceptButton({ inviteId }: { inviteId: string }) {
  const { mutate, isPending } = useMutationData(
    ["accept-invite"],
    () => acceptInvite(inviteId),
    "user-notifications",
    () => {
      toast.success("Done!");
    }
  );

  return (
    <Button
      onClick={() => mutate(undefined)}
      disabled={isPending}
      className="mt-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl h-9 px-4 text-xs font-bold shadow-lg shadow-purple-500/20 active:scale-95 transition-all"
    >
      {isPending ? (
        <Loader2 className="w-3 h-3 animate-spin mr-2" />
      ) : (
        <UserPlus className="w-3 h-3 mr-2" />
      )}
      Accept Invitation
    </Button>
  );
}

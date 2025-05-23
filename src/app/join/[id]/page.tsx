"use client";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { TransactionDialog } from "@/components/TransactionDialog";
import { useAcceptInvitation } from "@/hooks/useAcceptInvitation";
import { useGroup } from "@/hooks/useGroup";
import { useInvitations } from "@/hooks/useInvitations";
import { useCurrentFlowUser } from "@onflow/kit";

export default function JoinGroupPage() {
  const params = useParams<{ id: string }>();
  const { id: invitationUuid } = params;
  const [txOpen, setTxOpen] = useState(false);
  const [canGoToGroup, setCanGoToGroup] = useState(false);
  const router = useRouter();
  const { acceptInvitationAsync } = useAcceptInvitation();
  const { user } = useCurrentFlowUser();
  const [txId, setTxId] = useState<string>();

  const { data: invitation } = useInvitations({ address: user?.addr });
  const [groupUuid, setGroupUuid] = useState<string | undefined>(undefined);
  useEffect(() => {
    // TODO: This is a hack
    const _groupUuid = invitation?.invitations?.find(
      (i) => i.uuid === invitationUuid
    )?.group?.uuid;

    if (_groupUuid) {
      setGroupUuid(_groupUuid);
    }
  }, [invitation, invitationUuid]);
  const { data: group } = useGroup({
    id: groupUuid,
  });

  const handleJoin = async () => {
    if (!groupUuid) return;

    try {
      const txId = await acceptInvitationAsync({
        groupId: groupUuid,
      });
      setTxId(txId);
      setTxOpen(true);
    } catch (err) {
      console.error("Failed to join group:", err);
    }
  };

  const handleSuccess = () => {
    setCanGoToGroup(true);
  };

  const handleGoToGroup = () => {
    if (typeof groupUuid === "string") {
      router.push(`/groups/${groupUuid}`);
    } else if (Array.isArray(groupUuid) && groupUuid[0]) {
      router.push(`/groups/${groupUuid[0]}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 max-w-md w-full flex flex-col items-center gap-6">
        <h1 className="text-2xl font-bold text-center">
          You've been invited to a group!
        </h1>
        <div className="w-full text-center">
          <div className="text-lg font-semibold mb-1">{group?.name}</div>
        </div>
        <div className="w-full">
          <div className="text-sm font-medium mb-2">Members</div>
          <div className="flex flex-col gap-2">
            {group?.members.map((member) => (
              <div
                key={member.address}
                className="flex items-center gap-3 p-2 bg-gray-100 dark:bg-gray-800 rounded-md"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <span className="font-mono text-xs">{member.address}</span>
              </div>
            ))}
          </div>
        </div>
        <Button
          className={`w-full mt-4 flex items-center justify-center gap-2 ${
            canGoToGroup ? "bg-green-600 hover:bg-green-700 text-white" : ""
          }`}
          size="lg"
          onClick={canGoToGroup ? handleGoToGroup : handleJoin}
          disabled={(txOpen && !canGoToGroup) || !groupUuid}
        >
          {canGoToGroup ? (
            <>
              <CheckCircle2 className="h-5 w-5" /> Go to Group
            </>
          ) : (
            "Join Group"
          )}
        </Button>
      </div>
      <TransactionDialog
        open={txOpen}
        onOpenChange={setTxOpen}
        txId={txId}
        pendingTitle="Joining Group"
        pendingDescription="You are being added to the group. Please wait..."
        successTitle="You've Joined!"
        successDescription="You have been successfully added to the group."
        onSuccess={handleSuccess}
        closeOnSuccess={true}
      />
    </div>
  );
}

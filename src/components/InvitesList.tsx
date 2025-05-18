import React from "react";
import { InviteCard } from "@/components/InviteCard";
import { Mail } from "lucide-react";
import { useInvitations } from "@/hooks/useInvitations";
import { useCurrentFlowUser } from "@onflow/kit";

export function InvitesList() {
  const { user } = useCurrentFlowUser();
  const { data: invitationList } = useInvitations({
    address: user?.addr,
  });

  if (!invitationList?.invitations?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
          <Mail className="w-12 h-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No Pending Invites</h3>
        <p className="text-muted-foreground max-w-md">
          You don't have any pending invites at the moment. When someone invites
          you to a group, it will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {invitationList.invitations.map((invite) => (
        <InviteCard
          key={invite.uuid}
          id={invite.uuid}
          groupName={invite.group.name}
          invitedBy={/*invite.invitedBy*/ "0x1234567890abcdef"}
          members={invite.group.members.map((member) => member.address)}
        />
      ))}
    </div>
  );
}

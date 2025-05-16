import React from "react";
import { InviteCard } from "@/components/InviteCard";

const mockInvites = [
  {
    id: "1",
    groupName: "Roommates 2024",
    invitedBy: "0x1234567890abcdef",
    members: ["0x1234567890abcdef", "0xabcdef1234567890", "0x9876543210fedcba"],
  },
  {
    id: "2",
    groupName: "Trip to Japan",
    invitedBy: "0xabcdef1234567890",
    members: ["0xabcdef1234567890", "0x9876543210fedcba", "0x1234567890abcdef"],
  },
];

export function InvitesList() {
  if (mockInvites.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No pending invites</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {mockInvites.map((invite) => (
        <InviteCard
          key={invite.id}
          id={invite.id}
          groupName={invite.groupName}
          invitedBy={invite.invitedBy}
          members={invite.members}
        />
      ))}
    </div>
  );
}

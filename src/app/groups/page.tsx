"use client";

import { useCurrentFlowUser } from "@onflow/kit";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { GroupForm } from "@/components/GroupForm";
import { GroupCard } from "@/components/GroupCard";
import { useGroupsSummary } from "@/hooks/useGroupsSummary";
import { useCreateGroup } from "@/hooks/useCreateGroup";

export default function GroupsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const address = useCurrentFlowUser().user.addr;
  const { data: groups, isLoading, error } = useGroupsSummary(address);
  const { data: user, createGroup } = useCreateGroup()

  const handleCreateGroup = (groupName: string, members: string[]) => {
    console.log("Creating group:", { groupName, members });
    createGroup({
      name: groupName,
      invitees: members,
    })
    setIsOpen(false);
  };

  if (isLoading)
    return (
      <div className="container mx-auto p-4">
        <p>Loading groups...</p>
      </div>
    );

  if (error)
    return (
      <div className="container mx-auto p-4">
        <p className="text-red-500">Error: {error.message}</p>
      </div>
    );

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Groups</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>Create Group</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Group</DialogTitle>
              <DialogDescription>
                Create a new group to start splitting expenses with friends.
              </DialogDescription>
            </DialogHeader>
            <GroupForm
              onSubmit={handleCreateGroup}
              onCancel={() => setIsOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {groups?.map((group, index) => (
          <GroupCard key={index} id={String(index)} group={group} />
        ))}
      </div>
    </div>
  );
}

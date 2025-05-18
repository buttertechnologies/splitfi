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
import { useUserGroups } from "@/hooks/useUserGroups";
import { useCreateGroup } from "@/hooks/useCreateGroup";
import { Users } from "lucide-react";

export default function GroupsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const address = useCurrentFlowUser().user.addr;
  const { data: groups, isLoading, error } = useUserGroups(address);
  const { createGroupAsync, isPending, error: createError } = useCreateGroup();

  const handleCreateGroup = async (groupName: string, members: string[]) => {
    try {
      const txId = await createGroupAsync({
        name: groupName,
        invitees: members,
      });

      console.log("Transaction ID:", txId);
      setIsOpen(false);
    } catch (err) {
      console.error("Failed to create group:", err);
    }
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
        {groups?.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-gray-100 p-6 mb-4">
              <Users className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No groups yet
            </h3>
            <p className="text-gray-500 mb-6">
              Create your first group to start splitting expenses with friends.
            </p>
            <Button onClick={() => setIsOpen(true)}>Create Group</Button>
          </div>
        ) : (
          groups?.map((group, index) => <GroupCard key={index} group={group} />)
        )}
      </div>
    </div>
  );
}

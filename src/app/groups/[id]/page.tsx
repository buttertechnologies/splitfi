"use client";
import { useParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GroupForm } from "@/components/GroupForm";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";

const dummyGroup = {
  name: "Weekend Trip to Vegas",
  members: ["0x1234567890abcdef", "0xabcdef1234567890", "0x9876543210fedcba"],
};

export default function GroupDetailPage() {
  const params = useParams();
  const { id } = params;
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleEditGroup = (groupName: string, members: string[]) => {
    console.log("Editing group:", { groupName, members });
    setIsEditDialogOpen(false);
  };

  return (
    <div className="container mx-auto p-8">
      <div className="mb-6">
        <Link href="/groups">
          <Button variant="link" className="p-0 h-auto text-base">← Back to Groups</Button>
        </Link>
      </div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4 sm:gap-0">
        <h1 className="text-3xl font-bold">{dummyGroup.name}</h1>
        {/* TODO: Only show edit button to group administrators */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <Button onClick={() => setIsEditDialogOpen(true)}>Edit Group</Button>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Group</DialogTitle>
              <DialogDescription>
                Make changes to your group here. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <GroupForm
              onSubmit={handleEditGroup}
              onCancel={() => setIsEditDialogOpen(false)}
              initialName={dummyGroup.name}
              initialMembers={dummyGroup.members}
            />
          </DialogContent>
        </Dialog>
      </div>
      <hr className="my-4 border-t border-gray-200" />
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Group Members</h2>
        <div className="flex -space-x-2">
          {dummyGroup.members.map((address) => (
            <Avatar key={address} className="border-2 border-background">
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
      </div>
    </div>
  );
}

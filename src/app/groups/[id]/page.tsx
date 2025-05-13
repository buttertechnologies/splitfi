"use client";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GroupForm } from "@/components/GroupForm";

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
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Group Details</h1>
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
            />
          </DialogContent>
        </Dialog>
      </div>
      <p className="text-lg">
        Group ID: <span className="font-mono">{id}</span>
      </p>
    </div>
  );
}

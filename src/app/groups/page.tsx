"use client";

import { useFlowQuery } from "@onflow/kit";
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

export default function GroupsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const { data, isLoading, error } = useFlowQuery({
    cadence: `
      access(all)
      fun main(): [String] {
          return [
              "Mexico City Trip 2024",
              "Weekly Dinner Club",
              "Ski Weekend - Tahoe",
              "Beach House - Malibu",
              "Birthday Party - Sarah",
              "Camping Trip - Yosemite",
              "Concert - Taylor Swift",
              "Apartment Utilities",
              "Office Lunch Pool",
              "Wedding - Mike & Lisa"
          ]
      }
    `,
  });

  const handleCreateGroup = (groupName: string, members: string[]) => {
    console.log("Creating group:", { groupName, members });
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
        {(data as string[])?.map((group, index) => (
          <GroupCard key={index} name={group} />
        ))}
      </div>
    </div>
  );
}

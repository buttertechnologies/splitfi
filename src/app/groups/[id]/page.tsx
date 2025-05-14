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
import { ExpenseForm } from "@/components/ExpenseForm";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { ExpenseCard } from "@/components/ExpenseCard";
import { PaymentCard } from "@/components/PaymentCard";

const dummyGroup = {
  name: "Weekend Trip to Vegas",
  members: ["0x1234567890abcdef", "0xabcdef1234567890", "0x9876543210fedcba"],
};

const dummyExpenses = [
  {
    id: 1,
    description: "Hotel Room",
    amount: 450.0,
    date: new Date("2024-03-15T14:30:00"),
    splitBetween: ["0x1234567890abcdef", "0xabcdef1234567890"],
  },
  {
    id: 2,
    description: "Dinner at Restaurant",
    amount: 180.5,
    date: new Date("2024-03-15T20:00:00"),
    splitBetween: [
      "0x1234567890abcdef",
      "0xabcdef1234567890",
      "0x9876543210fedcba",
    ],
  },
  {
    id: 3,
    description: "Show Tickets",
    amount: 300.0,
    date: new Date("2024-03-16T19:00:00"),
    splitBetween: ["0x1234567890abcdef", "0x9876543210fedcba"],
  },
];

const dummyPayments = [
  {
    id: 1,
    from: "0xabcdef1234567890",
    to: ["0x1234567890abcdef", "0x9876543210fedcba"],
    amounts: [150.0, 75.0],
    date: new Date("2024-03-16T10:00:00"),
  },
  {
    id: 2,
    from: "0x9876543210fedcba",
    to: ["0x1234567890abcdef"],
    amounts: [150.0],
    date: new Date("2024-03-16T11:30:00"),
  },
];

export default function GroupDetailPage() {
  const params = useParams();
  const { id } = params;
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddExpenseDialogOpen, setIsAddExpenseDialogOpen] = useState(false);

  const handleEditGroup = (groupName: string, members: string[]) => {
    console.log("Editing group:", { groupName, members });
    setIsEditDialogOpen(false);
  };

  const handleAddExpense = (description: string, amount: number) => {
    console.log("Adding expense:", { description, amount });
    setIsAddExpenseDialogOpen(false);
  };

  return (
    <div className="container mx-auto p-8">
      <div className="mb-6">
        <Link href="/groups">
          <Button variant="link" className="p-0 h-auto text-base">
            ← Back to Groups
          </Button>
        </Link>
      </div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4 sm:gap-0">
        <h1 className="text-3xl font-bold">{dummyGroup.name}</h1>
        <div className="flex gap-2">
          <Button onClick={() => setIsAddExpenseDialogOpen(true)}>
            Add Expense
          </Button>
          {/* TODO: Only show edit button to group administrators */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <Button onClick={() => setIsEditDialogOpen(true)}>
              Edit Group
            </Button>
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
      </div>
      <div className="flex gap-2">
        <Dialog
          open={isAddExpenseDialogOpen}
          onOpenChange={setIsAddExpenseDialogOpen}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Expense</DialogTitle>
              <DialogDescription>
                Add a new expense to split with your group members.
              </DialogDescription>
            </DialogHeader>
            <ExpenseForm
              onSubmit={handleAddExpense}
              onCancel={() => setIsAddExpenseDialogOpen(false)}
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

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Activity</h2>
        <div className="grid gap-4">
          {[...dummyExpenses, ...dummyPayments]
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .map((item) => {
              if ('description' in item) {
                return (
                  <ExpenseCard
                    key={item.id}
                    description={item.description}
                    amount={item.amount}
                    date={item.date}
                    splitBetween={item.splitBetween}
                  />
                );
              } else {
                return (
                  <PaymentCard
                    key={item.id}
                    from={item.from}
                    to={item.to}
                    amounts={item.amounts}
                    date={item.date}
                  />
                );
              }
            })}
        </div>
      </div>
    </div>
  );
}

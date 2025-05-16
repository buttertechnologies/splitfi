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
import { MembersList } from "@/components/MembersList";
import { TransactionDialog } from "@/components/TransactionDialog";
import { useGroup } from "@/hooks/useGroup";
import { useAddExpense } from "@/hooks/useAddExpense";

const dummyPayments = [
  {
    type: "payment",
    id: 1,
    from: "0xabcdef1234567890",
    to: ["0x1234567890abcdef", "0x9876543210fedcba"],
    amounts: [150.0, 75.0],
    date: new Date("2024-03-16T10:00:00"),
  },
  {
    type: "payment",
    id: 2,
    from: "0x9876543210fedcba",
    to: ["0x1234567890abcdef"],
    amounts: [150.0],
    date: new Date("2024-03-16T11:30:00"),
  },
];

export default function GroupDetailPage() {
  const params = useParams<{ id: string }>();
  const { id } = params;
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddExpenseDialogOpen, setIsAddExpenseDialogOpen] = useState(false);
  const [isMembersDialogOpen, setIsMembersDialogOpen] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedMembersTitle, setSelectedMembersTitle] = useState("");
  const [selectedMembersDescription, setSelectedMembersDescription] =
    useState("");
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const { data: group } = useGroup(id);
  const { addExpense } = useAddExpense();

  const handleEditGroup = (groupName: string, members: string[]) => {
    console.log("Editing group:", { groupName, members });
    setIsEditDialogOpen(false);
  };

  const handleAddExpense = (
    description: string,
    amount: number,
    memberPercentages: { address: string; fraction: number }[]
  ) => {
    addExpense({
      groupId: id,
      amount,
      description,
      timestamp: new Date(),
      debtors: memberPercentages.map(({ address, fraction }) => ({
        address: address,
        fraction: fraction,
      })),
    });
    setIsAddExpenseDialogOpen(false);
    setIsTransactionDialogOpen(true);
  };

  const expenseFeedItems =
    group?.members.flatMap((member) =>
      member.expenses.map((expense) => {
        const date = new Date(Number(expense.timestamp) * 1000);
        return {
          date,
          content: (
            <div
              key={`expense-${expense.timestamp}`}
              onClick={() => {
                setSelectedMembers(Object.keys(expense.debtors));
                setSelectedMembersTitle(`Members for ${expense.description}`);
                setSelectedMembersDescription("Members who split this expense");
                setIsMembersDialogOpen(true);
              }}
              className="cursor-pointer hover:opacity-80 transition-opacity"
            >
              <ExpenseCard
                description={expense.description}
                amount={expense.amount}
                date={date}
                splitBetween={Object.keys(expense.debtors)}
              />
            </div>
          ),
        };
      })
    ) || [];

  const paymentFeedItems =
    dummyPayments.map((payment) => {
      const date = new Date(payment.date.getTime());
      return {
        date,
        content: (
          <div
            key={`payment-${payment.id}`}
            onClick={() => {
              setSelectedMembers([payment.from, ...payment.to]);
              setSelectedMembersTitle("Payment Members");
              setSelectedMembersDescription("Members involved in this payment");
              setIsMembersDialogOpen(true);
            }}
            className="cursor-pointer hover:opacity-80 transition-opacity"
          >
            <PaymentCard
              from={payment.from}
              to={payment.to}
              amounts={payment.amounts}
              date={payment.date}
            />
          </div>
        ),
      };
    }) || [];

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
        <h1 className="text-3xl font-bold">{group?.name}</h1>
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
                initialName={group?.name}
                initialMembers={
                  group?.members?.map((member) => member.address) || []
                }
                groupId={
                  typeof id === "string" ? id : Array.isArray(id) ? id[0] : ""
                }
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
              members={group?.members?.map((member) => member.address) || []}
            />
          </DialogContent>
        </Dialog>
      </div>
      <hr className="my-4 border-t border-gray-200" />
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Group Members</h2>
        <div
          className="flex -space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => {
            setSelectedMembers(
              group?.members?.map((member) => member.address) || []
            );
            setSelectedMembersTitle("Group Members");
            setSelectedMembersDescription("List of all members in this group");
            setIsMembersDialogOpen(true);
          }}
        >
          {(group?.members?.map((member) => member.address) || []).map(
            (address) => (
              <Avatar key={address} className="border-2 border-background">
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            )
          )}
        </div>
      </div>

      <MembersList
        members={selectedMembers}
        isOpen={isMembersDialogOpen}
        onOpenChange={setIsMembersDialogOpen}
        title={selectedMembersTitle}
        description={selectedMembersDescription}
      />

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Activity</h2>
        <div className="grid gap-4">
          {[...expenseFeedItems, ...paymentFeedItems]
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .map((item) => item.content)}
        </div>
      </div>

      <TransactionDialog
        open={isTransactionDialogOpen}
        onOpenChange={setIsTransactionDialogOpen}
        txId="0x1234567890abcdef"
      />
    </div>
  );
}

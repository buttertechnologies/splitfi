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
import { User, CreditCard, Wallet, Receipt, Loader2, Dice6, PartyPopper } from "lucide-react";
import { ExpenseCard } from "@/components/ExpenseCard";
import { PaymentCard } from "@/components/PaymentCard";
import { TransactionDialog } from "@/components/TransactionDialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    addedBy: "0x1234567890abcdef",
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
    addedBy: "0xabcdef1234567890",
  },
  {
    id: 3,
    description: "Show Tickets",
    amount: 300.0,
    date: new Date("2024-03-16T19:00:00"),
    splitBetween: ["0x1234567890abcdef", "0x9876543210fedcba"],
    addedBy: "0x9876543210fedcba",
  },
];

const dummyPayments = [
  {
    id: 1,
    from: "0xabcdef1234567890",
    to: ["0x1234567890abcdef", "0x9876543210fedcba"],
    amounts: [150.0, 75.0],
    date: new Date("2024-03-16T10:00:00"),
    transactionId: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  },
  {
    id: 2,
    from: "0x9876543210fedcba",
    to: ["0x1234567890abcdef"],
    amounts: [150.0],
    date: new Date("2024-03-16T11:30:00"),
    transactionId: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
  },
];

export default function GroupDetailPage() {
  const params = useParams();
  const { id } = params;
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddExpenseDialogOpen, setIsAddExpenseDialogOpen] = useState(false);
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [isPaymentAmountDialogOpen, setIsPaymentAmountDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [isRandomPayerDialogOpen, setIsRandomPayerDialogOpen] = useState(false);
  const [showRevealButton, setShowRevealButton] = useState(false);
  const [randomPayer, setRandomPayer] = useState<string | null>(null);

  // Dummy data for money owed/owing
  const amountYouOwe = 225.5;
  const amountOwedToYou = 150.0;

  // Calculate total group expenses from dummyExpenses
  const totalGroupExpenses = dummyExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  );

  const handleEditGroup = (groupName: string, members: string[]) => {
    console.log("Editing group:", { groupName, members });
    setIsEditDialogOpen(false);
  };

  const handleAddExpense = (
    description: string,
    amount: number,
    splitType: "equal" | "custom" | "random",
    memberAmounts: { member: string; amount: number }[],
  ) => {
    console.log("Adding expense:", {
      description,
      amount,
      splitType,
      memberAmounts,
    });
    setIsAddExpenseDialogOpen(false);
    if (splitType === "random") {
      setIsRandomPayerDialogOpen(true);
      setShowRevealButton(false);
      setRandomPayer(null);
      setTimeout(() => {
        setShowRevealButton(true);
      }, 2500); // 2.5 seconds
    } else {
      setIsTransactionDialogOpen(true);
    }
  };

  const handlePaymentAmountSubmit = () => {
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      return;
    }
    setIsPaymentAmountDialogOpen(false);
    setPaymentAmount("");
    setIsTransactionDialogOpen(true);
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
                groupId={
                  typeof id === "string" ? id : Array.isArray(id) ? id[0] : ""
                }
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center gap-4">
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
              members={dummyGroup.members}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        {/* Total Group Expenses */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Receipt className="mr-2 h-5 w-5" />
              Total Group Expenses
            </CardTitle>
            <CardDescription>All expenses in this group</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              ${totalGroupExpenses.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        {/* You are owed */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Wallet className="mr-2 h-5 w-5" />
              You are owed
            </CardTitle>
            <CardDescription>Money others need to pay you</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${amountOwedToYou.toFixed(2)}</p>
          </CardContent>
        </Card>

        {/* You owe */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <CreditCard className="mr-2 h-5 w-5" />
              You owe
            </CardTitle>
            <CardDescription>Money you need to pay others</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            <p className="text-2xl font-bold">${amountYouOwe.toFixed(2)}</p>
            <Button
              onClick={() => setIsPaymentAmountDialogOpen(true)}
              variant="default"
              className="ml-2"
            >
              Pay people back
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Activity</h2>
        <div className="grid gap-4">
          {[...dummyExpenses, ...dummyPayments]
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .map((item) => {
              if ("description" in item) {
                return (
                  <ExpenseCard
                    key={`expense-${item.id}`}
                    description={item.description}
                    amount={item.amount}
                    date={item.date}
                    splitBetween={item.splitBetween}
                    addedBy={item.addedBy}
                  />
                );
              } else {
                return (
                  <PaymentCard
                    key={`payment-${item.id}`}
                    from={item.from}
                    to={item.to}
                    amounts={item.amounts}
                    date={item.date}
                    transactionId={item.transactionId}
                  />
                );
              }
            })}
        </div>
      </div>

      <Dialog
        open={isPaymentAmountDialogOpen}
        onOpenChange={setIsPaymentAmountDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Enter Payment Amount</DialogTitle>
            <DialogDescription>
              How much would you like to pay back?
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="pl-7"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsPaymentAmountDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handlePaymentAmountSubmit}>Continue</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isRandomPayerDialogOpen} onOpenChange={setIsRandomPayerDialogOpen}>
        <DialogContent className="sm:max-w-[425px] flex flex-col items-center">
          <DialogHeader>
            <DialogTitle>Choosing a random payer…</DialogTitle>
            <DialogDescription>
              Using Flow's on-chain randomness to select who pays for this expense.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-6">
            {randomPayer ? null : (
              <>
                <Dice6 className={`h-12 w-12 text-primary mb-4 ${!showRevealButton ? 'animate-bounce' : ''}`} />
                {!showRevealButton && (
                  <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                )}
              </>
            )}
          </div>
          {showRevealButton && !randomPayer && (
            <Button
              onClick={() => {
                // For now, just pick a random member and show it
                const members = dummyGroup.members;
                const picked = members[Math.floor(Math.random() * members.length)];
                setRandomPayer(picked);
                setShowRevealButton(false);
              }}
              className="mt-4"
            >
              Reveal
            </Button>
          )}
          {randomPayer && (
            <div className="mt-6 text-center w-full flex flex-col items-center">
              <PartyPopper className="h-10 w-10 text-primary mb-2 animate-pop" />
              <p className="text-lg font-semibold mb-2">Selected payer:</p>
              <p className="text-xl font-mono text-primary mb-6">
                {randomPayer.slice(0, 6)}...{randomPayer.slice(-4)}
              </p>
              <Button onClick={() => setIsRandomPayerDialogOpen(false)}>
                Done
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <TransactionDialog
        open={isTransactionDialogOpen}
        onOpenChange={setIsTransactionDialogOpen}
        txId="0x1234567890abcdef"
      />
    </div>
  );
}

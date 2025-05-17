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
import {
  User,
  CreditCard,
  Wallet,
  Receipt,
  Loader2,
  Dice6,
  PartyPopper,
  Filter,
} from "lucide-react";
import { ExpenseCard } from "@/components/ExpenseCard";
import { PaymentCard } from "@/components/PaymentCard";
import { TransactionDialog } from "@/components/TransactionDialog";
import { MembersList } from "@/components/MembersList";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGroup } from "@/hooks/useGroup";
import { useAddExpense } from "@/hooks/useAddExpense";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { useUserBalanceByGroupId } from "@/hooks/useUserBalanceByGroupId";
import { useCurrentFlowUser } from "@onflow/kit";

interface Member {
  address: string;
  status?: "pending" | "active";
}

const dummyGroup = {
  name: "Weekend Trip to Vegas",
  members: [
    { address: "0x1234567890abcdef", status: "active" },
    { address: "0xabcdef1234567890", status: "pending" },
    { address: "0x9876543210fedcba", status: "active" },
    { address: "0x1111111111111111", status: "pending" },
  ] as Member[],
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
    type: "payment",
    id: 1,
    from: "0xabcdef1234567890",
    to: ["0x1234567890abcdef", "0x9876543210fedcba"],
    amounts: [150.0, 75.0],
    date: new Date("2024-03-16T10:00:00"),
    transactionId:
      "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  },
  {
    type: "payment",
    id: 2,
    from: "0x9876543210fedcba",
    to: ["0x1234567890abcdef"],
    amounts: [150.0],
    date: new Date("2024-03-16T11:30:00"),
    transactionId:
      "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
  },
];

export default function GroupDetailPage() {
  const params = useParams<{ id: string }>();
  const { id } = params;
  const { user } = useCurrentFlowUser();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddExpenseDialogOpen, setIsAddExpenseDialogOpen] = useState(false);
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [isPaymentAmountDialogOpen, setIsPaymentAmountDialogOpen] =
    useState(false);
  const [isMembersListOpen, setIsMembersListOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [isRandomPayerDialogOpen, setIsRandomPayerDialogOpen] = useState(false);
  const [showRevealButton, setShowRevealButton] = useState(false);
  const [randomPayer, setRandomPayer] = useState<string | null>(null);
  const [showOnlyUserExpenses, setShowOnlyUserExpenses] = useState(false);

  const { data: group } = useGroup({ id });
  const { data: amountYouOwe } = useUserBalanceByGroupId({
    address: user.addr,
    groupId: id,
  });
  const { addExpense } = useAddExpense();

  // Dummy data for money owed/owing

  const amountOwedToYou = 150.0;

  // Calculate total group expenses from dummyExpenses
  const totalGroupExpenses = group?.members
    .flatMap((x) => x.expenses)
    .reduce((sum, expense) => sum + Number(expense.amount), 0);

  const handleEditGroup = (groupName: string, members: string[]) => {
    console.log("Editing group:", { groupName, members });
    setIsEditDialogOpen(false);
  };

  const handleAddExpense = (
    description: string,
    amount: number,
    splitType: "equal" | "custom" | "random",
    memberAmounts: { member: string; amount: number }[]
  ) => {
    addExpense({
      groupId: id,
      amount,
      description,
      timestamp: new Date(),
      debtors: memberAmounts.map(({ member, amount }) => ({
        address: member,
        fraction: amount,
      })),
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

  const expenseFeedItems =
    group?.members.flatMap((member) =>
      member.expenses.map((expense) => {
        const date = new Date(Number(expense.timestamp) * 1000);
        return {
          date,
          content: (
            <ExpenseCard
              key={`expense-${expense.timestamp}`}
              description={expense.description}
              amount={expense.amount}
              date={date}
              splitBetween={Object.keys(expense.debtors)}
              addedBy={member.address}
            />
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
          <PaymentCard
            key={`payment-${payment.id}`}
            from={payment.from}
            to={payment.to}
            amounts={payment.amounts}
            date={payment.date}
            transactionId={payment.transactionId}
          />
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

      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsMembersListOpen(true)}
          className="flex -space-x-2 hover:opacity-80 transition-opacity cursor-pointer"
        >
          {dummyGroup.members.map((member) => (
            <Avatar key={member.address} className="border-2 border-background">
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          ))}
        </button>
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
              ${totalGroupExpenses?.toFixed(2) || "0.00"}
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
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">
                ${Number(amountYouOwe || 0).toFixed(2)}
              </p>
              {Number(amountYouOwe || 0) <= 0 && (
                <PartyPopper className="h-5 w-5 text-primary animate-bounce" />
              )}
            </div>
            <Button
              onClick={() => setIsPaymentAmountDialogOpen(true)}
              variant="default"
              className="ml-2"
              disabled={Number(amountYouOwe || 0) <= 0}
            >
              Pay people back
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Activity</h2>
          <Button
            variant={showOnlyUserExpenses ? "default" : "outline"}
            onClick={() => setShowOnlyUserExpenses(!showOnlyUserExpenses)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            {showOnlyUserExpenses ? "Show All Expenses" : "Show My Expenses"}
          </Button>
        </div>
        <div className="grid gap-4">
          {[...expenseFeedItems, ...paymentFeedItems]
            .filter((item) => {
              if (!showOnlyUserExpenses) return true;
              // Only show expenses added by current user
              return item.content.props.addedBy === user?.addr;
            })
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .map((item) => item.content)}
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
              <div className="flex w-full items-center space-x-2">
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="flex-1"
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setPaymentAmount("100")}
                      >
                        Max
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>This is your max account balance.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
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

      <Dialog
        open={isRandomPayerDialogOpen}
        onOpenChange={setIsRandomPayerDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px] flex flex-col items-center">
          <DialogHeader>
            <DialogTitle>Choosing a random payer…</DialogTitle>
            <DialogDescription>
              Using Flow's on-chain randomness to select who pays for this
              expense.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-6">
            {randomPayer ? null : (
              <>
                <Dice6
                  className={`h-12 w-12 text-primary mb-4 ${
                    !showRevealButton ? "animate-bounce" : ""
                  }`}
                />
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
                const picked =
                  members[Math.floor(Math.random() * members.length)];
                setRandomPayer(picked.address);
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

      <MembersList
        members={dummyGroup.members}
        isOpen={isMembersListOpen}
        onOpenChange={setIsMembersListOpen}
      />
    </div>
  );
}

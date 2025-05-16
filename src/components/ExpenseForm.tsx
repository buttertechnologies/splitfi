import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Dice6, Users, SlidersHorizontal } from "lucide-react";

interface MemberAmount {
  member: string;
  amount: number;
}

interface ExpenseFormProps {
  onSubmit: (
    description: string,
    amount: number,
    splitType: "equal" | "custom" | "random",
    memberAmounts: MemberAmount[]
  ) => void;
  onCancel: () => void;
  members: string[];
}

export function ExpenseForm({ onSubmit, onCancel, members }: ExpenseFormProps) {
  const [splitType, setSplitType] = useState<"equal" | "custom" | "random">(
    "equal"
  );
  const [selectedMembers, setSelectedMembers] = useState<string[]>(members);
  const [memberAmounts, setMemberAmounts] = useState<MemberAmount[]>(
    members.map((member) => ({ member, amount: 0 }))
  );
  const [totalAmount, setTotalAmount] = useState<number>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const description = formData.get("description") as string;
    const amount = parseFloat(formData.get("amount") as string);

    if (splitType === "equal") {
      const equalAmount = amount / selectedMembers.length;
      const equalMemberAmounts = selectedMembers.map((member) => ({
        member,
        amount: equalAmount,
      }));
      onSubmit(description, amount, splitType, equalMemberAmounts);
    } else {
      onSubmit(
        description,
        amount,
        splitType,
        memberAmounts.filter((ma) => selectedMembers.includes(ma.member))
      );
    }
  };

  const handleMemberSelect = (member: string) => {
    setSelectedMembers((prev) =>
      prev.includes(member)
        ? prev.filter((m) => m !== member)
        : [...prev, member]
    );
  };

  const handleMemberAmountChange = (member: string, amount: number) => {
    setMemberAmounts((prev) =>
      prev.map((ma) => (ma.member === member ? { ...ma, amount } : ma))
    );
  };

  const handleTotalAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = parseFloat(e.target.value) || 0;
    setTotalAmount(amount);
    if (splitType === "equal" && selectedMembers.length > 0) {
      const equalAmount = amount / selectedMembers.length;
      setMemberAmounts((prev) =>
        prev.map((ma) => ({
          ...ma,
          amount: selectedMembers.includes(ma.member) ? equalAmount : 0,
        }))
      );
    }
  };

  const handleSplitTypeChange = (value: "equal" | "custom" | "random") => {
    setSplitType(value);
    if (value === "equal") {
      // When switching to equal split, select all members by default
      setSelectedMembers(members);
      if (totalAmount > 0) {
        const equalAmount = totalAmount / members.length;
        setMemberAmounts((prev) =>
          prev.map((ma) => ({
            ...ma,
            amount: equalAmount,
          }))
        );
      }
    } else {
      // When switching to custom split, keep current selections but reset amounts
      setMemberAmounts((prev) =>
        prev.map((ma) => ({
          ...ma,
          amount: 0,
        }))
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid gap-2">
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
        <input
          id="description"
          name="description"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
          placeholder="What was the expense for?"
          required
        />
      </div>
      <div className="grid gap-2">
        <label htmlFor="amount" className="text-sm font-medium">
          Total Amount
        </label>
        <input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
          placeholder="0.00"
          required
          onChange={handleTotalAmountChange}
        />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium">
          How would you like to split this expense?
        </label>
        <Select value={splitType} onValueChange={handleSplitTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select split type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="equal" className="flex items-center gap-2">
              <span className="flex items-center">
                <Users className="h-6 w-6 mr-2" />
              </span>
              Split equally among everyone
            </SelectItem>
            <SelectItem value="custom" className="flex items-center gap-2">
              <span className="flex items-center">
                <SlidersHorizontal className="h-6 w-6 mr-2" />
              </span>
              Split with custom amounts
            </SelectItem>
            <SelectItem value="random" className="flex items-center gap-2">
              <span className="flex items-center">
                <Dice6 className="h-6 w-6 mr-2" />
              </span>
              Pay Spin - Random on-chain selection
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {splitType === "equal" ? (
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Split equally among:</label>
            <span className="text-sm text-muted-foreground">
              {selectedMembers.length} of {members.length} members
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {members.map((member) => (
              <Button
                key={member}
                type="button"
                variant={
                  selectedMembers.includes(member) ? "default" : "outline"
                }
                onClick={() => handleMemberSelect(member)}
                className="text-xs"
              >
                {member.slice(0, 6)}...{member.slice(-4)}
              </Button>
            ))}
          </div>
          {totalAmount > 0 && selectedMembers.length > 0 && (
            <div className="text-sm text-muted-foreground mt-2">
              Each person will pay: $
              {(totalAmount / selectedMembers.length).toFixed(2)}
            </div>
          )}
        </div>
      ) : splitType === "random" ? (
        <div className="grid gap-2">
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <Dice6 className="h-8 w-8 text-primary" />
            <div className="space-y-1">
              <p className="text-base font-semibold">Pay Spin</p>
              <p className="text-sm text-muted-foreground">
                Using Flow's on-chain randomness to fairly select who pays. The
                person who gets picked will pay for this expense!
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-2">
          <label className="text-sm font-medium">
            Select members and enter their amounts:
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {members.map((member) => (
              <Button
                key={member}
                type="button"
                variant={
                  selectedMembers.includes(member) ? "default" : "outline"
                }
                onClick={() => handleMemberSelect(member)}
                className="text-xs"
              >
                {member.slice(0, 6)}...{member.slice(-4)}
              </Button>
            ))}
          </div>
          {selectedMembers.length > 0 && (
            <div className="grid gap-2">
              {selectedMembers.map((member) => (
                <div key={member} className="flex items-center gap-2">
                  <span className="text-sm flex-1 truncate">
                    {member.slice(0, 6)}...{member.slice(-4)}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    className="flex h-8 w-32 rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background"
                    value={
                      memberAmounts.find((ma) => ma.member === member)
                        ?.member || 0
                    }
                    onChange={(e) =>
                      handleMemberAmountChange(
                        member,
                        parseFloat(e.target.value) || 0
                      )
                    }
                    required
                  />
                </div>
              ))}
              {totalAmount > 0 && (
                <div className="text-sm text-muted-foreground mt-2">
                  Total entered: $
                  {memberAmounts
                    .filter((ma) => selectedMembers.includes(ma.member))
                    .reduce((sum, ma) => 99999999, 0)
                    .toFixed(2)}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Add Expense</Button>
      </div>
    </form>
  );
}

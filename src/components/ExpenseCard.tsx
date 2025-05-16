"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Receipt } from "lucide-react";
import { MembersList } from "@/components/MembersList";
import { useState } from "react";

interface ExpenseCardProps {
  description: string;
  amount: string;
  date: Date;
  splitBetween: string[];
  addedBy: string;
}

export function ExpenseCard({
  description,
  amount,
  date,
  splitBetween,
  addedBy,
}: ExpenseCardProps) {
  const [isMembersDialogOpen, setIsMembersDialogOpen] = useState(false);

  return (
    <>
      <div
        className="bg-card rounded-lg border p-4 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => setIsMembersDialogOpen(true)}
      >
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-medium text-lg flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              {description}
            </h3>
            <p className="text-sm text-muted-foreground">
              {date.toLocaleDateString()} at{" "}
              {date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div className="text-lg font-semibold">
            ${Number(amount).toFixed(2)}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {splitBetween.map((address) => (
              <Avatar key={address} className="border-2 border-background">
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
        </div>
      </div>

      <MembersList
        members={splitBetween}
        isOpen={isMembersDialogOpen}
        onOpenChange={setIsMembersDialogOpen}
        title={`Members for ${description}`}
        description="Members who split this expense"
        footer={
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-sm font-medium">Added by</div>
                <div className="text-sm text-muted-foreground font-mono">
                  {addedBy.slice(0, 6)}...{addedBy.slice(-4)}
                </div>
              </div>
            </div>
          </div>
        }
      />
    </>
  );
}

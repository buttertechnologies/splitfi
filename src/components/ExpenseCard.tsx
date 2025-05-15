"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Receipt } from "lucide-react";

interface ExpenseCardProps {
  description: string;
  amount: number;
  date: Date;
  splitBetween: string[];
}

export function ExpenseCard({ description, amount, date, splitBetween }: ExpenseCardProps) {
  return (
    <div className="bg-card rounded-lg border p-4">
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
          ${amount.toFixed(2)}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex -space-x-2">
          {splitBetween.map((address) => (
            <Avatar
              key={address}
              className="border-2 border-background"
            >
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
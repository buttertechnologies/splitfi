"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, CreditCard, ExternalLink } from "lucide-react";
import { MembersList } from "@/components/MembersList";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface PaymentCardProps {
  from: string;
  to: string[];
  amounts: number[]; // Array of amounts corresponding to each recipient
  date: Date;
  transactionId: string;
}

export function PaymentCard({ from, to, amounts, date, transactionId }: PaymentCardProps) {
  const [isMembersDialogOpen, setIsMembersDialogOpen] = useState(false);
  const totalAmount = amounts.reduce((sum, amount) => sum + amount, 0);

  return (
    <>
      <div 
        className="bg-card rounded-lg border p-4 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => setIsMembersDialogOpen(true)}
      >
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-medium text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Settlement
            </h3>
            <p className="text-sm text-muted-foreground">
              {date.toLocaleDateString()} at{" "}
              {date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold">
              ${totalAmount.toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground">
              {amounts.length} payments
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            <Avatar className="border-2 border-background">
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          </div>
          <span className="text-sm text-muted-foreground">→</span>
          <div className="flex -space-x-2">
            {to.map((address, index) => (
              <Avatar
                key={`${address}-${index}`}
                className="border-2 border-background"
                style={{ zIndex: to.length - index }}
              >
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          <span className="text-sm text-muted-foreground ml-2">
            {from.slice(0, 6)}...{from.slice(-4)} pays{" "}
            {to.length === 1 ? (
              `${to[0].slice(0, 6)}...${to[0].slice(-4)}`
            ) : (
              `${to.length} people`
            )}
          </span>
        </div>
        <div className="mt-3 pt-3 border-t">
          <div className="text-sm text-muted-foreground">
            Payment breakdown:
          </div>
          <div className="mt-1 space-y-1">
            {to.map((address, index) => (
              <div key={`${address}-${index}`} className="flex justify-between text-sm">
                <span>{address.slice(0, 6)}...{address.slice(-4)}</span>
                <span className="font-medium">${amounts[index].toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <MembersList
        members={[from, ...to]}
        isOpen={isMembersDialogOpen}
        onOpenChange={setIsMembersDialogOpen}
        title="Payment Members"
        description="Members involved in this payment"
        footer={
          <div className="mt-4 pt-4 border-t">
            <Button
              variant="outline"
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                window.open(`https://flowscan.org/transaction/${transactionId}`, '_blank');
              }}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View on Flowscan
            </Button>
          </div>
        }
      />
    </>
  );
} 
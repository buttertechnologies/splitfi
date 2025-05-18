import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CreditCard, Wallet, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BalanceCard({ amountYouOwe, setIsPaymentAmountDialogOpen }: { amountYouOwe: number, setIsPaymentAmountDialogOpen: (open: boolean) => void }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center">
          {Number(amountYouOwe || 0) > 0 ? (
            <CreditCard className="mr-2 h-5 w-5" />
          ) : Number(amountYouOwe || 0) < 0 ? (
            <Wallet className="mr-2 h-5 w-5" />
          ) : (
            <PartyPopper className="mr-2 h-5 w-5" />
          )}
          {Number(amountYouOwe || 0) > 0
            ? "You owe"
            : Number(amountYouOwe || 0) < 0
              ? "You are owed"
              : "All settled up"}
        </CardTitle>
        <CardDescription>
          {Number(amountYouOwe || 0) > 0
            ? "Money you need to pay others"
            : Number(amountYouOwe || 0) < 0
              ? "Money others need to pay you"
              : "No outstanding balances"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <p className="text-2xl font-bold">
            ${Math.abs(Number(amountYouOwe || 0)).toFixed(2)}
          </p>
          {Number(amountYouOwe || 0) === 0 && (
            <PartyPopper className="h-5 w-5 text-primary animate-bounce" />
          )}
        </div>
        {Number(amountYouOwe || 0) > 0 && (
          <Button
            onClick={() => setIsPaymentAmountDialogOpen(true)}
            variant="default"
            className="ml-2"
          >
            Pay people back
          </Button>
        )}
      </CardContent>
    </Card>
  );
} 
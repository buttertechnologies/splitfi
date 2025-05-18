import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Wallet } from "lucide-react";

export function AlgorithmCard() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center">
          <Wallet className="mr-2 h-5 w-5" />
          EquiSettle Algorithm
        </CardTitle>
        <CardDescription>How we determine who pays what</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">
          Balances are settled by equalizing everyone's net balance, so all members end at zero with fair, proportional payments.
        </p>
      </CardContent>
    </Card>
  );
} 
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Receipt } from "lucide-react";

export function TotalExpensesCard({ totalGroupExpenses }: { totalGroupExpenses: number }) {
  return (
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
  );
} 
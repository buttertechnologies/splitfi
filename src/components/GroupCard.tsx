import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { GroupSummary } from "@/types/models";
import { useUserBalanceByGroupId } from "@/hooks/useUserBalanceByGroupId";
import { useCurrentFlowUser } from "@onflow/kit";

interface GroupCardProps {
  group: GroupSummary;
}

export function GroupCard({ group }: GroupCardProps) {
  const totalGroupExpenses = group?.members
    ?.flatMap((x) => x.expenses)
    ?.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(totalGroupExpenses || 0);

  // Dummy you owe amount for now
  const { user } = useCurrentFlowUser();
  const { data: userGroupBalance, refetch: refetchBalance } =
    useUserBalanceByGroupId({
      address: user.addr,
      groupId: group.uuid,
    });
  const formattedYouOwe = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Math.abs(Number(userGroupBalance) || 0));

  return (
    <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
      <CardHeader>
        <CardTitle>{group.name}</CardTitle>
        <div className="text-2xl font-bold mt-1">{formattedAmount}</div>
        <div className="text-sm text-muted-foreground mb-2">
          {Number(userGroupBalance) > 0
            ? `You're owed: ${formattedYouOwe}`
            : `You owe: ${formattedYouOwe}`}
        </div>
        <div className="flex -space-x-2 mt-2">
          {group.members.map((member) => (
            <Avatar key={member.address} className="border-2 border-background">
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
      </CardHeader>
      <CardFooter>
        <Link href={`/groups/${group.uuid}`} className="w-full">
          <Button className="w-full rounded-lg" variant="default">
            Open Group
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

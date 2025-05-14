import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface GroupCardProps {
  id: string;
  name: string;
}

export function GroupCard({ id, name }: GroupCardProps) {
  // Dummy Flow addresses for now
  const dummyMembers = [
    "0x1234567890abcdef",
    "0xabcdef1234567890",
    "0x9876543210fedcba"
  ];

  // Dummy amount for now
  const dummyAmount = 1200.00;
  const formattedAmount = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(dummyAmount);
  
  // Dummy you owe amount for now
  const dummyYouOwe = 150.00;
  const formattedYouOwe = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(dummyYouOwe);

  return (
    <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <div className="text-2xl font-bold mt-1">{formattedAmount}</div>
        <div className="text-sm text-muted-foreground mb-2">You owe: {formattedYouOwe}</div>
        <div className="flex -space-x-2 mt-2">
          {dummyMembers.map((address, index) => (
            <Avatar key={address} className="border-2 border-background">
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
      </CardHeader>
      <CardFooter>
        <Link href={`/groups/${id}`} className="w-full">
          <Button className="w-full rounded-lg" variant="default">
            Open Group
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
} 
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";

interface GroupCardProps {
  name: string;
}

export function GroupCard({ name }: GroupCardProps) {
  // Dummy Flow addresses for now
  const dummyMembers = [
    "0x1234567890abcdef",
    "0xabcdef1234567890",
    "0x9876543210fedcba"
  ];

  return (
    <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
      <CardHeader>
        <CardTitle>{name}</CardTitle>
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
    </Card>
  );
} 
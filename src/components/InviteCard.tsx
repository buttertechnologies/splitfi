import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { useRouter } from "next/navigation";

interface InviteCardProps {
  id: string;
  groupName: string;
  invitedBy: string;
  members: string[];
}

export function InviteCard({ id, groupName, invitedBy, members }: InviteCardProps) {
  const router = useRouter();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{groupName}</CardTitle>
        <CardDescription>Invited by {invitedBy.slice(0, 6)}...{invitedBy.slice(-4)}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex -space-x-2">
          {members.map((address) => (
            <Avatar key={address} className="border-2 border-background">
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full"
          onClick={() => router.push(`/join/${id}`)}
        >
          View Invite
        </Button>
      </CardFooter>
    </Card>
  );
} 
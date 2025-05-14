"use client";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";

const dummyGroup = {
  name: "Weekend Trip to Vegas",
  members: [
    "0x1234567890abcdef",
    "0xabcdef1234567890",
    "0x9876543210fedcba",
  ],
};

export default function JoinGroupPage() {
  const params = useParams();
  const { id } = params;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 max-w-md w-full flex flex-col items-center gap-6">
        <h1 className="text-2xl font-bold text-center">You've been invited to a group!</h1>
        <div className="w-full text-center">
          <div className="text-lg font-semibold mb-1">{dummyGroup.name}</div>
          <div className="text-xs text-muted-foreground mb-4">Group ID: {typeof id === 'string' ? id : Array.isArray(id) ? id[0] : ''}</div>
        </div>
        <div className="w-full">
          <div className="text-sm font-medium mb-2">Members</div>
          <div className="flex flex-col gap-2">
            {dummyGroup.members.map((address) => (
              <div key={address} className="flex items-center gap-3 p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <span className="font-mono text-xs">{address}</span>
              </div>
            ))}
          </div>
        </div>
        <Button className="w-full mt-4" size="lg">
          Join Group
        </Button>
      </div>
    </div>
  );
} 
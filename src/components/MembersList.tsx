import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";

interface Member {
  address: string;
  status?: "pending" | "active";
}

interface MembersListProps {
  members: (string | Member)[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  footer?: ReactNode;
}

export function MembersList({
  members,
  isOpen,
  onOpenChange,
  title = "Group Members",
  description = "List of all members in this group",
  footer,
}: MembersListProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {members.map((member) => {
            const address = typeof member === "string" ? member : member.address;
            const status = typeof member === "string" ? "active" : member.status;
            
            return (
              <div key={address} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="font-mono text-sm">{address}</div>
                </div>
                {status === "pending" && (
                  <Badge variant="secondary">Pending Invite</Badge>
                )}
              </div>
            );
          })}
        </div>
        {footer}
      </DialogContent>
    </Dialog>
  );
} 
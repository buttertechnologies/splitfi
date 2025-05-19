import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { X, QrCodeIcon, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import dynamic from "next/dynamic";

interface GroupFormProps {
  onSubmit: (groupName: string, members: string[]) => void;
  onCancel: () => void;
  initialName?: string;
  initialMembers?: string[];
  groupId?: string;
}

export function GroupForm({
  onSubmit,
  onCancel,
  initialName = "",
  initialMembers = [],
  groupId,
}: GroupFormProps) {
  const [groupName, setGroupName] = useState(initialName);
  const [members, setMembers] = useState<string[]>(initialMembers);
  const [newMemberAddress, setNewMemberAddress] = useState("");
  const [qrOpen, setQrOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const QRCode = dynamic(() => import("react-qr-code"), { ssr: false });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(groupName, members);
    setGroupName("");
    setMembers([]);
  };

  const addMember = () => {
    if (newMemberAddress && !members.includes(newMemberAddress)) {
      setMembers([...members, newMemberAddress]);
      setNewMemberAddress("");
    }
  };

  const removeMember = (address: string) => {
    setMembers(members.filter((member) => member !== address));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addMember();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="groupName" className="text-right">
            Group Name
          </Label>
          <Input
            id="groupName"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="e.g., Weekend Trip to Vegas"
            className="col-span-3"
          />
        </div>

        {groupId && (
          <>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="memberAddress" className="text-right">
                Add Member
              </Label>
              <div className="col-span-3 flex gap-2">
                <Input
                  id="memberAddress"
                  value={newMemberAddress}
                  onChange={(e) => setNewMemberAddress(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Flow address (0x...)"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addMember}
                  disabled={!newMemberAddress}
                >
                  Add
                </Button>
              </div>
            </div>
            {/* Divider and Add via QR section */}
            <div className="grid grid-cols-4 items-center gap-4 mt-2">
              <div />
              <div className="col-span-3 flex flex-col items-center w-full">
                <div className="flex items-center w-full mb-2">
                  <div className="flex-grow border-t border-gray-200" />
                  <span className="mx-3 text-xs text-muted-foreground">
                    or invite via QR or link
                  </span>
                  <div className="flex-grow border-t border-gray-200" />
                </div>
                <Dialog open={qrOpen} onOpenChange={setQrOpen}>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setQrOpen(true)}
                      className="flex items-center gap-2 w-full justify-center"
                    >
                      <QrCodeIcon className="mr-1" />
                      Add via QR
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="flex flex-col items-center gap-4">
                    <DialogTitle>Group QR Code</DialogTitle>
                    <div className="bg-white p-4 rounded-lg shadow">
                      <QRCode
                        value={groupId}
                        size={200}
                        bgColor="#FFFFFF"
                        fgColor="#000000"
                        style={{ height: "auto", maxWidth: "100%", width: "200px" }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground text-center max-w-xs">
                      Scan this code to join the group
                    </div>
                  </DialogContent>
                </Dialog>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={async () => {
                    const inviteUrl = `${window.location.origin}/invite/${groupId}`;
                    try {
                      await navigator.clipboard.writeText(inviteUrl);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    } catch (e) {
                      // handle error
                    }
                  }}
                  className="flex items-center gap-2 w-full justify-center mt-2"
                >
                  {copied ? (
                    <>
                      <Check className="mr-1 h-4 w-4 text-green-600" />
                      Copied!
                    </>
                  ) : (
                    <>Copy Invite Link</>
                  )}
                </Button>
              </div>
            </div>

            {members.length > 0 && (
              <div className="grid grid-cols-4 gap-4">
                <Label className="text-right">Members</Label>
                <div className="col-span-3 space-y-2">
                  {members.map((address) => (
                    <div
                      key={address}
                      className="flex items-center justify-between p-2 bg-gray-100 rounded-md"
                    >
                      <span className="text-sm font-mono">{address}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMember(address)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!groupName}>
          {initialName ? "Save Changes" : "Create Group"}
        </Button>
      </div>
    </form>
  );
}

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { X } from "lucide-react";

interface GroupFormProps {
  onSubmit: (groupName: string, members: string[]) => void;
  onCancel: () => void;
  initialName?: string;
  initialMembers?: string[];
}

export function GroupForm({ onSubmit, onCancel, initialName = "", initialMembers = [] }: GroupFormProps) {
  const [groupName, setGroupName] = useState(initialName);
  const [members, setMembers] = useState<string[]>(initialMembers);
  const [newMemberAddress, setNewMemberAddress] = useState("");

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
    setMembers(members.filter(member => member !== address));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
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
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          type="submit"
          disabled={!groupName || members.length === 0}
        >
          {initialName ? "Save Changes" : "Create Group"}
        </Button>
      </div>
    </form>
  );
} 
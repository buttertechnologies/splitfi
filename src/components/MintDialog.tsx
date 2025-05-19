import React from "react";
import { Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useMintMockTokens } from "@/hooks/useMintMockTokens";

interface MintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMintComplete: (txId: string) => void;
  address: string;
}

export function MintDialog({
  open,
  onOpenChange,
  onMintComplete,
  address,
}: MintDialogProps) {
  const { mintMockTokensAsync } = useMintMockTokens();

  const handleMint = async () => {
    try {
      const txId = await mintMockTokensAsync({ address });
      onMintComplete(txId);
    } catch (err) {
      console.error("Failed to mint tokens:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col items-center gap-4">
        <DialogHeader>
          <DialogTitle>Zero Balance Detected</DialogTitle>
          <DialogDescription>
            You need some test tokens to use this application. Would you like to
            mint some dummy tokens?
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 w-full">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button variant="default" className="flex-1" onClick={handleMint}>
            <Coins className="mr-2 h-4 w-4" />
            Mint Tokens
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

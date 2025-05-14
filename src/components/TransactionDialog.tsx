import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2, CheckCircle2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  txId?: string;
  timeoutMs?: number;
  onSuccess?: () => void;
  pendingTitle?: string;
  pendingDescription?: string;
  successTitle?: string;
  successDescription?: string;
}

export const TransactionDialog: React.FC<TransactionDialogProps> = ({
  open,
  onOpenChange,
  txId,
  timeoutMs = 1500,
  onSuccess,
  pendingTitle,
  pendingDescription,
  successTitle,
  successDescription,
}) => {
  const [status, setStatus] = useState<'pending' | 'success'>('pending');
  const explorerUrl = txId
    ? `https://testnet.flowscan.org/transaction/${txId}`
    : undefined;

  useEffect(() => {
    if (open) {
      setStatus('pending');
      const timer = setTimeout(() => {
        setStatus('success');
        if (onSuccess) onSuccess();
      }, timeoutMs);
      return () => clearTimeout(timer);
    }
  }, [open, timeoutMs, onSuccess]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col items-center gap-4 py-8 animate-fade-in">
        <DialogHeader>
          <DialogTitle className="flex flex-col items-center gap-2">
            {status === "pending" ? (
              <Loader2 className="animate-spin text-blue-500" size={48} />
            ) : (
              <CheckCircle2 className="text-green-500 animate-pop" size={48} />
            )}
            {status === "pending"
              ? pendingTitle || "Transaction Pending"
              : successTitle || "Transaction Successful"}
          </DialogTitle>
          <DialogDescription className="text-center mt-2">
            {status === "pending"
              ? pendingDescription || "Your transaction is being processed. Please wait..."
              : successDescription || "Your transaction was successful!"}
          </DialogDescription>
        </DialogHeader>
        {status === "success" && explorerUrl && (
          <Button
            asChild
            variant="link"
            className="mt-2 flex items-center gap-1"
          >
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on Block Explorer <ExternalLink size={16} />
            </a>
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() => onOpenChange(false)}
          className="mt-4"
        >
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}; 
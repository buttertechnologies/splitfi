import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TransactionLink } from "@/components/TransactionLink";
import { useFlowTransaction } from "@onflow/kit";

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  txId?: string;
  onSuccess?: () => void;
  pendingTitle?: string;
  pendingDescription?: string;
  successTitle?: string;
  successDescription?: string;
  closeOnSuccess?: boolean;
}

export const TransactionDialog: React.FC<TransactionDialogProps> = ({
  open,
  onOpenChange,
  txId,
  onSuccess,
  pendingTitle,
  pendingDescription,
  successTitle,
  successDescription,
  closeOnSuccess,
}) => {
  const { transactionStatus } = useFlowTransaction({ id: txId || "" });
  const isSuccess =
    typeof transactionStatus?.status === "number" &&
    transactionStatus.status >= 3;

  useEffect(() => {
    if (isSuccess) {
      if (onSuccess) onSuccess();
      if (closeOnSuccess) onOpenChange(false);
    }
  }, [isSuccess, onSuccess, closeOnSuccess, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col items-center gap-4 py-8 animate-fade-in">
        <DialogHeader>
          <DialogTitle className="flex flex-col items-center gap-2">
            {!isSuccess ? (
              <Loader2 className="animate-spin text-blue-500" size={48} />
            ) : (
              <CheckCircle2 className="text-green-500 animate-pop" size={48} />
            )}
            {!isSuccess
              ? pendingTitle || "Transaction Pending"
              : successTitle || "Transaction Successful"}
          </DialogTitle>
          <DialogDescription className="text-center mt-2">
            {!isSuccess
              ? pendingDescription ||
                "Your transaction is being processed. Please wait..."
              : successDescription || "Your transaction was successful!"}
          </DialogDescription>
        </DialogHeader>
        {isSuccess && txId && <TransactionLink txId={txId} />}
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

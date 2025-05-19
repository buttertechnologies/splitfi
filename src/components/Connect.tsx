"use client";

import React, { useState, useEffect } from "react";
import { useCurrentFlowUser } from "@onflow/kit";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Copy, LogOut, Check, Coins } from "lucide-react";
import { useUsdfBalance } from "@/hooks/useUsdfBalance";
import { useMintMockTokens } from "@/hooks/useMintMockTokens";
import { MintDialog } from "./MintDialog";
import { TransactionDialog } from "./TransactionDialog";

export function Connect({
  onConnect,
  onDisconnect,
}: {
  onConnect?: () => void;
  onDisconnect?: () => void;
}) {
  const { user, authenticate, unauthenticate } = useCurrentFlowUser();
  const { data: usdfBalance, isSuccess: usdfBalanceIsSuccess, refetch: refetchBalance } = useUsdfBalance(
    { address: user.addr }
  );
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showMintDialog, setShowMintDialog] = useState(false);
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [txId, setTxId] = useState<string>();
  const { mintMockTokensAsync } = useMintMockTokens();

  useEffect(() => {
    if (
      user.loggedIn &&
      process.env.NEXT_PUBLIC_FLOW_NETWORK !== "mainnet" &&
      (!usdfBalance || Number(usdfBalance) === 0) &&
      usdfBalanceIsSuccess
    ) {
      setShowMintDialog(true);
    }
  }, [user.loggedIn, usdfBalance]);

  const displayAddress =
    user.loggedIn && user.addr
      ? `${user.addr.slice(0, 6)}...${user.addr.slice(-4)}`
      : "Connect Wallet";

  const handleButtonClick = async () => {
    if (user.loggedIn) {
      setOpen(true);
    } else {
      await authenticate();
      if (onConnect) onConnect();
    }
  };

  const handleCopy = async () => {
    if (user.addr) {
      await navigator.clipboard.writeText(user.addr);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleDisconnect = () => {
    unauthenticate();
    setOpen(false);
    if (onDisconnect) onDisconnect();
  };

  const handleMintComplete = (txId: string) => {
    setShowMintDialog(false);
    setTxId(txId);
    setIsTransactionDialogOpen(true);
  };

  const handleMint = async () => {
    try {
      const txId = await mintMockTokensAsync({ address: user.addr });
      setTxId(txId);
      setIsTransactionDialogOpen(true);
    } catch (err) {
      console.error("Failed to mint tokens:", err);
    }
  };

  const handleTransactionSuccess = () => {
    refetchBalance();
    setOpen(true);
  };

  return (
    <>
      <Button
        onClick={handleButtonClick}
        variant={user.loggedIn ? "outline" : "default"}
        className="px-2"
      >
        {user.loggedIn ? (
          <span className="flex items-center gap-2">
            <span className="font-semibold text-base flex items-center hidden sm:inline-flex">
              {Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(usdfBalance ? Number(usdfBalance) : 0)}
            </span>
            <span className="w-px h-6 bg-gray-200 mx-1 hidden sm:inline-flex" />
            <span className="flex items-center gap-1 text-sm sm:text-base">
              {displayAddress}
            </span>
          </span>
        ) : (
          displayAddress
        )}
      </Button>
      {user.loggedIn && (
        <>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="flex flex-col items-center gap-4">
              <DialogHeader className="flex flex-col items-center">
                <Avatar className="w-16 h-16 mb-2">
                  <AvatarFallback>
                    <User className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <DialogTitle className="text-center text-lg font-semibold mb-0">
                  {displayAddress}
                </DialogTitle>
                <div className="text-center text-sm text-gray-500 -mt-1">
                  {Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(usdfBalance ? Number(usdfBalance) : 0)}
                </div>
              </DialogHeader>
              <div className="flex gap-2 w-full">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleCopy}
                  disabled={copied}
                >
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Address
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleDisconnect}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Disconnect
                </Button>
              </div>
              <div className="flex gap-2 w-full">
                {process.env.NEXT_PUBLIC_FLOW_NETWORK !== "mainnet" && (
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleMint}
                  >
                    <Coins className="mr-2 h-4 w-4" />
                    Mint Mock Tokens
                  </Button>
                )}
              </div>
              <DialogClose asChild>
                <button className="absolute top-4 right-4" aria-label="Close" />
              </DialogClose>
            </DialogContent>
          </Dialog>
          <MintDialog
            open={showMintDialog}
            onOpenChange={setShowMintDialog}
            onMintComplete={handleMintComplete}
            address={user.addr || ""}
          />
          <TransactionDialog
            open={isTransactionDialogOpen}
            onOpenChange={setIsTransactionDialogOpen}
            txId={txId}
            pendingTitle="Minting Tokens"
            pendingDescription="Your tokens are being minted. Please wait..."
            successTitle="Tokens Minted!"
            successDescription="Your tokens have been successfully minted."
            onSuccess={handleTransactionSuccess}
            closeOnSuccess={true}
          />
        </>
      )}
    </>
  );
}

"use client";

import React, { useState } from "react";
import { useCurrentFlowUser } from "@onflow/kit";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Copy, LogOut, Check } from "lucide-react";

export function Connect() {
  const { user, authenticate, unauthenticate } = useCurrentFlowUser();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const displayAddress =
    user.loggedIn && user.addr
      ? `${user.addr.slice(0, 6)}...${user.addr.slice(-4)}`
      : "Connect Wallet";

  const handleButtonClick = () => {
    if (user.loggedIn) {
      setOpen(true);
    } else {
      authenticate();
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
  };

  return (
    <>
      <Button
        onClick={handleButtonClick}
        variant={user.loggedIn ? "outline" : "default"}
      >
        {displayAddress}
      </Button>
      {user.loggedIn && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="flex flex-col items-center gap-4">
            <DialogHeader className="flex flex-col items-center">
              <Avatar className="w-16 h-16 mb-2">
                <AvatarFallback>
                  <User className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <DialogTitle className="text-center text-lg font-semibold">
                {displayAddress}
              </DialogTitle>
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
            <DialogClose asChild>
              <button className="absolute top-4 right-4" aria-label="Close" />
            </DialogClose>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

"use client";

import React from "react";
import { useCurrentFlowUser } from "@onflow/kit";
import { Button } from "@/components/ui/button";

export function Connect() {
  const { user, authenticate, unauthenticate } = useCurrentFlowUser();

  const displayAddress =
    user.loggedIn && user.addr
      ? `${user.addr.slice(0, 6)}...${user.addr.slice(-4)}`
      : "Connect Wallet";

  return (
    <Button
      onClick={user.loggedIn ? unauthenticate : authenticate}
      variant={user.loggedIn ? "outline" : "default"}
    >
      {displayAddress}
    </Button>
  );
}

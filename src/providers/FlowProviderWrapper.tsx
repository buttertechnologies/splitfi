"use client";

import React from "react";
import { FlowProvider, FlowNetwork } from "@onflow/kit";
import flowJSON from "../../flow.json";

const flowNetwork = process.env.NEXT_PUBLIC_FLOW_NETWORK as FlowNetwork;

if (flowNetwork !== "mainnet") {
  console.info("App is running on:", flowNetwork);
}

const ACCESS_NODE_URL = {
  mainnet: "https://rest-mainnet.onflow.org",
  testnet: "https://rest-testnet.onflow.org",
  emulator: "http://localhost:8888",
}

const DISCOVERY_URL = {
  mainnet: "https://fcl-discovery.onflow.org/authn",
  testnet: "https://fcl-discovery.onflow.org/testnet/authn",
  emulator: "http://localhost:8701/fcl/authn",
}

export default function FlowProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FlowProvider
      config={{
        flowNetwork,
        accessNodeUrl: ACCESS_NODE_URL[flowNetwork],
        discoveryWallet: DISCOVERY_URL[flowNetwork],
        appDetailTitle: "Divy",
        appDetailDescription:
          "Split group expenses on‑chain—track, share, and settle in crypto instantly and transparently.",
      }}
      flowJson={flowJSON}
    >
      {children}
    </FlowProvider>
  );
}

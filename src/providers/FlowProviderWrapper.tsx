"use client";

import React from "react";
import { FlowProvider, FlowNetwork } from "@onflow/kit";
import flowJSON from "../../flow.json";

const flowNetwork = process.env.NEXT_PUBLIC_FLOW_NETWORK as FlowNetwork;

if (flowNetwork !== "mainnet") {
  console.info("App is running on:", flowNetwork);
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
        accessNodeUrl: "https://rest-mainnet.onflow.org",
        discoveryWallet: `https://fcl-discovery.onflow.org/${flowNetwork}/authn`,
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

import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { FlowNetwork } from "@onflow/kit";

interface TransactionLinkProps {
  txId: string;
}

const BLOCK_EXPLORER_URL = {
  mainnet: "https://www.flowscan.io",
  testnet: "https://testnet.flowscan.org",
  emulator: "https://testnet.flowscan.org",
};

export function TransactionLink({ txId }: TransactionLinkProps) {
  const flowNetwork = process.env.NEXT_PUBLIC_FLOW_NETWORK as FlowNetwork;
  const explorerUrl = `${BLOCK_EXPLORER_URL[flowNetwork]}/tx/${txId}`;

  return (
    <Button asChild variant="link" className="mt-2 flex items-center gap-1">
      <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
        View on Block Explorer <ExternalLink size={16} />
      </a>
    </Button>
  );
}

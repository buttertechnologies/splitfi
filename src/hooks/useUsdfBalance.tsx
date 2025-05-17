import { useFlowQuery } from "@onflow/kit";
import { UseQueryResult } from "@tanstack/react-query";
import GetUsdfBalance from "../../cadence/scripts/get-usdf-balance.cdc";

export function useUsdfBalance(address?: string) {
  return useFlowQuery({
    cadence: GetUsdfBalance,
    args: (arg, t) => [
      address ? arg(address, t.Address) : arg(null, t.Optional(t.Address)),
    ],
    query: {
      enabled: !!address,
    },
  }) as UseQueryResult<string, Error>;
}

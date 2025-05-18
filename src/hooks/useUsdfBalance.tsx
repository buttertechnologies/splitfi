import { useFlowQuery } from "@onflow/kit";
import { UseQueryResult } from "@tanstack/react-query";
import GetUsdfBalance from "../../cadence/scripts/get-usdf-balance.cdc";

type UseUsdfBalanceParams = {
  address?: string;
};

export function useUsdfBalance({ address }: UseUsdfBalanceParams) {
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

import { useFlowQuery } from "@onflow/kit";
import { UseQueryResult } from "@tanstack/react-query";
import { GroupSummary } from "@/types/models";
import GetUsdfBalance from "../../cadence/scripts/get-usdf-balance.cdc";

export function useUserGroups(address?: string) {
  return useFlowQuery({
    cadence: GetUsdfBalance,
    args: (arg, t) => [
      address ? arg(address, t.Address) : arg(null, t.Optional(t.Address)),
    ],
    query: {
      enabled: !!address,
    },
  }) as UseQueryResult<GroupSummary[], Error>;
}

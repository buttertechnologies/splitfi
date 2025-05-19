import { useFlowQuery } from "@onflow/kit";
import { UseQueryResult } from "@tanstack/react-query";
import GetMoneyOwed from "../../cadence/scripts/get-money-owed.cdc";

type UseUserBalanceByGroupIdParams = {
  address?: string;
  groupId?: string;
};

export function useUserBalanceByGroupId({
  address,
  groupId,
}: UseUserBalanceByGroupIdParams) {
  return useFlowQuery({
    cadence: GetMoneyOwed,
    args: (arg, t) => [
      groupId ? arg(groupId, t.UInt64) : arg(null, t.Optional(t.UInt64)),
      address ? arg(address, t.Address) : arg(null, t.Optional(t.Address)),
    ],
    query: {
      enabled: !!address && !!groupId,
      queryKey: ["getMoneyOwed", address, groupId],
    } as any,
  }) as UseQueryResult<string, Error>;
}

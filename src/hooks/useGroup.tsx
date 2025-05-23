import { useFlowQuery } from "@onflow/kit";
import { UseQueryResult } from "@tanstack/react-query";
import { GroupSummary } from "@/types/models";
import GetGroupSummaryById from "../../cadence/scripts/get-group-summary-by-id.cdc";

type UseGroupParams = {
  id?: string;
};

export function useGroup({ id }: UseGroupParams) {
  return useFlowQuery({
    cadence: GetGroupSummaryById,
    args: (arg, t) => [id ? arg(id, t.UInt64) : arg(false, t.Bool)],
    query: {
      enabled: !!id,
      refetchInterval: 3000,
    },
  }) as UseQueryResult<GroupSummary, Error>;
}

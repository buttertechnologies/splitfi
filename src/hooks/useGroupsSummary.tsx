import { useFlowQuery } from "@onflow/kit";
import GetGroupSummary from "../../cadence/scripts/get-group-summary.cdc";
import { UseQueryResult } from "@tanstack/react-query";
import { GroupSummary } from "@/types/models";

export function useGroupsSummary(address?: string) {
    return useFlowQuery({
        cadence: GetGroupSummary,
        args: (arg, t) => [
            address ? arg(address, t.Address) : arg(null, t.Optional(t.Address))
        ],
        query: {
            enabled: !!address,
        }
    }) as UseQueryResult<GroupSummary[], Error>;
}
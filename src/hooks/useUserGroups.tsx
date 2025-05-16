import { useFlowQuery } from "@onflow/kit";
import { UseQueryResult } from "@tanstack/react-query";
import { GroupSummary } from "@/types/models";
import GetUserGroupSummaries from "../../cadence/scripts/get-user-group-summaries.cdc";

export function useUserGroups(address?: string) {
    return useFlowQuery({
        cadence: GetUserGroupSummaries,
        args: (arg, t) => [
            address ? arg(address, t.Address) : arg(null, t.Optional(t.Address))
        ],
        query: {
            enabled: !!address,
        }
    }) as UseQueryResult<GroupSummary[], Error>;
}
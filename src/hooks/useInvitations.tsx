import { useFlowQuery } from "@onflow/kit";
import { UseQueryResult } from "@tanstack/react-query";
import { InvitationList } from "@/types/models";
import GetUserInvitations from "../../cadence/scripts/get-user-invitations.cdc";

type UseInvitationsParams = {
  address?: string;
};

export function useInvitations({ address }: UseInvitationsParams) {
  return useFlowQuery({
    cadence: GetUserInvitations,
    args: (arg, t) => [
      address ? arg(address, t.Address) : arg(null, t.Optional(t.Address)),
    ],
    query: {
      enabled: !!address,
    },
  }) as UseQueryResult<InvitationList, Error>;
}

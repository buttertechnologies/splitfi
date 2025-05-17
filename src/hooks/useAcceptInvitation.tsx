import { useFlowMutate } from "@onflow/kit";
import { InferMutationVariables } from "@/types/query";
import CLAIM_INVITATION from "../../cadence/transactions/claim-invitation.cdc";

type MutationVariables = InferMutationVariables<
  ReturnType<typeof useFlowMutate>
>;

type UseAcceptInvitationMutateParams = {
  groupId: string;
};

export function useAcceptInvitation() {
  const { mutate, mutateAsync, ...mutateResult } = useFlowMutate();

  const getMutation = (
    params: UseAcceptInvitationMutateParams
  ): MutationVariables => {
    return {
      cadence: CLAIM_INVITATION,
      args: (arg, t) => [arg(params.groupId, t.UInt64)],
    };
  };

  return {
    ...mutateResult,
    acceptInvitation: (params: UseAcceptInvitationMutateParams) => {
      return mutate(getMutation(params));
    },
    acceptInvitationAsync: (params: UseAcceptInvitationMutateParams) => {
      return mutateAsync(getMutation(params));
    },
  };
}

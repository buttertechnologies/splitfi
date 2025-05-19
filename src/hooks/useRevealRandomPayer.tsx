import { useFlowMutate } from "@onflow/kit";
import REVEAL_RANDOM_PAYER from "../../cadence/transactions/reveal-random-payer.cdc";
import { InferMutationVariables } from "@/types/query";

type MutationVariables = InferMutationVariables<
  ReturnType<typeof useFlowMutate>
>;

type UseRevealRandomPayerMutateParams = {
  groupUuid: string;
  memberAddress: string;
  expenseUuid: string;
};

export function useRevealRandomPayer() {
  const { mutate, mutateAsync, ...mutateResult } = useFlowMutate();

  const getMutation = (
    params: UseRevealRandomPayerMutateParams
  ): MutationVariables => {
    return {
      cadence: REVEAL_RANDOM_PAYER,
      args: (arg, t) => [
        arg(params.groupUuid, t.UInt64),
        arg(params.memberAddress, t.Address),
        arg(params.expenseUuid, t.UInt64),
      ],
    };
  };

  return {
    ...mutateResult,
    revealRandomPayer: (params: UseRevealRandomPayerMutateParams) => {
      return mutate(getMutation(params));
    },
    revealRandomPayerAsync: (params: UseRevealRandomPayerMutateParams) => {
      return mutateAsync(getMutation(params));
    },
  };
}

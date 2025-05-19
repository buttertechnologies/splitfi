import { useFlowMutate } from "@onflow/kit";
import CREATE_GROUP from "../../cadence/mocks/mint-mock-tokens.cdc";
import { InferMutationVariables } from "@/types/query";

type MutationVariables = InferMutationVariables<
  ReturnType<typeof useFlowMutate>
>;

type UseMintMockTokensMutateParams = {};

export function useMintMockTokens() {
  const { mutate, mutateAsync, ...mutateResult } = useFlowMutate();

  const getMutation = (_: UseMintMockTokensMutateParams): MutationVariables => {
    return {
      cadence: CREATE_GROUP,
      args: (arg, t) => [],
    };
  };

  return {
    ...mutateResult,
    mintMockTokens: (params: UseMintMockTokensMutateParams) => {
      return mutate(getMutation(params));
    },
    mintMockTokensAsync: (params: UseMintMockTokensMutateParams) => {
      return mutateAsync(getMutation(params));
    },
  };
}

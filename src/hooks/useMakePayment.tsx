import { useFlowMutate } from "@onflow/kit";
import { InferMutationVariables } from "@/types/query";
import MAKE_PAYMENT from "../../cadence/transactions/make-payment.cdc";

type MutationVariables = InferMutationVariables<
  ReturnType<typeof useFlowMutate>
>;

type UseMakePaymentMutateArgs = {
  groupId: string;
  maxAmount: number;
};

export function useMakePayment() {
  const { mutate, mutateAsync, ...mutateResult } = useFlowMutate();

  const getMutation = (params: UseMakePaymentMutateArgs): MutationVariables => {
    return {
      cadence: MAKE_PAYMENT,
      args: (arg, t) => [
        arg(params.groupId, t.UInt64),
        arg(params.maxAmount.toFixed(8), t.UFix64),
      ],
    };
  };

  return {
    ...mutateResult,
    makePayment: (params: UseMakePaymentMutateArgs) => {
      return mutate(getMutation(params));
    },
    makePaymentAsync: (params: UseMakePaymentMutateArgs) => {
      return mutateAsync(getMutation(params));
    },
  };
}

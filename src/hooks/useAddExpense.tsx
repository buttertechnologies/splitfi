import { useFlowMutate } from "@onflow/kit";
import ADD_EXPENSE from "../../cadence/transactions/add-expense.cdc";
import { InferMutationVariables } from "@/types/query";

type MutationVariables = InferMutationVariables<
  ReturnType<typeof useFlowMutate>
>;

type UseAddExpenseMutateParams = {
  groupId: string;
  amount: number;
  description: string;
  timestamp: Date;
  debtors: {
    address: string;
    fraction: number;
  }[];
};

export function useAddExpense() {
  const { mutate, mutateAsync, ...mutateResult } = useFlowMutate();

  const getMutation = (
    params: UseAddExpenseMutateParams
  ): MutationVariables => {
    return {
      cadence: ADD_EXPENSE,
      args: (arg, t) => [
        arg(params.groupId, t.UInt64),
        arg(params.amount.toFixed(8), t.UFix64),
        arg(params.description, t.String),
        arg((params.timestamp.getTime() / 1000).toFixed(3), t.UFix64),
        arg(
          params.debtors.map((debtor) => ({
            key: debtor.address,
            value: debtor.fraction.toFixed(8),
          })),
          t.Dictionary({ key: t.Address, value: t.UFix64 })
        ),
      ],
    };
  };

  return {
    ...mutateResult,
    addExpense: (params: UseAddExpenseMutateParams) => {
      return mutate(getMutation(params));
    },
    addExpenseAsync: (params: UseAddExpenseMutateParams) => {
      return mutateAsync(getMutation(params));
    },
  };
}

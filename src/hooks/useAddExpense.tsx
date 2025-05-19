import { useFlowMutate } from "@onflow/kit";
import { arg, sansPrefix, t } from "@onflow/fcl";
import ADD_FIXED_EXPENSE from "../../cadence/transactions/add-fixed-expense.cdc";
import ADD_RANDOM_EXPENSE from "../../cadence/transactions/add-random-expense.cdc";
import { InferMutationVariables } from "@/types/query";
import { getSplitFiAddress } from "@/lib/utils";

type MutationVariables = InferMutationVariables<
  ReturnType<typeof useFlowMutate>
>;

type UseAddExpenseMutateBaseParams = {
  groupId: string;
  amount: number;
  description: string;
  timestamp: Date;
};

type UseAddExpenseMutatePercentageParams = UseAddExpenseMutateBaseParams & {
  type: "percentage";
  debtors: {
    address: string;
    fraction: number;
  }[];
};

type UseAddExpenseMutateFixedParams = UseAddExpenseMutateBaseParams & {
  type: "fixed";
  debtors: {
    address: string;
    amount: number;
  }[];
};

type UseAddExpenseMutateRandomParams = UseAddExpenseMutateBaseParams & {
  type: "random";
  debtors: string[];
};

type UseAddExpenseMutateParams =
  | UseAddExpenseMutatePercentageParams
  | UseAddExpenseMutateFixedParams
  | UseAddExpenseMutateRandomParams;

export function useAddExpense() {
  const { mutate, mutateAsync, ...mutateResult } = useFlowMutate();
  const getMutation = async (
    params: UseAddExpenseMutateParams
  ): Promise<MutationVariables> => {
    if (params.type === "fixed") {
      return {
        cadence: ADD_FIXED_EXPENSE,
        args: (arg, t) => [
          arg(params.groupId, t.UInt64),
          arg(params.amount.toFixed(8), t.UFix64),
          arg(
            params.debtors.map((x) => ({
              key: x.address,
              value: x.amount.toFixed(8),
            })),
            t.Dictionary({ key: t.Address, value: t.UFix64 })
          ),
          arg(params.description, t.String),
          arg((params.timestamp.getTime() / 1000).toFixed(3), t.UFix64),
        ],
      };
    } else if (params.type === "random") {
      return {
        cadence: ADD_RANDOM_EXPENSE,
        args: (arg, t) => [
          arg(params.groupId, t.UInt64),
          arg(params.amount.toFixed(8), t.UFix64),
          arg(params.debtors, t.Array(t.Address)),
          arg(params.description, t.String),
          arg((params.timestamp.getTime() / 1000).toFixed(3), t.UFix64),
        ],
      };
    } else {
      throw new Error("Not implemented");
    }
  };

  return {
    ...mutateResult,
    addExpense: (params: UseAddExpenseMutateParams) => {
      getMutation(params).then((mutation) => {
        return mutate(mutation);
      });
    },
    addExpenseAsync: async (params: UseAddExpenseMutateParams) => {
      return mutateAsync(await getMutation(params));
    },
  };
}

import { useFlowMutate } from "@onflow/kit";
import { arg, sansPrefix, t } from "@onflow/fcl";
import ADD_EXPENSE from "../../cadence/transactions/add-expense.cdc";
import { InferMutationVariables } from "@/types/query";
import { getDivyAddress } from "@/lib/utils";

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

type UseAddExpenseMutateParams =
  | UseAddExpenseMutatePercentageParams
  | UseAddExpenseMutateFixedParams;

export function useAddExpense() {
  const { mutate, mutateAsync, ...mutateResult } = useFlowMutate();
  const getMutation = async (
    params: UseAddExpenseMutateParams
  ): Promise<MutationVariables> => {
    let debtAllocation;
    if (params.type === "percentage") {
      debtAllocation = arg(
        {
          fields: [
            { name: "amount", value: params.amount.toFixed(8) },
            {
              name: "debtors",
              value: params.debtors.map((x) => ({
                key: x.address,
                value: x.fraction.toFixed(8),
              })),
            },
          ],
        },
        t.Struct(
          `A.${sansPrefix(await getDivyAddress())}.Divy.FixedDebtAllocation`,
          [
            { value: t.UFix64 },
            { value: t.Dictionary({ key: t.Address, value: t.UFix64 }) },
          ] as any
        )
      );
    } else {
      debtAllocation = arg(
        {
          fields: [
            { name: "amount", value: params.amount.toFixed(8) },
            {
              name: "debtors",
              value: params.debtors.map((x) => ({
                key: x.address,
                value: x.amount.toFixed(8),
              })),
            },
          ],
        },
        t.Struct(
          `A.${sansPrefix(await getDivyAddress())}.Divy.FixedDebtAllocation`,
          [
            { value: t.UFix64 },
            { value: t.Dictionary({ key: t.Address, value: t.UFix64 }) },
          ] as any
        )
      );
    }

    return {
      cadence: ADD_EXPENSE,
      args: (arg, t) => [
        arg(params.groupId, t.UInt64),
        debtAllocation,
        arg(params.description, t.String),
        arg((params.timestamp.getTime() / 1000).toFixed(3), t.UFix64),
      ],
    };
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

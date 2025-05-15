import { useFlowMutate } from "@onflow/kit";
import CREATE_GROUP from "../../cadence/transactions/create-group.cdc";
import { InferMutationVariables } from "@/types/query";

type MutationVariables = InferMutationVariables<ReturnType<typeof useFlowMutate>>;

type UseCreateGroupMutateParams = {
    name: string;
    invitees: string[];
}

export function useCreateGroup() {
    const { mutate, mutateAsync, ...mutateResult } = useFlowMutate()

    const getMutation = (params: UseCreateGroupMutateParams): MutationVariables => {
        return {
            cadence: CREATE_GROUP,
            args: (arg, t) => [
                arg(params.name, t.String),
                arg(params.invitees, t.Array(t.Address)),
            ],
        }
    }

    return {
        ...mutateResult,
        createGroup: (params: UseCreateGroupMutateParams) => {
            return mutate(getMutation(params))
        },
        createGroupAsync: (params: UseCreateGroupMutateParams) => {
            return mutateAsync(getMutation(params))
        },
    }
}
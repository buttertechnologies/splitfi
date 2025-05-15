import { UseMutationResult } from "@tanstack/react-query";

export type InferMutationVariables<T> = T extends UseMutationResult<unknown, unknown, infer V> ? V : never;
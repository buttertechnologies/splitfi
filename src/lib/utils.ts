import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { config } from "@onflow/fcl";

const CONTRACT_NAME = "Divy";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDivyAddress(): Promise<string> {
  const address = config().get<string>(`system.contracts.${CONTRACT_NAME}`);
  if (!address) {
    throw new Error("Divy address not found in FCL config");
  }
  return address;
}

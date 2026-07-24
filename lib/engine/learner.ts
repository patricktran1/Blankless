import { policyV2 } from "@/data/policy";
import type { PolicyVersion } from "@/lib/types";

export function learnFromAfternoonDecline(current: PolicyVersion): PolicyVersion {
  if (current.id !== "policy-v1") return current;
  const sum = Object.values(policyV2.weights).reduce((a,b) => a+b, 0);
  if (sum !== 100) throw new Error("Policy weights must sum to 100");
  return structuredClone(policyV2);
}

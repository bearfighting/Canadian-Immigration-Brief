export const policyStatuses = [
  "effective",
  "announced",
  "consultation",
  "suspended",
  "expired",
  "unconfirmed",
] as const;

export type PolicyStatus = (typeof policyStatuses)[number];

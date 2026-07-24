import type { PolicyVersion } from "@/lib/types";

export const policyV1: PolicyVersion = {
  id: "policy-v1",
  weights: { typeCompatibility:30, availabilityFit:25, clinicalPriority:15, waitlistAge:10, acceptanceHistory:10, channelPreference:5, timeOfDay:5 },
  reason: "Initial clinic-configured policy",
  sourceOutcome: null
};

export const policyV2: PolicyVersion = {
  id: "policy-v2",
  weights: { typeCompatibility:30, availabilityFit:23, clinicalPriority:12, waitlistAge:10, acceptanceHistory:9, channelPreference:5, timeOfDay:11 },
  reason: "Afternoon offer declined by a patient with a consistent morning preference; time-of-day preference now carries more weight.",
  sourceOutcome: "pt-05-declined-afternoon"
};

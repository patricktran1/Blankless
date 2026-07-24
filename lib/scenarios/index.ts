import type { Scenario } from "@/lib/types";

export const scenario1: Scenario = {
  id: 1,
  slotId: "appt-014",
  cancelAt: "12:32",
  timeToSlotMinutes: 118,
  responses: [
    { patientId:"pt-05", result:"declined", latencyMs:1600, replyText:"Can't do afternoons, sorry." },
    { patientId:"pt-01", result:"accepted", latencyMs:1400, replyText:"YES" }
  ]
};

export const scenario2: Scenario = {
  id: 2,
  slotId: "appt-workflowB-031",
  cancelAt: "13:05",
  timeToSlotMinutes: 125,
  responses: [{ patientId:"pt-07", result:"accepted", latencyMs:1500, replyText:"YES" }]
};

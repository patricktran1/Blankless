"use agent";

import { agent, noTools, type Task } from "@guildai/agents-sdk";
import { z } from "zod";
import { patients, policyV1 } from "./data";
import { rankPatients } from "./scoring";

const tools = noTools;
type Tools = typeof tools;

const inputSchema = z.object({
  slotId: z.string(),
  appointmentType: z.string(),
  startTime: z.string(),
  clinician: z.string()
});

const outputSchema = z.object({
  slotId: z.string(),
  rankedCandidates: z.array(z.object({
    patientId: z.string(),
    name: z.string(),
    score: z.number(),
    channel: z.enum(["sms", "email"])
  })),
  decisionLog: z.array(z.string()),
  recommendation: z.string()
});

async function run(input: z.infer<typeof inputSchema>, task: Task<Tools>) {
  const rankedCandidates = rankPatients(patients, input, policyV1);
  const decisionLog = [
    `Cancellation received for ${input.startTime} ${input.appointmentType} with ${input.clinician}.`,
    `Loaded ${patients.length} self-contained waitlist candidates.`,
    `Applied deterministic Policy v1 scoring and ranked ${rankedCandidates.length} compatible candidates.`,
    rankedCandidates[0]
      ? `Recommended ${rankedCandidates[0].name} first at score ${rankedCandidates[0].score}.`
      : "No compatible candidate was found; staff escalation is required."
  ];
  task.console.info(decisionLog.join(" "));
  return {
    slotId: input.slotId,
    rankedCandidates,
    decisionLog,
    recommendation: rankedCandidates[0]
      ? `Contact ${rankedCandidates[0].name} via ${rankedCandidates[0].channel.toUpperCase()} first.`
      : "Escalate for staff review without automated outreach."
  };
}

export default agent({
  description: "Deterministically narrates and ranks a Blankless appointment-recovery workflow.",
  inputSchema,
  outputSchema,
  tools,
  run
});

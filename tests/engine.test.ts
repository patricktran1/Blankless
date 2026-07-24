import { describe, expect, it } from "vitest";
import { appointments } from "@/data/appointments";
import { patients } from "@/data/patients";
import { policyV1, policyV2 } from "@/data/policy";
import { guardCandidates } from "@/lib/engine/guard";
import { learnFromAfternoonDecline } from "@/lib/engine/learner";
import { rankCandidates } from "@/lib/policy/scoring";

describe("Blankless deterministic engine", () => {
  it("emits the three expected Scenario 1 exclusions", () => {
    const slot = appointments.find((a) => a.id === "appt-014")!;
    const result = guardCandidates(patients, slot, 118, []);
    expect(result.exclusions.map((e) => e.patientId)).toEqual(["pt-03","pt-04","pt-06"]);
  });
  it("ranks Scenario 1 candidates in the expected order", () => {
    const slot = appointments.find((a) => a.id === "appt-014")!;
    const eligible = guardCandidates(patients, slot, 118, []).eligible;
    expect(rankCandidates(eligible, slot, policyV1).map((c) => [c.patient.id,c.score])).toEqual([["pt-05",84],["pt-01",81],["pt-02",74],["pt-07",71],["pt-08",58]]);
  });
  it("creates a valid bounded v2 policy", () => {
    const next = learnFromAfternoonDecline(policyV1);
    expect(Object.values(next.weights).reduce((a,b) => a+b,0)).toBe(100);
    expect(next.weights.timeOfDay - policyV1.weights.timeOfDay).toBe(6);
  });
  it("changes Scenario 2 behavior", () => {
    const slot = appointments.find((a) => a.id === "appt-workflowB-031")!;
    const eligible = guardCandidates(patients, slot, 125, ["pt-01"]).eligible;
    const ranked = rankCandidates(eligible, slot, policyV2);
    expect(ranked[0].patient.id).toBe("pt-07");
    expect(ranked.findIndex((c) => c.patient.id === "pt-05")).toBeGreaterThanOrEqual(3);
  });
});

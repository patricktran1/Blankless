"use client";

import { guardCandidates } from "@/lib/engine/guard";
import { learnFromAfternoonDecline } from "@/lib/engine/learner";
import { rankCandidates } from "@/lib/policy/scoring";
import { scenario1, scenario2 } from "@/lib/scenarios";
import { useDemoStore } from "@/lib/store";
import type { Persona, Scenario, TimelineEvent } from "@/lib/types";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
let runToken = 0;

function event(persona: Persona, message: string, simTimestamp: string, severity: TimelineEvent["severity"] = "info"): TimelineEvent {
  return { id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, persona, message, simTimestamp, severity };
}

function patchAppointment(slotId: string, patch: Record<string, unknown>) {
  const store = useDemoStore.getState();
  store.set({ appointments: store.appointments.map((appointment) => appointment.id === slotId ? { ...appointment, ...patch } : appointment) });
}

function addEvent(next: TimelineEvent) {
  const store = useDemoStore.getState();
  store.set({ timeline: [...store.timeline, next] });
}

async function guardedWait(ms: number, token: number) { await wait(ms); if (token !== runToken) throw new Error("RUN_CANCELLED"); }

export async function playScenario(id: 1 | 2) {
  const initial = useDemoStore.getState();
  if (initial.running) return;
  if (id === 2 && initial.policy.id !== "policy-v2") return;
  const token = ++runToken;
  const scenario: Scenario = id === 1 ? scenario1 : scenario2;
  const slot = initial.appointments.find((appointment) => appointment.id === scenario.slotId);
  if (!slot) return;

  try {
    initial.set({ running:true, activeScenario:id, activeSlotId:slot.id, state:"gap_detected", candidates:[], exclusions:[], comparison:null });
    patchAppointment(slot.id, { status:"canceled" });
    addEvent(event("Gap Scout", `Cancellation detected — ${slot.startTime} ${slot.appointmentType.replaceAll("-"," ")}, ${slot.clinician}, ${slot.duration} min. ${Math.floor(scenario.timeToSlotMinutes/60)}h ${scenario.timeToSlotMinutes%60}m until slot.`, scenario.cancelAt, "danger"));
    await guardedWait(700, token);

    useDemoStore.getState().set({ state:"matching" });
    addEvent(event("Candidate Matcher", "Retrieved 8 waitlist patients and opened a recovery workflow.", scenario.cancelAt));
    await guardedWait(650, token);

    useDemoStore.getState().set({ state:"guarding" });
    const now = useDemoStore.getState();
    const bookedIds = now.patients.filter((p) => p.status === "booked").map((p) => p.id);
    const guarded = guardCandidates(now.patients, slot, scenario.timeToSlotMinutes, bookedIds, id);
    now.set({ exclusions:guarded.exclusions });
    for (const exclusion of guarded.exclusions) {
      addEvent(event("Policy Guard", `Blocked ${exclusion.patientName} — ${exclusion.rule}: ${exclusion.detail}`, scenario.cancelAt, "warning"));
      await guardedWait(450, token);
    }

    const ranked = rankCandidates(guarded.eligible, slot, now.policy);
    useDemoStore.getState().set({ state:"ranked", candidates:ranked });
    patchAppointment(slot.id, { status:"recovering" });
    addEvent(event("Candidate Matcher", `Ranked ${ranked.length} eligible patients under ${now.policy.id.replace("policy-", "Policy ").toUpperCase()}.`, scenario.cancelAt));
    await guardedWait(900, token);

    let attemptsThisRun = 0;
    for (const response of scenario.responses) {
      const current = useDemoStore.getState();
      const candidate = ranked.find((entry) => entry.patient.id === response.patientId);
      if (!candidate) continue;
      attemptsThisRun += 1;
      current.set({ state:"outreach_active", activeCandidateId:candidate.patient.id });
      addEvent(event("Outreach Agent", `${candidate.patient.preferredChannel.toUpperCase()} sent to ${candidate.patient.name}: “A ${slot.startTime} appointment opened with ${slot.clinician}. Reply YES to claim it.”`, scenario.cancelAt));
      await guardedWait(500, token);
      useDemoStore.getState().set({ state:"awaiting_response" });
      await guardedWait(response.latencyMs, token);

      if (response.result === "declined") {
        addEvent(event("Outreach Agent", `${candidate.patient.name} declined — “${response.replyText}”`, scenario.cancelAt, "danger"));
        useDemoStore.getState().set({ state:"declined" });
        await guardedWait(600, token);
        addEvent(event("Recovery Coordinator", `Advancing to candidate ${attemptsThisRun + 1} of ${ranked.length}.`, scenario.cancelAt));
        continue;
      }

      useDemoStore.getState().set({ state:"accepted" });
      addEvent(event("Outreach Agent", `${candidate.patient.name} accepted — “${response.replyText}”`, scenario.cancelAt, "success"));
      await guardedWait(500, token);
      useDemoStore.getState().set({ state:"confirming" });
      addEvent(event("Policy Guard", `Final consent, double-book, and single-fill lock checks passed for ${candidate.patient.name}.`, scenario.cancelAt, "success"));
      await guardedWait(550, token);

      patchAppointment(slot.id, { status:"recovered", patientId:candidate.patient.id, patientName:candidate.patient.name });
      const after = useDemoStore.getState();
      after.set({
        state:"recovered",
        patients: after.patients.map((patient) => patient.id === candidate.patient.id ? { ...patient, status:"booked" } : patient),
        metrics: {
          recovered: after.metrics.recovered + 1,
          attempts: after.metrics.attempts + attemptsThisRun,
          staffActionsAvoided: after.metrics.staffActionsAvoided + 7,
          recoveredMinutes: after.metrics.recoveredMinutes + slot.duration,
          revenue: after.metrics.revenue + 180,
          fillTime: id === 1 ? "4m 12s" : "1m 56s"
        }
      });
      addEvent(event("Recovery Coordinator", `Gap closed — ${candidate.patient.name} confirmed in ${attemptsThisRun} attempt${attemptsThisRun === 1 ? "" : "s"}.`, scenario.cancelAt, "success"));
      break;
    }

    if (id === 1) {
      await guardedWait(750, token);
      const before = useDemoStore.getState().policy;
      const learned = learnFromAfternoonDecline(before);
      useDemoStore.getState().set({ state:"learning", previousPolicy:before, policy:learned });
      addEvent(event("Learning Agent", "Policy v2 created — time-of-day preference increased from 5% to 11%.", scenario.cancelAt, "success"));
    } else {
      useDemoStore.getState().set({ comparison:"Policy v1 would have contacted Sofia first. Policy v2 filled this slot in 1 attempt." });
    }

    await guardedWait(400, token);
    useDemoStore.getState().set({ state:"idle", running:false, activeCandidateId:null });
  } catch (error) {
    if ((error as Error).message !== "RUN_CANCELLED") {
      useDemoStore.getState().set({ state:"escalated", running:false });
      addEvent(event("Recovery Coordinator", "Workflow paused and escalated for staff review.", scenario.cancelAt, "danger"));
    }
  }
}

export function resetDemo() { runToken += 1; useDemoStore.getState().reset(); }

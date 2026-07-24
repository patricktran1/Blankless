"use client";

import { guardCandidates } from "@/lib/engine/guard";
import { learnFromAfternoonDecline } from "@/lib/engine/learner";
import { rankCandidates } from "@/lib/policy/scoring";
import { scenario1, scenario2 } from "@/lib/scenarios";
import { dispatchTimelineEvent, dispatchWorkflowEnd, dispatchWorkflowStart } from "@/lib/integrations";
import { useDemoStore } from "@/lib/store";
import type { WorkflowContext, WorkflowOutcome } from "@/lib/integrations/types";
import type { Persona, Scenario, TimelineEvent } from "@/lib/types";

const SIM_SPEED = 12;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
let runToken = 0;
let activeWorkflowContext: WorkflowContext | null = null;

interface SimClock {
  startMs: number;
  currentMs: number;
}

function parseSimTime(time: string) {
  const [hours, minutes, seconds = 0] = time.split(":").map(Number);
  return ((hours * 60 + minutes) * 60 + seconds) * 1000;
}

function formatSimTime(valueMs: number) {
  const normalizedMs = ((valueMs % MS_PER_DAY) + MS_PER_DAY) % MS_PER_DAY;
  const totalSeconds = Math.floor(normalizedMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}

function formatElapsed(elapsedMs: number) {
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}

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
  if (activeWorkflowContext) dispatchTimelineEvent(next, activeWorkflowContext);
}

function addClockEvent(clock: SimClock, persona: Persona, message: string, severity: TimelineEvent["severity"] = "info") {
  addEvent(event(persona, message, formatSimTime(clock.currentMs), severity));
}

async function guardedWait(ms: number, token: number, clock: SimClock) {
  await wait(ms);
  if (token !== runToken) throw new Error("RUN_CANCELLED");
  clock.currentMs += ms * SIM_SPEED;
  useDemoStore.getState().set({ simTime: formatSimTime(clock.currentMs) });
}

export async function playScenario(id: 1 | 2) {
  const initial = useDemoStore.getState();
  if (initial.running) return;
  if (id === 2 && initial.policy.id !== "policy-v2") return;
  const token = ++runToken;
  const scenario: Scenario = id === 1 ? scenario1 : scenario2;
  const slot = initial.appointments.find((appointment) => appointment.id === scenario.slotId);
  if (!slot) return;
  const startMs = parseSimTime(scenario.cancelAt);
  const clock: SimClock = { startMs, currentMs: startMs };
  let attemptsThisRun = 0;
  let finalCandidateId: string | null = null;
  let fillTime = "—";

  try {
    activeWorkflowContext = { scenarioId:id, slotId:slot.id, policyId:initial.policy.id, startedAt:formatSimTime(clock.currentMs) };
    dispatchWorkflowStart(activeWorkflowContext);
    initial.set({ running:true, activeScenario:id, activeSlotId:slot.id, state:"gap_detected", candidates:[], exclusions:[], comparison:null, simTime:formatSimTime(clock.currentMs) });
    patchAppointment(slot.id, { status:"canceled" });
    addClockEvent(clock, "Gap Scout", `Cancellation detected — ${slot.startTime} ${slot.appointmentType.replaceAll("-"," ")}, ${slot.clinician}, ${slot.duration} min. ${Math.floor(scenario.timeToSlotMinutes/60)}h ${scenario.timeToSlotMinutes%60}m until slot.`, "danger");
    await guardedWait(700, token, clock);

    useDemoStore.getState().set({ state:"matching" });
    const waitlistedCount = useDemoStore.getState().patients.filter((patient) => patient.status === "waitlisted").length;
    addClockEvent(clock, "Candidate Matcher", `Retrieved ${waitlistedCount} waitlist patients and opened a recovery workflow.`);
    await guardedWait(650, token, clock);

    useDemoStore.getState().set({ state:"guarding" });
    const now = useDemoStore.getState();
    const bookedIds = now.patients.filter((p) => p.status === "booked").map((p) => p.id);
    const guarded = guardCandidates(now.patients, slot, scenario.timeToSlotMinutes, bookedIds);
    now.set({ exclusions:guarded.exclusions });
    for (const exclusion of guarded.exclusions) {
      addClockEvent(clock, "Policy Guard", `Blocked ${exclusion.patientName} — ${exclusion.rule}: ${exclusion.detail}`, "warning");
      await guardedWait(450, token, clock);
    }

    const ranked = rankCandidates(guarded.eligible, slot, now.policy);
    useDemoStore.getState().set({ state:"ranked", candidates:ranked });
    patchAppointment(slot.id, { status:"recovering" });
    addClockEvent(clock, "Candidate Matcher", `Ranked ${ranked.length} eligible patients under ${now.policy.id.replace("policy-", "Policy ").toUpperCase()}.`);
    await guardedWait(900, token, clock);

    for (const response of scenario.responses) {
      const current = useDemoStore.getState();
      const candidate = ranked.find((entry) => entry.patient.id === response.patientId);
      if (!candidate) continue;
      attemptsThisRun += 1;
      current.set({ state:"outreach_active", activeCandidateId:candidate.patient.id });
      addClockEvent(clock, "Outreach Agent", `${candidate.patient.preferredChannel.toUpperCase()} sent to ${candidate.patient.name}: “A ${slot.startTime} appointment opened with ${slot.clinician}. Reply YES to claim it.”`);
      await guardedWait(500, token, clock);
      useDemoStore.getState().set({ state:"awaiting_response" });
      await guardedWait(response.latencyMs, token, clock);

      if (response.result === "declined") {
        addClockEvent(clock, "Outreach Agent", `${candidate.patient.name} declined — “${response.replyText}”`, "danger");
        useDemoStore.getState().set({ state:"declined" });
        await guardedWait(600, token, clock);
        addClockEvent(clock, "Recovery Coordinator", `Advancing to candidate ${attemptsThisRun + 1} of ${ranked.length}.`);
        continue;
      }

      useDemoStore.getState().set({ state:"accepted" });
      addClockEvent(clock, "Outreach Agent", `${candidate.patient.name} accepted — “${response.replyText}”`, "success");
      await guardedWait(500, token, clock);
      useDemoStore.getState().set({ state:"confirming" });
      addClockEvent(clock, "Policy Guard", `Final consent, double-book, and single-fill lock checks passed for ${candidate.patient.name}.`, "success");
      await guardedWait(550, token, clock);

      patchAppointment(slot.id, { status:"recovered", patientId:candidate.patient.id, patientName:candidate.patient.name });
      finalCandidateId = candidate.patient.id;
      fillTime = formatElapsed(clock.currentMs - clock.startMs);
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
          fillTime
        }
      });
      addClockEvent(clock, "Recovery Coordinator", `Gap closed — ${candidate.patient.name} confirmed in ${attemptsThisRun} attempt${attemptsThisRun === 1 ? "" : "s"}.`, "success");
      if (activeWorkflowContext) {
        const outcome: WorkflowOutcome = { recovered:true, attempts:attemptsThisRun, fillTime, finalCandidateId };
        dispatchWorkflowEnd(outcome, activeWorkflowContext);
      }
      break;
    }

    if (id === 1) {
      await guardedWait(750, token, clock);
      const before = useDemoStore.getState().policy;
      const learned = learnFromAfternoonDecline(before);
      useDemoStore.getState().set({ state:"learning", previousPolicy:before, policy:learned });
      addClockEvent(clock, "Learning Agent", "Policy v2 created — time-of-day preference increased from 5% to 11%.", "success");
    } else {
      useDemoStore.getState().set({ comparison:"Policy v1 would have contacted Sofia first. Policy v2 filled this slot in 1 attempt." });
    }

    await guardedWait(400, token, clock);
    useDemoStore.getState().set({ state:"idle", running:false, activeCandidateId:null });
    activeWorkflowContext = null;
  } catch (error) {
    if ((error as Error).message !== "RUN_CANCELLED") {
      console.error(error);
      useDemoStore.getState().set({ state:"escalated", running:false });
      addClockEvent(clock, "Recovery Coordinator", "Workflow paused and escalated for staff review.", "danger");
      if (activeWorkflowContext) {
        dispatchWorkflowEnd({ recovered:false, attempts:attemptsThisRun, fillTime, finalCandidateId }, activeWorkflowContext);
      }
      activeWorkflowContext = null;
    }
  }
}

export function resetDemo() { runToken += 1; activeWorkflowContext = null; useDemoStore.getState().reset(); }

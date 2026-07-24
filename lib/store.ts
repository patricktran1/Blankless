"use client";

import { create } from "zustand";
import { appointments as appointmentSeed } from "@/data/appointments";
import { patients as patientSeed } from "@/data/patients";
import { policyV1 } from "@/data/policy";
import type { Appointment, Candidate, Exclusion, Patient, PolicyVersion, TimelineEvent, WorkflowState } from "@/lib/types";

interface Metrics { recovered: number; attempts: number; staffActionsAvoided: number; recoveredMinutes: number; revenue: number; fillTime: string; }
interface DemoStore {
  appointments: Appointment[];
  patients: Patient[];
  policy: PolicyVersion;
  previousPolicy: PolicyVersion | null;
  timeline: TimelineEvent[];
  candidates: Candidate[];
  exclusions: Exclusion[];
  state: WorkflowState;
  activeScenario: 1 | 2 | null;
  activeSlotId: string | null;
  activeCandidateId: string | null;
  metrics: Metrics;
  running: boolean;
  comparison: string | null;
  set: (partial: Partial<DemoStore>) => void;
  reset: () => void;
}

const seedMetrics: Metrics = { recovered:0, attempts:0, staffActionsAvoided:0, recoveredMinutes:0, revenue:0, fillTime:"—" };
export const useDemoStore = create<DemoStore>((set) => ({
  appointments: structuredClone(appointmentSeed), patients: structuredClone(patientSeed), policy: structuredClone(policyV1), previousPolicy:null,
  timeline:[], candidates:[], exclusions:[], state:"idle", activeScenario:null, activeSlotId:null, activeCandidateId:null, metrics:seedMetrics, running:false, comparison:null,
  set,
  reset: () => set({ appointments:structuredClone(appointmentSeed), patients:structuredClone(patientSeed), policy:structuredClone(policyV1), previousPolicy:null, timeline:[], candidates:[], exclusions:[], state:"idle", activeScenario:null, activeSlotId:null, activeCandidateId:null, metrics:{...seedMetrics}, running:false, comparison:null })
}));

import type { Appointment, Candidate, Patient, PolicyVersion, ScoreBreakdown } from "@/lib/types";

function isAfternoon(time: string) { return Number(time.split(":")[0]) >= 12; }

function defaultSignals(patient: Patient, slot: Appointment) {
  const afternoon = isAfternoon(slot.startTime);
  const prefersSlot = patient.timeOfDayPreference === "none" || (afternoon ? patient.timeOfDayPreference === "afternoon" : patient.timeOfDayPreference === "morning");
  const waitDays = Math.max(0, Math.round((new Date("2026-07-24").getTime() - new Date(patient.waitlistSince).getTime()) / 86400000));
  return {
    typeCompatibility: patient.appointmentTypes.includes(slot.appointmentType) ? 1 : 0,
    availabilityFit: patient.availability.weekdays.includes(slot.day) ? 1 : 0,
    clinicalPriority: patient.clinicalPriority === 1 ? 1 : patient.clinicalPriority === 2 ? .6 : .2,
    waitlistAge: Math.min(1, waitDays / 55),
    acceptanceHistory: patient.acceptanceRate,
    channelPreference: patient.communicationConsent[patient.preferredChannel] ? 1 : .4,
    timeOfDay: prefersSlot ? 1 : 0
  };
}

export function scoreCandidate(patient: Patient, slot: Appointment, policy: PolicyVersion): Candidate {
  const raw = { ...defaultSignals(patient, slot), ...(patient.demoSignals?.[slot.appointmentType] ?? {}) };
  const breakdown = Object.fromEntries(Object.entries(policy.weights).map(([key, weight]) => [key, Math.round(weight * raw[key as keyof typeof raw] * 10) / 10])) as unknown as ScoreBreakdown;
  const score = Math.round(Object.values(breakdown).reduce((sum, value) => sum + value, 0));
  return { patient, score, breakdown, policyVersion: policy.id };
}

export function rankCandidates(patients: Patient[], slot: Appointment, policy: PolicyVersion) {
  return patients.map((patient) => scoreCandidate(patient, slot, policy)).sort((a,b) => b.score - a.score || a.patient.name.localeCompare(b.patient.name));
}

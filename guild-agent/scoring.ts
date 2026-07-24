import type { GuildPatient, GuildPolicyWeights } from "./data";

export interface CancellationSlot {
  slotId: string;
  appointmentType: string;
  startTime: string;
  clinician: string;
}

function isAfternoon(time: string) {
  return Number(time.split(":")[0]) >= 12;
}

function defaultSignals(patient: GuildPatient, slot: CancellationSlot) {
  const afternoon = isAfternoon(slot.startTime);
  const prefersSlot = patient.timeOfDayPreference === "none" || (afternoon ? patient.timeOfDayPreference === "afternoon" : patient.timeOfDayPreference === "morning");
  const waitDays = Math.max(0, Math.round((new Date("2026-07-24").getTime() - new Date(patient.waitlistSince).getTime()) / 86400000));
  return {
    typeCompatibility: patient.appointmentTypes.includes(slot.appointmentType) ? 1 : 0,
    availabilityFit: 1,
    clinicalPriority: patient.clinicalPriority === 1 ? 1 : patient.clinicalPriority === 2 ? .6 : .2,
    waitlistAge: Math.min(1, waitDays / 55),
    acceptanceHistory: patient.acceptanceRate,
    channelPreference: 1,
    timeOfDay: prefersSlot ? 1 : 0
  };
}

export function rankPatients(patients: GuildPatient[], slot: CancellationSlot, weights: GuildPolicyWeights) {
  return patients
    .filter((patient) => patient.appointmentTypes.includes(slot.appointmentType))
    .map((patient) => {
      const raw = { ...defaultSignals(patient, slot), ...(patient.demoSignals?.[slot.appointmentType] ?? {}) };
      const score = Math.round(Object.entries(weights).reduce((sum, [key, weight]) => sum + weight * raw[key as keyof typeof raw], 0));
      return { patientId:patient.id, name:patient.name, score, channel:patient.preferredChannel };
    })
    .sort((left, right) => right.score - left.score || left.name.localeCompare(right.name));
}

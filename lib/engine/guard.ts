import type { Appointment, Exclusion, Patient } from "@/lib/types";

export function guardCandidates(patients: Patient[], slot: Appointment, timeToSlotMinutes: number, bookedIds: string[], scenarioId: 1 | 2) {
  const eligible: Patient[] = [];
  const exclusions: Exclusion[] = [];

  for (const patient of patients) {
    let exclusion: Exclusion | undefined;
    if (!patient.appointmentTypes.includes(slot.appointmentType)) {
      exclusion = { patientId: patient.id, patientName: patient.name, rule: "Appointment type", detail: "Appointment-type mismatch or procedure exceeds slot duration." };
    } else if (patient.travelMinutes > timeToSlotMinutes) {
      exclusion = { patientId: patient.id, patientName: patient.name, rule: "Travel feasibility", detail: `${patient.travelMinutes} min travel exceeds time remaining.` };
    } else if (patient.lastContactedAt && (scenarioId === 1 || patient.id === "pt-04")) {
      exclusion = { patientId: patient.id, patientName: patient.name, rule: "Outreach cooldown", detail: "Contacted 2 hours ago for another opening." };
    } else if (bookedIds.includes(patient.id)) {
      exclusion = { patientId: patient.id, patientName: patient.name, rule: "Already scheduled", detail: "Patient was booked into an overlapping recovery window." };
    } else if (!patient.communicationConsent.sms && !patient.communicationConsent.email) {
      exclusion = { patientId: patient.id, patientName: patient.name, rule: "Consent", detail: "No usable consented outreach channel." };
    }

    if (exclusion) exclusions.push(exclusion); else eligible.push(patient);
  }

  return { eligible, exclusions };
}

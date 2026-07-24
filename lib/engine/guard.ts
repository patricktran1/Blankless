import type { Appointment, Exclusion, Patient } from "@/lib/types";

// Patients need time to see the offer, reply, and still travel before the slot starts.
const RESPONSE_WINDOW_MIN = 45;

export function guardCandidates(patients: Patient[], slot: Appointment, timeToSlotMinutes: number, bookedIds: string[]) {
  const eligible: Patient[] = [];
  const exclusions: Exclusion[] = [];

  for (const patient of patients) {
    let exclusion: Exclusion | undefined;
    if (!patient.appointmentTypes.includes(slot.appointmentType)) {
      exclusion = { patientId: patient.id, patientName: patient.name, rule: "Appointment type", detail: "Appointment-type mismatch or procedure exceeds slot duration." };
    } else if (patient.travelMinutes > timeToSlotMinutes - RESPONSE_WINDOW_MIN) {
      const feasibleWindowMinutes = timeToSlotMinutes - RESPONSE_WINDOW_MIN;
      exclusion = { patientId: patient.id, patientName: patient.name, rule: "Travel feasibility", detail: `${patient.travelMinutes} min travel exceeds the ${feasibleWindowMinutes} min feasible window (time remaining minus ${RESPONSE_WINDOW_MIN} min response window).` };
    } else if (patient.lastContactedAt) {
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

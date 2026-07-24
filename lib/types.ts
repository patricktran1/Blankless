export type AppointmentStatus = "confirmed" | "canceled" | "recovering" | "recovered" | "unfilled";
export type WorkflowState = "idle" | "gap_detected" | "matching" | "guarding" | "ranked" | "outreach_active" | "awaiting_response" | "declined" | "accepted" | "confirming" | "recovered" | "learning" | "escalated";
export type Persona = "Gap Scout" | "Candidate Matcher" | "Policy Guard" | "Outreach Agent" | "Recovery Coordinator" | "Learning Agent";
export type Channel = "sms" | "email";

export interface Appointment {
  id: string;
  day: string;
  clinician: string;
  appointmentType: string;
  startTime: string;
  duration: number;
  status: AppointmentStatus;
  patientId?: string;
  patientName?: string;
}

export interface Patient {
  id: string;
  name: string;
  appointmentTypes: string[];
  availability: { weekdays: string[]; window: string };
  preferredChannel: Channel;
  communicationConsent: Record<Channel, boolean>;
  waitlistSince: string;
  clinicalPriority: 1 | 2 | 3;
  travelMinutes: number;
  previousOffers: number;
  acceptanceRate: number;
  averageResponseTime: number;
  timeOfDayPreference: "morning" | "afternoon" | "none";
  status: "waitlisted" | "booked";
  lastContactedAt?: string;
  demoSignals?: Record<string, Partial<Record<keyof PolicyWeights, number>>>;
}

export interface PolicyWeights {
  typeCompatibility: number;
  availabilityFit: number;
  clinicalPriority: number;
  waitlistAge: number;
  acceptanceHistory: number;
  channelPreference: number;
  timeOfDay: number;
}

export interface PolicyVersion {
  id: string;
  weights: PolicyWeights;
  reason: string;
  sourceOutcome: string | null;
}

export interface ScoreBreakdown {
  typeCompatibility: number;
  availabilityFit: number;
  clinicalPriority: number;
  waitlistAge: number;
  acceptanceHistory: number;
  channelPreference: number;
  timeOfDay: number;
}

export interface Candidate {
  patient: Patient;
  score: number;
  breakdown: ScoreBreakdown;
  policyVersion: string;
}

export interface Exclusion {
  patientId: string;
  patientName: string;
  rule: string;
  detail: string;
}

export interface TimelineEvent {
  id: string;
  persona: Persona;
  message: string;
  simTimestamp: string;
  severity: "info" | "success" | "warning" | "danger";
}

export interface ScenarioResponse {
  patientId: string;
  result: "accepted" | "declined" | "timeout";
  latencyMs: number;
  replyText: string;
}

export interface Scenario {
  id: 1 | 2;
  slotId: string;
  cancelAt: string;
  timeToSlotMinutes: number;
  responses: ScenarioResponse[];
}

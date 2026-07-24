import { appointments } from "@/data/appointments";
import type { Appointment } from "@/lib/types";
import type { IntegrationAdapter, WorkflowContext, WorkflowOutcome } from "@/lib/integrations/types";

export const ACTIAN_COLLECTION = "blankless_outcomes";
export const ACTIAN_VECTOR_DIMENSION = 32;

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const APPOINTMENT_TYPES = ["derm-follow-up", "biopsy-site-check", "new-patient-consult", "procedure", "mole-mapping-45min", "other"] as const;

export interface ActianFeatureInput {
  startTime: string;
  day: string;
  appointmentType: string;
  duration: number;
  attempts: number;
  recovered: boolean;
  policyId: string;
}

export interface ActianSearchResult {
  id?: string | number;
  score?: number;
  payload?: Record<string, unknown>;
}

export interface VectorAIClientLike {
  collections: {
    list(): Promise<unknown>;
    create(name: string, options: { dimension: number; distanceMetric: "COSINE" }): Promise<unknown>;
  };
  points: {
    upsert(name: string, points: Array<{ id: number; vector: number[]; payload: Record<string, unknown> }>): Promise<unknown>;
    search(name: string, vector: number[], options: { limit: number }): Promise<ActianSearchResult[]>;
  };
}

function oneHot(index: number, size: number) {
  return Array.from({ length: size }, (_, current) => current === index ? 1 : 0);
}

export function encodeWorkflowVector(input: ActianFeatureInput) {
  const [hour, minute] = input.startTime.split(":").map(Number);
  const timeOfDay = Math.min(1, Math.max(0, (hour * 60 + minute) / (24 * 60)));
  const dayIndex = DAYS.indexOf(input.day as (typeof DAYS)[number]);
  const typeIndex = APPOINTMENT_TYPES.includes(input.appointmentType as (typeof APPOINTMENT_TYPES)[number])
    ? APPOINTMENT_TYPES.indexOf(input.appointmentType as (typeof APPOINTMENT_TYPES)[number])
    : APPOINTMENT_TYPES.indexOf("other");
  const core = [
    timeOfDay,
    ...oneHot(dayIndex, DAYS.length),
    ...oneHot(typeIndex, APPOINTMENT_TYPES.length),
    Math.min(1, input.duration / 60),
    Math.min(1, input.attempts / 10),
    input.recovered ? 1 : 0,
    input.policyId === "policy-v2" ? 1 : 0,
    input.policyId === "policy-v1" ? 1 : 0
  ];
  return [...core, ...Array(Math.max(0, ACTIAN_VECTOR_DIMENSION - core.length)).fill(0)].slice(0, ACTIAN_VECTOR_DIMENSION);
}

function collectionNames(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item) => typeof item === "string" ? [item] : item && typeof item === "object" && typeof (item as Record<string, unknown>).name === "string" ? [(item as Record<string, unknown>).name as string] : []);
  }
  if (!value || typeof value !== "object") return [];
  const record = value as Record<string, unknown>;
  return collectionNames(record.collections ?? record.data ?? []);
}

export async function ensureOutcomeCollection(client: VectorAIClientLike) {
  // The sponsor requirement calls for collections.list/create. The exact JS
  // list response envelope was not available in the fetched public reference,
  // so collectionNames accepts the common array, {collections}, and {data} forms.
  const existing = await client.collections.list();
  if (!collectionNames(existing).includes(ACTIAN_COLLECTION)) {
    await client.collections.create(ACTIAN_COLLECTION, { dimension: ACTIAN_VECTOR_DIMENSION, distanceMetric: "COSINE" });
  }
}

export async function retrieveSimilarScenarios(slot: Appointment, client?: VectorAIClientLike) {
  const vectorClient = client ?? await createClient();
  await ensureOutcomeCollection(vectorClient);
  const vector = encodeWorkflowVector({
    startTime: slot.startTime,
    day: slot.day,
    appointmentType: slot.appointmentType,
    duration: slot.duration,
    attempts: 0,
    recovered: false,
    policyId: "policy-v1"
  });
  const results = await vectorClient.points.search(ACTIAN_COLLECTION, vector, { limit: 2 });
  return results.map((result) => result.payload ?? {});
}

function stablePointId(ctx: WorkflowContext) {
  const input = `${ctx.scenarioId}:${ctx.slotId}:${ctx.startedAt}`;
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

async function createClient(): Promise<VectorAIClientLike> {
  const { VectorAIClient } = await import("@actian/vectorai-client");
  const grpcAddress = process.env.ACTIAN_GRPC_ADDR || "localhost:6574";
  const restUrl = process.env.ACTIAN_REST_URL || "http://localhost:6573";
  const accessToken = process.env.ACTIAN_ACCESS_TOKEN;
  return new VectorAIClient(grpcAddress, { restUrl, ...(accessToken ? { accessToken } : {}) }) as unknown as VectorAIClientLike;
}

export async function persistWorkflowOutcome(outcome: WorkflowOutcome, ctx: WorkflowContext, client?: VectorAIClientLike) {
  const slot = appointments.find((appointment) => appointment.id === ctx.slotId);
  if (!slot) return;
  const vectorClient = client ?? await createClient();
  await ensureOutcomeCollection(vectorClient);
  const vector = encodeWorkflowVector({
    startTime: slot.startTime,
    day: slot.day,
    appointmentType: slot.appointmentType,
    duration: slot.duration,
    attempts: outcome.attempts,
    recovered: outcome.recovered,
    policyId: ctx.policyId
  });
  await vectorClient.points.upsert(ACTIAN_COLLECTION, [{
    id: stablePointId(ctx),
    vector,
    payload: {
      scenarioId: ctx.scenarioId,
      slotId: ctx.slotId,
      policyId: ctx.policyId,
      startedAt: ctx.startedAt,
      appointmentType: slot.appointmentType,
      startTime: slot.startTime,
      day: slot.day,
      duration: slot.duration,
      ...outcome
    }
  }]);
}

export const actianAdapter: IntegrationAdapter = {
  name: "actian",
  isEnabled: () => !process.env.VERCEL && Boolean(process.env.ACTIAN_GRPC_ADDR || process.env.ACTIAN_REST_URL || process.env.ACTIAN_ACCESS_TOKEN),
  async onWorkflowStart() {},
  async onEvent() {},
  async onWorkflowEnd(outcome, ctx) { await persistWorkflowOutcome(outcome, ctx); }
};

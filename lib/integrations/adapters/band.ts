import type { IntegrationAdapter, WorkflowContext, WorkflowOutcome } from "@/lib/integrations/types";
import type { TimelineEvent } from "@/lib/types";

const BAND_BASE_URL = "https://app.band.ai/api/v1/agent";
const chatPromises = new Map<string, Promise<string | null>>();

function workflowKey(ctx: WorkflowContext) {
  return `${ctx.scenarioId}:${ctx.slotId}:${ctx.startedAt}`;
}

async function bandRequest(path: string, init: RequestInit = {}) {
  const apiKey = process.env.BAND_API_KEY;
  if (!apiKey) return null;
  const headers = new Headers(init.headers);
  headers.set("X-API-Key", apiKey);
  headers.set("Content-Type", "application/json");
  const response = await fetch(`${BAND_BASE_URL}${path}`, {
    ...init,
    headers
  });
  if (!response.ok) throw new Error(`Band ${path} returned ${response.status}`);
  if (response.status === 204) return null;
  return response.json() as Promise<unknown>;
}

function readId(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const direct = record.id;
  if (typeof direct === "string") return direct;
  const data = record.data;
  if (data && typeof data === "object" && typeof (data as Record<string, unknown>).id === "string") {
    return (data as Record<string, unknown>).id as string;
  }
  return null;
}

async function createChat(ctx: WorkflowContext) {
  if (process.env.BAND_CHAT_ID) return process.env.BAND_CHAT_ID;
  const created = await bandRequest("/chats", { method: "POST", body: JSON.stringify({}) });
  const chatId = readId(created);
  if (!chatId) {
    // TODO(Band): confirm the exact POST /agent/chats response envelope if it
    // differs from the platform's standard { data: { id } } response shape.
    throw new Error("Band chat creation response did not include an id");
  }

  // Band documents PATCH /agent/chats/{id} for renaming, but the fetched API
  // reference did not publish its request body schema. Do not invent the field.
  // TODO(Band): rename this room to `Blankless Recovery — Scenario ${ctx.scenarioId}`
  // after the PATCH request schema is confirmed.
  await postEvent(chatId, {
    content: `Blankless Recovery — Scenario ${ctx.scenarioId}`,
    message_type: "task",
    metadata: { scenarioId: ctx.scenarioId, slotId: ctx.slotId, policyId: ctx.policyId }
  });
  return chatId;
}

async function resolveChatId(ctx: WorkflowContext) {
  if (process.env.BAND_CHAT_ID) return process.env.BAND_CHAT_ID;
  const key = workflowKey(ctx);
  const existing = chatPromises.get(key);
  if (existing) return existing;
  const pending = createChat(ctx).catch((error) => {
    chatPromises.delete(key);
    throw error;
  });
  chatPromises.set(key, pending);
  return pending;
}

async function postEvent(chatId: string, event: { content: string; message_type: "tool_call" | "tool_result" | "thought" | "error" | "task"; metadata?: Record<string, unknown> }) {
  await bandRequest(`/chats/${encodeURIComponent(chatId)}/events`, {
    method: "POST",
    body: JSON.stringify({ event })
  });
}

function eventType(event: TimelineEvent) {
  if (event.severity === "danger") return "error" as const;
  if (event.persona === "Policy Guard") return "tool_result" as const;
  if (event.persona === "Candidate Matcher" || event.persona === "Outreach Agent") return "tool_call" as const;
  return "thought" as const;
}

async function mirrorTimelineEvent(event: TimelineEvent, ctx: WorkflowContext) {
  const chatId = await resolveChatId(ctx);
  if (!chatId) return;
  await postEvent(chatId, {
    content: `${event.persona}: ${event.message}`,
    message_type: eventType(event),
    metadata: {
      persona: event.persona,
      simTimestamp: event.simTimestamp,
      severity: event.severity,
      scenarioId: ctx.scenarioId,
      slotId: ctx.slotId,
      policyId: ctx.policyId
    }
  });
}

async function mirrorOutcome(outcome: WorkflowOutcome, ctx: WorkflowContext) {
  const chatId = await resolveChatId(ctx);
  if (!chatId) return;
  await postEvent(chatId, {
    content: outcome.recovered ? "Blankless recovered the appointment." : "Blankless escalated the recovery workflow.",
    message_type: outcome.recovered ? "task" : "error",
    metadata: { ...outcome, scenarioId: ctx.scenarioId, slotId: ctx.slotId, policyId: ctx.policyId }
  });
}

export const bandAdapter: IntegrationAdapter = {
  name: "band",
  isEnabled: () => Boolean(process.env.BAND_API_KEY),
  async onWorkflowStart(ctx) { await resolveChatId(ctx); },
  async onEvent(event, ctx) { await mirrorTimelineEvent(event, ctx); },
  async onWorkflowEnd(outcome, ctx) { await mirrorOutcome(outcome, ctx); }
};

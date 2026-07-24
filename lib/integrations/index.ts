import type { IntegrationAction, IntegrationAdapter, IntegrationDispatchPayload, IntegrationName, WorkflowContext, WorkflowOutcome } from "@/lib/integrations/types";
import type { TimelineEvent } from "@/lib/types";

const CLIENT_DISPATCH_ADAPTERS: Exclude<IntegrationName, "replay">[] = ["guild", "band", "actian"];

function postToAdapter(adapter: Exclude<IntegrationName, "replay">, payload: IntegrationDispatchPayload) {
  try {
    void fetch(`/api/integrations/${adapter}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true
    }).catch((error) => console.warn(`[${adapter}] integration dispatch failed`, error));
  } catch (error) {
    console.warn(`[${adapter}] integration dispatch failed`, error);
  }
}

function fireAndForget(payload: IntegrationDispatchPayload) {
  for (const adapter of CLIENT_DISPATCH_ADAPTERS) postToAdapter(adapter, payload);
}

export function dispatchWorkflowStart(ctx: WorkflowContext) {
  fireAndForget({ action: "workflowStart", ctx });
}

export function dispatchTimelineEvent(event: TimelineEvent, ctx: WorkflowContext) {
  fireAndForget({ action: "event", event, ctx });
}

export function dispatchWorkflowEnd(outcome: WorkflowOutcome, ctx: WorkflowContext) {
  fireAndForget({ action: "workflowEnd", outcome, ctx });
}

export async function dispatchToEnabledAdapters(
  adapters: IntegrationAdapter[],
  action: IntegrationAction,
  payload: IntegrationDispatchPayload
) {
  for (const adapter of adapters) {
    try {
      if (!adapter.isEnabled()) continue;
      if (action === "workflowStart" && payload.action === "workflowStart") {
        await adapter.onWorkflowStart(payload.ctx);
      } else if (action === "event" && payload.action === "event") {
        await adapter.onEvent(payload.event, payload.ctx);
      } else if (action === "workflowEnd" && payload.action === "workflowEnd") {
        await adapter.onWorkflowEnd(payload.outcome, payload.ctx);
      }
    } catch (error) {
      console.warn(`[${adapter.name}] integration adapter failed`, error);
    }
  }
}

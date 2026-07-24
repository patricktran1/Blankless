import type { TimelineEvent } from "@/lib/types";

export type IntegrationName = "guild" | "band" | "actian" | "replay";

export interface WorkflowContext {
  scenarioId: 1 | 2;
  slotId: string;
  policyId: string;
  startedAt: string;
}

export interface WorkflowOutcome {
  recovered: boolean;
  attempts: number;
  fillTime: string;
  finalCandidateId: string | null;
}

export interface IntegrationAdapter {
  name: IntegrationName;
  isEnabled(): boolean;
  onWorkflowStart(ctx: WorkflowContext): Promise<void>;
  onEvent(e: TimelineEvent, ctx: WorkflowContext): Promise<void>;
  onWorkflowEnd(outcome: WorkflowOutcome, ctx: WorkflowContext): Promise<void>;
}

export type IntegrationAction = "workflowStart" | "event" | "workflowEnd";

export type IntegrationDispatchPayload =
  | { action: "workflowStart"; ctx: WorkflowContext }
  | { action: "event"; event: TimelineEvent; ctx: WorkflowContext }
  | { action: "workflowEnd"; outcome: WorkflowOutcome; ctx: WorkflowContext };

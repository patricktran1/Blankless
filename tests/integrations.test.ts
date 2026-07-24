import { afterEach, describe, expect, it } from "vitest";
import { dispatchToEnabledAdapters } from "@/lib/integrations";
import { serverAdapters } from "@/lib/integrations/server";
import type { WorkflowContext } from "@/lib/integrations/types";

const keys = [
  "BAND_API_KEY",
  "BAND_CHAT_ID",
  "ACTIAN_GRPC_ADDR",
  "ACTIAN_REST_URL",
  "ACTIAN_ACCESS_TOKEN",
  "GUILD_TRIGGER_WEBHOOK_URL",
  "NEXT_PUBLIC_REPLAY_RUN_URL",
  "VERCEL"
] as const;

const original = Object.fromEntries(keys.map((key) => [key, process.env[key]]));

afterEach(() => {
  for (const key of keys) {
    const value = original[key];
    if (value === undefined) delete process.env[key]; else process.env[key] = value;
  }
});

describe("integration adapter safety", () => {
  it("disables every adapter and safely no-ops with an empty environment", async () => {
    for (const key of keys) delete process.env[key];
    expect(serverAdapters.map((adapter) => [adapter.name, adapter.isEnabled()])).toEqual([
      ["guild", false],
      ["band", false],
      ["actian", false],
      ["replay", false]
    ]);

    const ctx: WorkflowContext = { scenarioId:1, slotId:"appt-014", policyId:"policy-v1", startedAt:"12:32:00" };
    await expect(dispatchToEnabledAdapters(serverAdapters, "workflowStart", { action:"workflowStart", ctx })).resolves.toBeUndefined();
  });
});

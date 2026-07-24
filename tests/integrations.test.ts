import { afterEach, describe, expect, it, vi } from "vitest";
import { dispatchToEnabledAdapters } from "@/lib/integrations";
import { serverAdapters } from "@/lib/integrations/server";
import type { WorkflowContext } from "@/lib/integrations/types";

const keys = [
  "BAND_API_KEY",
  "BAND_CHAT_ID",
  "ACTIAN_GRPC_ADDR",
  "ACTIAN_REST_URL",
  "ACTIAN_ACCESS_TOKEN",
  "GUILD_OWNER_NAME",
  "GUILD_WORKSPACE_NAME",
  "GUILD_API_KEY",
  "NEXT_PUBLIC_REPLAY_RUN_URL",
  "VERCEL"
] as const;

const original = Object.fromEntries(keys.map((key) => [key, process.env[key]]));

const ctx: WorkflowContext = {
  scenarioId: 1,
  slotId: "appt-014",
  policyId: "policy-v1",
  startedAt: "12:32:00"
};

afterEach(() => {
  vi.unstubAllGlobals();
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

    await expect(dispatchToEnabledAdapters(serverAdapters, "workflowStart", { action:"workflowStart", ctx })).resolves.toBeUndefined();
  });

  it("invokes the Guild workspace sessions endpoint with the API trigger envelope", async () => {
    process.env.GUILD_OWNER_NAME = "patrick";
    process.env.GUILD_WORKSPACE_NAME = "blankless-demo";
    process.env.GUILD_API_KEY = "api-key-id:api-key-secret";
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 202 });
    vi.stubGlobal("fetch", fetchMock);

    const guild = serverAdapters.find((adapter) => adapter.name === "guild")!;
    expect(guild.isEnabled()).toBe(true);
    await guild.onWorkflowStart(ctx);

    expect(fetchMock).toHaveBeenCalledWith(
      "https://app.guild.ai/api/workspaces/patrick/blankless-demo/sessions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from("api-key-id:api-key-secret", "utf8").toString("base64")}`
        },
        body: JSON.stringify({
          session_type: "api_trigger",
          agent_input: {
            slotId: "appt-014",
            appointmentType: "derm-follow-up",
            startTime: "14:30",
            clinician: "Dr. Rivera"
          }
        })
      }
    );
  });
});
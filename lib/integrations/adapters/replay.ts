import type { IntegrationAdapter } from "@/lib/integrations/types";

export const replayAdapter: IntegrationAdapter = {
  name: "replay",
  isEnabled: () => Boolean(process.env.NEXT_PUBLIC_REPLAY_RUN_URL),
  async onWorkflowStart() {},
  async onEvent() {},
  async onWorkflowEnd() {}
};

import { appointments } from "@/data/appointments";
import type { IntegrationAdapter } from "@/lib/integrations/types";

function getGuildSessionsUrl() {
  const ownerName = process.env.GUILD_OWNER_NAME;
  const workspaceName = process.env.GUILD_WORKSPACE_NAME;
  if (!ownerName || !workspaceName) return undefined;

  return `https://app.guild.ai/api/workspaces/${encodeURIComponent(ownerName)}/${encodeURIComponent(workspaceName)}/sessions`;
}

function getGuildBasicCredential() {
  return process.env.GUILD_API_KEY;
}

function createBasicAuthorization(credential: string) {
  return `Basic ${Buffer.from(credential, "utf8").toString("base64")}`;
}

export const guildAdapter: IntegrationAdapter = {
  name: "guild",
  isEnabled: () => Boolean(getGuildSessionsUrl() && getGuildBasicCredential()),
  async onWorkflowStart(ctx) {
    const sessionsUrl = getGuildSessionsUrl();
    const credential = getGuildBasicCredential();
    if (!sessionsUrl || !credential) return;

    const slot = appointments.find((appointment) => appointment.id === ctx.slotId);
    if (!slot) return;

    const response = await fetch(sessionsUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: createBasicAuthorization(credential)
      },
      body: JSON.stringify({
        session_type: "api_trigger",
        agent_input: {
          slotId: slot.id,
          appointmentType: slot.appointmentType,
          startTime: slot.startTime,
          clinician: slot.clinician
        }
      })
    });

    if (!response.ok) throw new Error(`Guild API trigger returned ${response.status}`);
  },
  async onEvent() {},
  async onWorkflowEnd() {}
};
import { appointments } from "@/data/appointments";
import type { IntegrationAdapter } from "@/lib/integrations/types";

function getGuildTriggerUrl() {
  return process.env.GUILD_API_TRIGGER_URL;
}

function getGuildBasicCredential() {
  return process.env.GUILD_API_KEY;
}

function createBasicAuthorization(credential: string) {
  return `Basic ${Buffer.from(credential, "utf8").toString("base64")}`;
}

export const guildAdapter: IntegrationAdapter = {
  name: "guild",
  isEnabled: () => Boolean(getGuildTriggerUrl() && getGuildBasicCredential()),
  async onWorkflowStart(ctx) {
    const triggerUrl = getGuildTriggerUrl();
    const credential = getGuildBasicCredential();
    if (!triggerUrl || !credential) return;

    const slot = appointments.find((appointment) => appointment.id === ctx.slotId);
    if (!slot) return;

    const response = await fetch(triggerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: createBasicAuthorization(credential)
      },
      body: JSON.stringify({
        slotId: slot.id,
        appointmentType: slot.appointmentType,
        startTime: slot.startTime,
        clinician: slot.clinician
      })
    });

    if (!response.ok) throw new Error(`Guild API trigger returned ${response.status}`);
  },
  async onEvent() {},
  async onWorkflowEnd() {}
};
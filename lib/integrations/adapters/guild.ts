import { appointments } from "@/data/appointments";
import type { IntegrationAdapter } from "@/lib/integrations/types";

export const guildAdapter: IntegrationAdapter = {
  name: "guild",
  isEnabled: () => Boolean(process.env.GUILD_TRIGGER_WEBHOOK_URL),
  async onWorkflowStart(ctx) {
    const webhookUrl = process.env.GUILD_TRIGGER_WEBHOOK_URL;
    if (!webhookUrl) return;
    const slot = appointments.find((appointment) => appointment.id === ctx.slotId);
    if (!slot) return;

    // TODO(Guild): confirm whether a direct webhook Trigger requires an envelope,
    // signature, or additional headers. The public triggers page did not expose
    // a request schema, so this sends only the documented cancellation payload.
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slotId: slot.id,
        appointmentType: slot.appointmentType,
        startTime: slot.startTime,
        clinician: slot.clinician
      })
    });
    if (!response.ok) throw new Error(`Guild trigger returned ${response.status}`);
  },
  async onEvent() {},
  async onWorkflowEnd() {}
};

import { actianAdapter } from "@/lib/integrations/adapters/actian";
import { bandAdapter } from "@/lib/integrations/adapters/band";
import { guildAdapter } from "@/lib/integrations/adapters/guild";
import { replayAdapter } from "@/lib/integrations/adapters/replay";
import type { IntegrationAdapter, IntegrationName } from "@/lib/integrations/types";

export const serverAdapters: IntegrationAdapter[] = [guildAdapter, bandAdapter, actianAdapter, replayAdapter];

export function getServerAdapter(name: IntegrationName) {
  return serverAdapters.find((adapter) => adapter.name === name);
}

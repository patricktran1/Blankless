import { NextResponse } from "next/server";
import { dispatchToEnabledAdapters } from "@/lib/integrations";
import { getServerAdapter } from "@/lib/integrations/server";
import type { IntegrationDispatchPayload, IntegrationName } from "@/lib/integrations/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SUPPORTED = new Set<IntegrationName>(["guild", "band", "actian"]);

export async function POST(request: Request, { params }: { params: { adapter: string } }) {
  const name = params.adapter as IntegrationName;
  if (!SUPPORTED.has(name)) return NextResponse.json({ ok: false, error: "unknown_adapter" }, { status: 404 });
  try {
    const payload = await request.json() as IntegrationDispatchPayload;
    const adapter = getServerAdapter(name);
    if (!adapter || !adapter.isEnabled()) return NextResponse.json({ ok: true, enabled: false }, { status: 202 });
    await dispatchToEnabledAdapters([adapter], payload.action, payload);
    return NextResponse.json({ ok: true, enabled: true }, { status: 202 });
  } catch (error) {
    console.warn(`[${name}] integration route failed`, error);
    return NextResponse.json({ ok: true, enabled: true, delivered: false }, { status: 202 });
  }
}

"use client";

import { TriangleAlert } from "lucide-react";
import { useDemoStore } from "@/lib/store";

export function EscalationBanner() {
  const state = useDemoStore((store) => store.state);
  if (state !== "escalated") return null;
  return <div role="alert" className="mt-5 flex w-full items-center gap-3 rounded-2xl border border-canceled/30 bg-canceled/10 px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm">
    <TriangleAlert className="shrink-0" size={20}/>
    <span>Recovery paused — no automated action taken. Escalated for staff review.</span>
  </div>;
}

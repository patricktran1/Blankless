"use client";
import { Clock3, MousePointerClick, Stethoscope, TimerReset, WalletCards } from "lucide-react";
import { useDemoStore } from "@/lib/store";
const items = [
  ["fillTime","Fill time",Clock3], ["attempts","Attempts",MousePointerClick], ["staffActionsAvoided","Staff actions avoided",TimerReset], ["recoveredMinutes","Capacity recovered",Stethoscope], ["revenue","Revenue est.",WalletCards]
] as const;
export function MetricsStrip() {
  const metrics = useDemoStore((s) => s.metrics);
  return <div className="grid grid-cols-2 gap-3 md:grid-cols-5">{items.map(([key,label,Icon]) => <div key={key} className="rounded-2xl border border-black/5 bg-white/80 p-3 shadow-sm"><div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400"><Icon size={14}/>{label}</div><p className="mt-2 text-xl font-black">{key === "revenue" ? `$${metrics[key]}` : key === "recoveredMinutes" ? `${metrics[key]} min` : metrics[key]}</p></div>)}</div>;
}

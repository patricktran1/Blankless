"use client";
import { Activity, Clock3, ShieldCheck } from "lucide-react";
import { useDemoStore } from "@/lib/store";
import { Panel } from "./Panel";

export function CommandCenter() {
  const { state, activeSlotId, appointments, activeCandidateId, patients, policy, running, simTime } = useDemoStore();
  const slot = appointments.find((a) => a.id === activeSlotId);
  const active = patients.find((p) => p.id === activeCandidateId);
  return <Panel title="Recovery Command" eyebrow="Autonomous workflow">
    <div className="flex items-center justify-between rounded-2xl bg-ink p-4 text-white">
      <div><p className="text-xs uppercase tracking-widest text-white/70">System</p><p className="mt-1 flex items-center gap-2 font-semibold"><Activity size={17} className={running ? "animate-pulse text-emerald-300" : "text-white/70"}/>{running ? "RECOVERING" : "ARMED"}</p></div>
      <div className="text-right"><p className="text-xs text-white/70">Policy</p><p className="font-mono font-semibold">{policy.id.replace("policy-", "v")}</p></div>
    </div>
    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
      <div className="rounded-2xl bg-slate-50 p-3"><p className="text-xs text-slate-600">Workflow state</p><p className="mt-1 font-semibold capitalize">{state.replaceAll("_"," ")}</p><p className="mt-1 flex items-center gap-1.5 font-mono text-xs text-slate-600"><Clock3 size={13}/>{simTime}</p></div>
      <div className="rounded-2xl bg-slate-50 p-3"><p className="text-xs text-slate-600">Open slot</p><p className="mt-1 font-semibold">{slot ? `${slot.day} ${slot.startTime}` : "Awaiting signal"}</p></div>
    </div>
    <div className="mt-3 rounded-2xl border border-teal/15 bg-teal/5 p-3 text-sm"><p className="flex items-center gap-2 font-semibold text-teal"><ShieldCheck size={16}/> Active candidate</p><p className="mt-1 text-slate-700">{active?.name ?? "None"}</p></div>
  </Panel>;
}

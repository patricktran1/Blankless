"use client";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useDemoStore } from "@/lib/store";
import { Panel } from "./Panel";

export function RankingPanel() {
  const candidates = useDemoStore((s) => s.candidates);
  const active = useDemoStore((s) => s.activeCandidateId);
  const [open, setOpen] = useState<string | null>(null);
  return <Panel title="Candidate Ranking" eyebrow="Transparent scoring">
    <div className="space-y-2">
      {candidates.length === 0 && <p className="rounded-2xl border border-dashed p-5 text-center text-sm text-slate-600">No ranking yet.</p>}
      {candidates.map((candidate, index) => <button key={candidate.patient.id} onClick={() => setOpen(open === candidate.patient.id ? null : candidate.patient.id)} className={`w-full rounded-2xl border p-3 text-left transition ${active === candidate.patient.id ? "border-teal bg-teal/5" : "border-slate-100 bg-slate-50/70 hover:border-slate-200"}`}>
        <div className="flex items-center gap-3"><span className="grid h-7 w-7 place-items-center rounded-full bg-white text-xs font-black shadow-sm">{index+1}</span><div><p className="text-sm font-semibold">{candidate.patient.name}</p><p className="text-[11px] text-slate-600">{candidate.policyVersion.replace("policy-", "Policy ")}</p></div><span className="ml-auto text-2xl font-black text-teal">{candidate.score}</span><ChevronDown size={15} className={open === candidate.patient.id ? "rotate-180" : ""}/></div>
        {open === candidate.patient.id && <div className="mt-3 grid grid-cols-2 gap-1 border-t pt-3 text-[11px] text-slate-600">{Object.entries(candidate.breakdown).map(([key,value]) => <div key={key} className="flex justify-between gap-2"><span>{key.replace(/([A-Z])/g," $1")}</span><b>{value}</b></div>)}</div>}
      </button>)}
    </div>
  </Panel>;
}

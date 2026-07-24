"use client";
import { motion } from "framer-motion";
import { BrainCircuit } from "lucide-react";
import { useDemoStore } from "@/lib/store";
import { Panel } from "./Panel";

export function LearningPanel() {
  const { policy, previousPolicy, comparison } = useDemoStore();
  const entries = Object.entries(policy.weights);
  return <Panel title="Learning Policy" eyebrow="Versioned heuristic">
    <div className="mb-4 flex items-start gap-3 rounded-2xl bg-violet-50 p-3"><BrainCircuit className="mt-0.5 text-violet-600" size={18}/><div><p className="text-sm font-semibold">{policy.id.replace("policy-", "Policy ").toUpperCase()}</p><p className="mt-1 text-xs leading-relaxed text-slate-600">{policy.reason}</p></div></div>
    <div className="space-y-2">{entries.map(([key,value]) => { const old = previousPolicy?.weights[key as keyof typeof policy.weights]; const delta = old === undefined ? 0 : value-old; return <div key={key}><div className="mb-1 flex justify-between text-[11px]"><span>{key.replace(/([A-Z])/g," $1")}</span><span className="font-bold">{value}% {delta !== 0 && <b className="text-slate-700">({delta>0?"+":""}{delta})</b>}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><motion.div initial={{width:0}} animate={{width:`${value}%`}} className="h-full rounded-full bg-teal"/></div></div>})}</div>
    {comparison && <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="mt-4 rounded-2xl border border-recovered/30 bg-recovered/10 p-3 text-sm font-semibold text-slate-800">{comparison}</motion.div>}
  </Panel>;
}

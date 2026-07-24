"use client";
import { motion } from "framer-motion";
import { Bot, Radar, Shield, Sparkles, Workflow, Send } from "lucide-react";
import { useEffect, useRef } from "react";
import { useDemoStore } from "@/lib/store";
import { Panel } from "./Panel";

const icons = { "Gap Scout":Radar, "Candidate Matcher":Bot, "Policy Guard":Shield, "Outreach Agent":Send, "Recovery Coordinator":Workflow, "Learning Agent":Sparkles };
export function Timeline() {
  const events = useDemoStore((s) => s.timeline);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior:"smooth" }); }, [events]);
  return <Panel title="Agent Activity" eyebrow="Complete audit trail" className="lg:col-span-2">
    <div ref={ref} className="h-[390px] space-y-3 overflow-y-auto pr-1">
      {events.length === 0 && <div className="grid h-full place-items-center rounded-2xl border border-dashed border-slate-200 text-center text-sm text-slate-600">Timeline is quiet.<br/>Play a scenario to wake the agents.</div>}
      {events.map((item) => { const Icon = icons[item.persona]; return <motion.div key={item.id} initial={{opacity:0,x:12}} animate={{opacity:1,x:0}} className={`rounded-2xl border p-3 ${item.severity === "warning" ? "border-amber/30 bg-amber/10" : item.severity === "success" ? "border-recovered/20 bg-recovered/5" : item.severity === "danger" ? "border-canceled/20 bg-canceled/5" : "border-slate-100 bg-slate-50/70"}`}>
        <div className="flex items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded-full bg-white shadow-sm"><Icon size={14}/></span><p className="text-xs font-bold">{item.persona}</p><span className="ml-auto font-mono text-[10px] text-slate-600">{item.simTimestamp}</span></div>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">{item.message}</p>
      </motion.div>; })}
    </div>
  </Panel>;
}

"use client";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays } from "lucide-react";
import { useDemoStore } from "@/lib/store";
import { Panel } from "./Panel";

const styles = {
  confirmed: "border-slate-200 bg-slate-50 text-slate-700",
  canceled: "border-canceled/30 bg-canceled/10 text-canceled",
  recovering: "border-amber/40 bg-amber/10 text-amber",
  recovered: "border-recovered/40 bg-recovered/10 text-recovered",
  unfilled: "border-slate-200 bg-white text-slate-500"
};

export function SchedulePanel() {
  const appointments = useDemoStore((s) => s.appointments).filter((a) => a.day === "Tue");
  return <Panel title="Tuesday Schedule" eyebrow="Live clinic day" className="lg:row-span-2">
    <div className="mb-3 flex items-center gap-2 text-sm text-slate-500"><CalendarDays size={16}/> Dr. Rivera · Room 2</div>
    <div className="space-y-2">
      <AnimatePresence initial={false}>
        {appointments.map((appointment) => <motion.div layout key={appointment.id} initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} className={`rounded-2xl border p-3 transition ${styles[appointment.status]}`}>
          <div className="flex items-center justify-between gap-3"><span className="font-mono text-sm font-semibold">{appointment.startTime}</span><span className="text-[10px] font-black uppercase tracking-wider">{appointment.status}</span></div>
          <p className="mt-1 text-sm font-semibold">{appointment.patientName}</p>
          <p className="text-xs opacity-70">{appointment.appointmentType.replaceAll("-", " ")} · {appointment.duration} min</p>
        </motion.div>)}
      </AnimatePresence>
    </div>
  </Panel>;
}

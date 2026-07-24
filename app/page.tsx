"use client";
import { Play, RotateCcw, Sparkles } from "lucide-react";
import { CommandCenter } from "@/components/CommandCenter";
import { EscalationBanner } from "@/components/EscalationBanner";
import { LearningPanel } from "@/components/LearningPanel";
import { MetricsStrip } from "@/components/MetricsStrip";
import { QABadge } from "@/components/QABadge";
import { RankingPanel } from "@/components/RankingPanel";
import { SchedulePanel } from "@/components/SchedulePanel";
import { Timeline } from "@/components/Timeline";
import { playScenario, resetDemo } from "@/lib/engine/coordinator";
import { useDemoStore } from "@/lib/store";

const completedCaption = "Completed — press Reset to replay";
const scenario2LockedCaption = "Runs after Scenario 1";

export default function Home() {
  const { running, policy, metrics } = useDemoStore();
  const scenario2Locked = policy.id !== "policy-v2";
  const scenario1Completed = metrics.recovered > 0;
  const scenario1Disabled = running || scenario1Completed;
  const showScenario1CompletedCaption = scenario1Completed && !running;
  const scenario2Disabled = running || scenario2Locked || metrics.recovered !== 1;
  const scenario1DisabledReason = running ? "Scenario currently running" : scenario1Completed ? completedCaption : undefined;
  const scenario2DisabledReason = running
    ? "Scenario currently running"
    : scenario2Locked
      ? scenario2LockedCaption
      : metrics.recovered !== 1
        ? completedCaption
        : undefined;

  return <main className="mx-auto min-h-screen max-w-[1500px] px-4 pt-6 pb-60 sm:pb-28 md:px-8">
    <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div><div className="flex items-center gap-2 text-teal"><Sparkles size={20}/><span className="text-xs font-black uppercase tracking-[.24em]">Blankless</span></div><h1 className="mt-2 text-4xl font-black tracking-[-.045em] md:text-6xl">No blank slots.<br/><span className="text-teal">No wasted capacity.</span></h1><p className="mt-3 max-w-2xl text-base text-slate-600">Autonomous appointment recovery for Sunrise Dermatology.</p></div>
      <div className="flex items-center gap-2 rounded-full border border-recovered/20 bg-recovered/10 px-4 py-2 text-sm font-bold text-slate-700"><span className="h-2 w-2 animate-pulse rounded-full bg-recovered"/>Autonomous recovery: ARMED</div>
    </header>
    <MetricsStrip/>
    <EscalationBanner/>
    <div className="mt-5 grid gap-5 lg:grid-cols-[.8fr_1fr_1fr]">
      <SchedulePanel/>
      <CommandCenter/>
      <LearningPanel/>
      <Timeline/>
      <RankingPanel/>
    </div>
    <div className="sticky bottom-4 z-20 mx-auto mt-6 flex w-full flex-col items-stretch justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl sm:w-fit sm:flex-row sm:flex-wrap sm:items-center">
      <div className="flex w-full flex-col items-stretch gap-1 sm:w-auto sm:items-center">
        <button disabled={scenario1Disabled} aria-disabled={scenario1Disabled} title={scenario1DisabledReason} onClick={() => playScenario(1)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-700 sm:w-auto"><Play size={15}/> Play Scenario 1</button>
        {showScenario1CompletedCaption && <span className="text-center text-[11px] font-semibold text-slate-600">{completedCaption}</span>}
      </div>
      <div className="flex w-full flex-col items-stretch gap-1 sm:w-auto sm:items-center">
        <button disabled={scenario2Disabled} aria-disabled={scenario2Disabled} title={scenario2DisabledReason} onClick={() => playScenario(2)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-700 sm:w-auto"><Play size={15}/> Play Scenario 2</button>
        {scenario2Locked && <span className="text-center text-[11px] font-semibold text-slate-600">{scenario2LockedCaption}</span>}
      </div>
      <button onClick={resetDemo} className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold sm:w-auto"><RotateCcw size={15}/> Reset</button>
    </div>
    <footer className="mt-6 flex flex-col items-start justify-between gap-3 border-t py-5 text-xs text-slate-600 sm:flex-row sm:items-center"><span>Deterministic FSM · Versioned policy · Single-fill lock</span><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-slate-100 px-3 py-1.5 font-semibold">Local fallback active</span><QABadge/></div></footer>
  </main>;
}

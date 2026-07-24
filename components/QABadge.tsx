"use client";

export function QABadge() {
  const runUrl = process.env.NEXT_PUBLIC_REPLAY_RUN_URL;
  if (!runUrl) return null;
  return <a href={runUrl} target="_blank" rel="noreferrer" className="rounded-full bg-slate-100 px-3 py-1.5 font-semibold text-slate-500 transition hover:bg-slate-200 hover:text-slate-700">QA verified via Replay</a>;
}

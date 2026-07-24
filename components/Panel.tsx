import type { ReactNode } from "react";
export function Panel({ title, eyebrow, children, className = "" }: { title: string; eyebrow?: string; children: ReactNode; className?: string }) {
  return <section className={`rounded-3xl border border-black/5 bg-white/85 p-5 shadow-panel backdrop-blur ${className}`}>
    {eyebrow && <p className="mb-1 text-[11px] font-bold uppercase tracking-[.18em] text-teal">{eyebrow}</p>}
    <h2 className="mb-4 text-lg font-semibold tracking-tight">{title}</h2>
    {children}
  </section>;
}

import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { HUD_ITEMS, SECONDARY_NODES, SYSTEM_NODES } from "../../lib/portfolio";
import type { SystemNode } from "../../types/portfolio";
import { CoreLabel, EngineeringCore } from "./EngineeringCore";
import { RecruiterAccess } from "./RecruiterAccess";

const CORE = { x: 50, y: 46 };

function NodeCard({ node, active, onActivate, onClear }: { node: SystemNode; active: boolean; onActivate: () => void; onClear: () => void }) {
  return (
    <Link
      to={node.path}
      onMouseEnter={onActivate}
      onMouseLeave={onClear}
      onFocus={onActivate}
      onBlur={onClear}
      aria-describedby={`${node.id}-descriptor`}
      className={`group block w-full border bg-surface/85 p-5 backdrop-blur-md transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${active ? "-translate-y-1 border-primary/70 bg-surface shadow-signal" : "border-border/70"}`}
    >
      <div className="flex items-center justify-between gap-3 font-mono text-[0.6rem] tracking-[0.18em]">
        <span className="text-primary">{node.index}</span>
        <span className={`flex items-center gap-2 ${node.status === "ONLINE" ? "text-primary" : "text-muted-foreground"}`}>
          <span className={`size-1.5 ${node.status === "ONLINE" ? "bg-primary shadow-signal" : "bg-muted-foreground"}`} />
          {node.status}
        </span>
      </div>
      <h3 className="mt-6 font-display text-xl font-bold tracking-[0.06em] lg:text-2xl">{node.label}</h3>
      <p id={`${node.id}-descriptor`} className="mt-2 font-mono text-[0.6rem] tracking-[0.16em] text-muted-foreground">{node.descriptor}</p>
      <div className={`grid overflow-hidden transition-all duration-300 ${active ? "mt-3 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <p className="min-h-0 text-[0.8rem] leading-6 text-muted-foreground">{node.description}</p>
      </div>
      <span className="mt-4 flex items-center gap-2 font-mono text-[0.6rem] tracking-[0.16em] text-muted-foreground transition group-hover:text-primary">
        OPEN SYSTEM <ArrowUpRight aria-hidden="true" className="size-3.5" />
      </span>
    </Link>
  );
}

export function CommandCenter({ reducedMotion }: { reducedMotion: boolean }) {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <section id="command-center" className="relative overflow-hidden bg-command py-20 sm:py-24" aria-labelledby="command-title">
      <div className="command-grid absolute inset-0 opacity-40" aria-hidden="true" />
      {!reducedMotion ? <div className="core-drift absolute inset-0 opacity-60" aria-hidden="true" /> : null}
      <div className="relative mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-10">
        <div className="grid gap-6 border-b border-border pb-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <p className="flex items-center gap-3 font-mono text-[0.65rem] tracking-[0.2em] text-primary"><span className="size-1.5 bg-primary shadow-signal" />DURAI SYSTEMS // COMMAND CENTER</p>
            <h2 id="command-title" className="mt-3 font-display text-4xl font-bold tracking-[0.04em] sm:text-6xl">COMMAND CENTER</h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">Select an engineering system. The profile record is live; further systems activate in later phases.</p>
          </div>
          <RecruiterAccess />
        </div>

        {/* HUD */}
        <dl className="mt-8 grid grid-cols-2 gap-px border border-border bg-border/70 lg:grid-cols-4">
          {HUD_ITEMS.map((item) => (
            <div key={item.label} className="min-w-0 bg-background/60 p-4 backdrop-blur-md">
              <dt className="font-mono text-[0.55rem] tracking-[0.18em] text-muted-foreground">{item.label}</dt>
              <dd className="mt-2 truncate font-mono text-[0.66rem] tracking-[0.12em] text-foreground">{item.value}</dd>
            </div>
          ))}
        </dl>

        {/* Desktop / tablet spatial stage */}
        <div className="relative mt-14 hidden h-[46rem] md:block" role="presentation">
          <svg className="absolute inset-0 size-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {SYSTEM_NODES.map((node) => (
              <line
                key={node.id}
                x1={CORE.x}
                y1={CORE.y}
                x2={node.x}
                y2={node.y}
                stroke="currentColor"
                strokeWidth={activeId === node.id ? 0.6 : 0.35}
                vectorEffect="non-scaling-stroke"
                strokeDasharray={activeId === node.id ? "none" : "2 2"}
                className={`transition-all duration-300 ${activeId === node.id ? "text-primary" : "text-primary/25"}`}
              />
            ))}
          </svg>
          <div className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2">
            <EngineeringCore active={Boolean(activeId)} reducedMotion={reducedMotion} />
            <CoreLabel />
          </div>
          {SYSTEM_NODES.map((node) => (
            <div key={node.id} className="absolute w-[15.5rem] -translate-x-1/2 -translate-y-1/2 lg:w-[17rem]" style={{ left: `${node.x}%`, top: `${node.y}%` }}>
              <NodeCard node={node} active={activeId === node.id} onActivate={() => setActiveId(node.id)} onClear={() => setActiveId(null)} />
            </div>
          ))}
        </div>

        {/* Mobile composition */}
        <div className="mt-12 md:hidden">
          <div className="grid place-items-center border border-border bg-surface/50 py-8">
            <EngineeringCore active={false} reducedMotion={reducedMotion} compact />
            <div className="mt-4 text-center">
              <p className="font-display text-base font-bold tracking-[0.16em]">DURAI B</p>
              <p className="mt-1 font-mono text-[0.58rem] tracking-[0.2em] text-primary">ENGINEERING CORE</p>
              <p className="mt-1 font-mono text-[0.56rem] tracking-[0.18em] text-muted-foreground">SYSTEM ONLINE</p>
            </div>
          </div>
          <ul className="mt-6 grid gap-3">
            {SYSTEM_NODES.map((node) => (
              <li key={node.id}>
                <NodeCard node={node} active={activeId === node.id} onActivate={() => setActiveId(node.id)} onClear={() => setActiveId(null)} />
              </li>
            ))}
          </ul>
        </div>

        {/* Secondary systems */}
        <div className="mt-12 border-t border-border pt-8">
          <p className="font-mono text-[0.6rem] tracking-[0.18em] text-muted-foreground">SECONDARY SYSTEMS</p>
          <ul className="mt-4 grid gap-px bg-border/70 sm:grid-cols-2 lg:grid-cols-4">
            {SECONDARY_NODES.map((node) => (
              <li key={node.id} className="bg-surface/70">
                <Link to={node.path} className="flex min-h-20 flex-col justify-center gap-1 p-4 transition hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <span className="font-mono text-[0.58rem] tracking-[0.18em] text-primary">{node.index} / {node.status}</span>
                  <span className="font-display text-sm font-bold tracking-[0.1em]">{node.label}</span>
                  <span className="font-mono text-[0.56rem] tracking-[0.14em] text-muted-foreground">{node.descriptor}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

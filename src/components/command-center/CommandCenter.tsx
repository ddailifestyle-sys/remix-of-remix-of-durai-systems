import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { SYSTEM_NODES } from "../../lib/portfolio";

export function CommandCenter() {
  return (
    <section id="command-center" className="relative overflow-hidden bg-command py-20 sm:py-28" aria-labelledby="command-title">
      <div className="command-grid absolute inset-0 opacity-40" aria-hidden="true" />
      <div className="relative mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-10">
        <div className="grid gap-8 border-b border-border pb-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div><p className="font-mono text-[0.65rem] tracking-[0.2em] text-primary">DURAI SYSTEM / COMMAND LAYER</p><h2 id="command-title" className="mt-3 font-display text-4xl font-bold tracking-[0.04em] sm:text-6xl">COMMAND CENTER</h2></div>
          <p className="max-w-md text-sm leading-6 text-muted-foreground lg:text-right">Select an engineering system. Detailed records will activate in future phases.</p>
        </div>
        <div className="system-map relative mt-12 grid gap-px bg-border md:grid-cols-2 lg:grid-cols-6">
          {SYSTEM_NODES.map((node, index) => (
            <Link key={node.id} to={node.path} className={`system-node group relative min-h-52 overflow-hidden bg-surface p-6 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:min-h-64 ${index < 2 ? "lg:col-span-2" : index < 4 ? "lg:col-span-2" : "lg:col-span-6 lg:min-h-44"}`}>
              <span className="font-mono text-[0.65rem] tracking-[0.18em] text-primary">{node.index} / {node.status}</span>
              <div className="mt-14 flex items-end justify-between gap-4 lg:mt-20"><div><h3 className="font-display text-2xl font-bold tracking-[0.06em]">{node.label}</h3><p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground opacity-80 transition group-hover:opacity-100">{node.description}</p></div><ArrowUpRight aria-hidden="true" className="size-5 shrink-0 text-muted-foreground transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-primary" /></div>
            </Link>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3 border-t border-border pt-6 font-mono text-[0.62rem] tracking-[0.16em] text-muted-foreground"><span>FUTURE SYSTEMS:</span>{["EDUCATION","CERTIFICATIONS","RESUME","CONTACT"].map(item => <span key={item}>{item}</span>)}</div>
      </div>
    </section>
  );
}
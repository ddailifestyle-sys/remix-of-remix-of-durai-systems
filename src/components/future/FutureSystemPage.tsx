import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SystemNavigation } from "../navigation/SystemNavigation";

export function FutureSystemPage({ index, title, description }: { index: string; title: string; description: string }) {
  return (
    <main className="min-h-dvh bg-background text-foreground">
      <SystemNavigation />
      <section className="relative grid min-h-[calc(100dvh-4rem)] place-items-center overflow-hidden bg-command px-5 py-16">
        <div className="command-grid absolute inset-0 opacity-30" aria-hidden="true" />
        <div className="relative w-full max-w-3xl border-y border-border py-12">
          <p className="font-mono text-[0.65rem] tracking-[0.2em] text-primary">SYSTEM {index} / FOUNDATION READY</p>
          <h1 className="mt-5 font-display text-5xl font-bold tracking-[0.04em] sm:text-7xl">{title}</h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground">{description}</p>
          <p className="mt-4 font-mono text-[0.68rem] tracking-[0.12em] text-muted-foreground">DETAILED MODULE SCHEDULED FOR A LATER PHASE</p>
          <Link to="/" hash="command-center" className="mt-10 inline-flex min-h-11 items-center gap-3 border border-border px-4 font-mono text-[0.68rem] tracking-[0.14em] transition hover:border-primary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <ArrowLeft aria-hidden="true" className="size-4" />COMMAND CENTER
          </Link>
        </div>
      </section>
    </main>
  );
}

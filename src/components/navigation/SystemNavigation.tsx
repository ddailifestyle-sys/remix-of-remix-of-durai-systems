import { Link } from "@tanstack/react-router";
import { NAV_ITEMS } from "../../lib/portfolio";

export function SystemNavigation() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-border/70 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto grid h-16 max-w-[1500px] grid-cols-[minmax(0,1fr)_auto] items-center px-4 sm:px-6 lg:px-10">
        <Link to="/" aria-label="Durai B home" className="group flex min-w-0 items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <span className="grid size-8 shrink-0 place-items-center border border-primary/60 font-display text-sm font-bold text-primary">DB</span>
          <span className="min-w-0 truncate font-display text-sm font-bold tracking-[0.16em]">DURAI</span>
        </Link>
        <nav aria-label="Primary navigation" className="hidden items-center gap-7 lg:flex">
          {NAV_ITEMS.map((item) => <Link key={item.path} to={item.path} className="font-mono text-[0.68rem] tracking-[0.14em] text-muted-foreground transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{item.label}</Link>)}
          <Link to="/resume" className="border-l border-border pl-7 font-mono text-[0.68rem] tracking-[0.14em] text-foreground transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">RESUME</Link>
        </nav>
        <Link to="/resume" className="min-h-11 border border-border px-4 py-3 font-mono text-[0.65rem] tracking-[0.14em] text-foreground lg:hidden">RESUME</Link>
      </div>
    </header>
  );
}
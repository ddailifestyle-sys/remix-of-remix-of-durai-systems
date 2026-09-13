export function EngineeringCore({ active, reducedMotion, compact = false }: { active: boolean; reducedMotion: boolean; compact?: boolean }) {
  const animate = !reducedMotion;
  return (
    <div className={`relative grid place-items-center ${compact ? "size-44" : "size-56 lg:size-72"}`} aria-hidden="true">
      <div className={`absolute inset-0 rounded-full border border-primary/25 ${animate ? "core-spin-slow" : ""}`} style={{ borderStyle: "dashed" }} />
      <div className={`absolute inset-[12%] rounded-full border border-border ${animate ? "core-spin-reverse" : ""}`} />
      <div className={`absolute inset-[24%] rounded-full border border-primary/40 ${animate ? "core-spin-medium" : ""}`} />
      <div className={`absolute inset-[30%] rounded-full bg-primary/5 transition-all duration-500 ${active ? "inset-[27%] bg-primary/15" : ""}`} />
      <div
        className={`absolute inset-[38%] rounded-full bg-primary/25 blur-xl transition-opacity duration-500 ${active ? "opacity-100" : "opacity-60"} ${animate ? "core-pulse" : ""}`}
      />
      <div className="absolute inset-[43%] rounded-full bg-primary/80 shadow-signal" />
      {animate ? <div className="core-scan absolute inset-[6%] rounded-full" /> : null}
    </div>
  );
}

export function CoreLabel() {
  return (
    <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
      <div className="translate-y-[7.5rem] lg:translate-y-[10.5rem]">
        <p className="font-display text-lg font-bold tracking-[0.16em] text-foreground">DURAI B</p>
        <p className="mt-1 font-mono text-[0.6rem] tracking-[0.2em] text-primary">ENGINEERING CORE</p>
        <p className="mt-1 font-mono text-[0.58rem] tracking-[0.18em] text-muted-foreground">SYSTEM ONLINE</p>
      </div>
    </div>
  );
}

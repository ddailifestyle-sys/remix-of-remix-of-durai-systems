import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { BOOT_CHECKS } from "../../lib/portfolio";
import { useReducedMotion } from "../../hooks/use-reduced-motion";

interface BootSequenceProps { onComplete: () => void; }

export function BootSequence({ onComplete }: BootSequenceProps) {
  const [visibleChecks, setVisibleChecks] = useState(0);
  const [progress, setProgress] = useState(0);
  const reducedMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion) {
      const timer = window.setTimeout(onComplete, 350);
      return () => window.clearTimeout(timer);
    }
    let frame = 0;
    const started = performance.now();
    const duration = 2800;
    const tick = (now: number) => {
      const ratio = Math.min((now - started) / duration, 1);
      setProgress(Math.round(ratio * 100));
      setVisibleChecks(Math.min(BOOT_CHECKS.length, Math.floor(ratio * (BOOT_CHECKS.length + 1))));
      if (ratio < 1) frame = requestAnimationFrame(tick);
      else window.setTimeout(onComplete, 260);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [onComplete, reducedMotion]);

  useEffect(() => {
    if (!rootRef.current || reducedMotion) return;
    let context: { revert: () => void } | undefined;
    void import("gsap").then(({ gsap }) => {
      if (!rootRef.current) return;
      context = gsap.context(() => gsap.fromTo("[data-boot-mark]", { opacity: 0, scaleX: 0.75 }, { opacity: 1, scaleX: 1, duration: 0.5, stagger: 0.08, ease: "power2.out" }), rootRef.current);
    });
    return () => context?.revert();
  }, [reducedMotion]);

  return (
    <AnimatePresence>
      <motion.div ref={rootRef} className="fixed inset-0 z-[100] grid min-h-dvh place-items-center overflow-hidden bg-boot px-5" exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? 0 : 0.5 }} role="status" aria-live="polite" aria-label="Durai Systems initializing">
        <div className="boot-grid absolute inset-0 opacity-45" aria-hidden="true" />
        <button type="button" onClick={onComplete} className="absolute right-5 top-5 min-h-11 px-3 font-mono text-[0.68rem] tracking-[0.2em] text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:right-8 sm:top-8">SKIP</button>
        <div className="relative w-full max-w-xl">
          <div className="mb-12 flex items-center gap-4" data-boot-mark><span className="h-px flex-1 bg-primary/50" /><span className="font-mono text-[0.65rem] tracking-[0.25em] text-primary">SYSTEM / 01</span></div>
          <p className="font-display text-sm font-bold tracking-[0.24em] text-muted-foreground" data-boot-mark>DURAI SYSTEMS</p>
          <h1 className="mt-3 font-display text-2xl font-bold tracking-[0.08em] text-foreground sm:text-4xl" data-boot-mark>INITIALIZING CORE SYSTEM</h1>
          <div className="mt-9 space-y-3 border-y border-border py-6">
            {BOOT_CHECKS.map((check, index) => (
              <div key={check.label} className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 font-mono text-[0.68rem] tracking-[0.12em]">
                <span className={index < visibleChecks ? "text-foreground" : "text-muted-foreground/50"}>{check.label}</span>
                <span className={index < visibleChecks ? "text-primary" : "text-muted-foreground/30"}>{index < visibleChecks ? check.value : "PENDING"}</span>
              </div>
            ))}
          </div>
          <div className="mt-6"><div className="flex justify-between font-mono text-[0.65rem] tracking-[0.14em] text-muted-foreground"><span>SYSTEM CHECK</span><span>{progress}%</span></div><div className="mt-3 h-px bg-border"><div className="h-px origin-left bg-primary shadow-signal" style={{ transform: `scaleX(${progress / 100})` }} /></div></div>
          <motion.div className="mt-10" animate={{ opacity: progress > 82 ? 1 : 0 }}><p className="font-mono text-[0.65rem] tracking-[0.18em] text-primary">ENGINEER PROFILE FOUND</p><p className="mt-2 font-display text-3xl font-bold tracking-[0.1em]">DURAI B</p></motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
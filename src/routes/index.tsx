import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { BootSequence } from "../components/boot/BootSequence";
import { CommandCenter } from "../components/command-center/CommandCenter";
import { HeroSection } from "../components/hero/HeroSection";
import { SystemNavigation } from "../components/navigation/SystemNavigation";
import { useReducedMotion } from "../hooks/use-reduced-motion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Durai B — Backend Engineer | Cloud Developer | IoT Systems Engineer" },
      { name: "description", content: "Portfolio of Durai B, a Backend Engineer, Cloud Developer and IoT Systems Engineer building scalable backend systems, cloud-native applications, and intelligent IoT solutions." },
      { property: "og:title", content: "Durai B — Backend Engineer" },
      { property: "og:description", content: "Backend, cloud-native and intelligent IoT systems by Durai B." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

function Index() {
  const [booting, setBooting] = useState(false);
  const [ready, setReady] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const seen = window.sessionStorage.getItem("durai-system-booted") === "true";
    setBooting(!seen && !reducedMotion);
    setReady(true);
  }, [reducedMotion]);

  const completeBoot = useCallback(() => {
    window.sessionStorage.setItem("durai-system-booted", "true");
    setBooting(false);
  }, []);

  return (
    <main className="min-h-dvh bg-background text-foreground">
      {ready && booting ? <BootSequence onComplete={completeBoot} /> : null}
      <SystemNavigation />
      <HeroSection reducedMotion={reducedMotion} />
      <CommandCenter reducedMotion={reducedMotion} />
      <footer className="border-t border-border bg-background px-5 py-7 font-mono text-[0.62rem] tracking-[0.15em] text-muted-foreground sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-3 sm:flex-row"><span>DURAI SYSTEMS / PHASE 02</span><span>ENGINEERING CORE ONLINE</span></div>
      </footer>
    </main>
  );
}

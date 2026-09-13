import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { SystemNavigation } from "../components/navigation/SystemNavigation";
import { SkillTree } from "../components/skill-tree/SkillTree";
import { useReducedMotion } from "../hooks/use-reduced-motion";

const description =
  "Engineering skill tree of Durai B — programming languages, backend, frontend, database, cloud and DevOps, IoT and embedded, plus tools and platforms.";

export const Route = createFileRoute("/skills")({
  head: () => ({
    meta: [
      { title: "Engineering Skill Tree — Durai B" },
      { name: "description", content: description },
      { property: "og:title", content: "Engineering Skill Tree — Durai B" },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/skills" }],
  }),
  component: SkillsPage,
});

function SkillsPage() {
  const reducedMotion = useReducedMotion();
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") navigate({ to: "/", hash: "command-center" });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <SystemNavigation />

      <section className="relative overflow-hidden px-5 pt-24 pb-20 sm:px-8 lg:px-10" aria-labelledby="skills-title">
        <div className="command-grid absolute inset-0 opacity-25" aria-hidden="true" />
        <div className="relative mx-auto max-w-[1500px]">
          <div className="flex flex-wrap items-center gap-3 font-mono text-[0.6rem] tracking-[0.18em] text-muted-foreground">
            <span className="text-primary">SYSTEM 02</span>
            <span className="h-px w-8 bg-border" />
            <span>DURAI SYSTEMS // ENGINEERING CORE</span>
          </div>

          <h1 id="skills-title" className="mt-6 font-display text-5xl font-bold tracking-[0.04em] sm:text-7xl">
            SKILL TREE
          </h1>
          <p className="mt-4 font-mono text-[0.7rem] tracking-[0.14em] text-muted-foreground">TECHNOLOGY STACK</p>

          <Link
            to="/"
            hash="command-center"
            className="mt-8 inline-flex min-h-11 items-center gap-3 border border-border px-4 font-mono text-[0.66rem] tracking-[0.14em] transition hover:border-primary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            COMMAND CENTER
          </Link>

          <div className="mt-10">
            <SkillTree reducedMotion={reducedMotion} />
          </div>

          <div className="mt-12 border-t border-border pt-8">
            <Link
              to="/projects"
              className="inline-flex min-h-11 items-center gap-3 border border-border px-4 font-mono text-[0.66rem] tracking-[0.14em] transition hover:border-primary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              PROJECT LAB →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

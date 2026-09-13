import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SystemNavigation } from "../components/navigation/SystemNavigation";
import { ProjectLab } from "../components/project-lab/ProjectLab";
import { ProjectMatrix } from "../components/project-lab/ProjectMatrix";
import { useReducedMotion } from "../hooks/use-reduced-motion";

const description =
  "Project Lab — five deployed engineering systems by Durai B, spanning full-stack, AI-assisted healthcare, event, IoT simulation and campus ERP platforms.";

export const Route = createFileRoute("/projects/")({
  head: () => ({
    meta: [
      { title: "Project Lab — Durai B" },
      { name: "description", content: description },
      { property: "og:title", content: "Project Lab — Durai B" },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/projects" }],
  }),
  component: ProjectLabPage,
});

function ProjectLabPage() {
  const reducedMotion = useReducedMotion();

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <SystemNavigation />

      <section className="relative overflow-hidden px-5 pt-24 pb-20 sm:px-8 lg:px-10" aria-labelledby="lab-title">
        <div className="command-grid absolute inset-0 opacity-25" aria-hidden="true" />
        <div className="relative mx-auto max-w-[1500px]">
          <div className="flex flex-wrap items-center gap-3 font-mono text-[0.6rem] tracking-[0.18em] text-muted-foreground">
            <span className="text-primary">SYSTEM 03</span>
            <span className="h-px w-8 bg-border" />
            <span>DURAI SYSTEMS // PROJECT LAB</span>
            <span className="flex items-center gap-2 text-primary">
              <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
              PROJECT DATABASE ONLINE
            </span>
          </div>

          <h1 id="lab-title" className="mt-6 font-display text-5xl font-bold tracking-[0.04em] sm:text-7xl">
            PROJECT LAB
          </h1>
          <p className="mt-4 font-mono text-[0.7rem] tracking-[0.14em] text-muted-foreground">
            SELECT AN ENGINEERING SYSTEM TO INSPECT
          </p>

          <Link
            to="/"
            hash="command-center"
            className="mt-8 inline-flex min-h-11 items-center gap-3 border border-border px-4 font-mono text-[0.66rem] tracking-[0.14em] transition hover:border-primary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            COMMAND CENTER
          </Link>

          <div className="mt-10">
            <ProjectLab reducedMotion={reducedMotion} />
          </div>

          <ProjectMatrix />

          <div className="mt-12 border-t border-border pt-8">
            <Link
              to="/skills"
              className="inline-flex min-h-11 items-center gap-3 border border-border px-4 font-mono text-[0.66rem] tracking-[0.14em] transition hover:border-primary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              ENGINEERING SKILL TREE →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

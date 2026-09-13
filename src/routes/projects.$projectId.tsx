import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { SystemNavigation } from "../components/navigation/SystemNavigation";
import { ProjectFlowVisualization } from "../components/project-lab/ProjectVisualization";
import { getProject, PROJECT_EMPTY_STATE } from "../lib/projects";
import { useReducedMotion } from "../hooks/use-reduced-motion";

export const Route = createFileRoute("/projects/$projectId")({
  loader: ({ params }) => {
    const project = getProject(params.projectId);
    if (!project) throw notFound();
    return { project };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "System not found — Durai B" }, { name: "robots", content: "noindex" }] };
    }
    const { project } = loaderData;
    const title = `${project.name} — Durai B Portfolio`;
    return {
      meta: [
        { title },
        { name: "description", content: project.description },
        { property: "og:title", content: title },
        { property: "og:description", content: project.description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `/projects/${project.id}` }],
    };
  },
  notFoundComponent: ProjectNotFound,
  component: ProjectDetailPage,
});

function ProjectNotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-background px-5 text-foreground">
      <div className="text-center">
        <p className="font-mono text-[0.62rem] tracking-[0.18em] text-primary">SYSTEM NOT FOUND</p>
        <h1 className="mt-4 font-display text-3xl font-bold tracking-[0.05em]">UNKNOWN SYSTEM</h1>
        <Link to="/projects" className="mt-8 inline-flex min-h-11 items-center border border-border px-4 font-mono text-[0.66rem] tracking-[0.14em] hover:border-primary/60 hover:text-primary">
          RETURN TO PROJECT LAB
        </Link>
      </div>
    </main>
  );
}

function ProjectDetailPage() {
  const { project } = Route.useLoaderData();
  const reducedMotion = useReducedMotion();
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(!reducedMotion);

  useEffect(() => {
    if (reducedMotion) {
      setScanning(false);
      return;
    }
    setScanning(true);
    const timer = window.setTimeout(() => setScanning(false), 700);
    return () => window.clearTimeout(timer);
  }, [project.id, reducedMotion]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") navigate({ to: "/projects" });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <SystemNavigation />

      {scanning ? (
        <div
          className="fixed inset-0 z-30 grid place-items-center bg-boot/90 backdrop-blur-sm"
          role="status"
          aria-live="polite"
        >
          <div className="w-full max-w-sm border border-primary/40 bg-background/80 p-6 font-mono text-[0.62rem] tracking-[0.16em]">
            <p className="text-primary">SYSTEM IDENTIFIED</p>
            <p className="mt-4 text-muted-foreground">PROJECT</p>
            <p className="text-foreground">{project.name}</p>
            <p className="mt-3 text-muted-foreground">CATEGORY</p>
            <p className="text-foreground">{project.category}</p>
            <p className="mt-3 text-muted-foreground">DEPLOYMENT</p>
            <p className="text-primary">AVAILABLE</p>
            <span className="mt-5 block h-px w-full origin-left bg-primary/70 scan-line" aria-hidden="true" />
          </div>
        </div>
      ) : null}

      <section className="relative overflow-hidden px-5 pt-24 pb-20 sm:px-8 lg:px-10" aria-labelledby="project-title">
        <div className="command-grid absolute inset-0 opacity-25" aria-hidden="true" />
        <div className="relative mx-auto max-w-[1500px]">
          <div className="flex flex-wrap items-center gap-3 font-mono text-[0.6rem] tracking-[0.18em] text-muted-foreground">
            <span className="text-primary">PROJECT {project.number}</span>
            <span className="h-px w-8 bg-border" />
            <span>DURAI SYSTEMS // PROJECT LAB</span>
          </div>

          <h1 id="project-title" className="mt-6 font-display text-4xl font-bold leading-tight tracking-[0.04em] sm:text-6xl">
            {project.name}
          </h1>
          <p className="mt-4 font-mono text-[0.68rem] tracking-[0.16em] text-primary">{project.category}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/projects"
              className="inline-flex min-h-11 items-center gap-3 border border-border px-4 font-mono text-[0.66rem] tracking-[0.14em] transition hover:border-primary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
              RETURN TO PROJECT LAB
            </Link>
            <Link
              to="/"
              hash="command-center"
              className="inline-flex min-h-11 items-center gap-3 border border-border px-4 font-mono text-[0.66rem] tracking-[0.14em] transition hover:border-primary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              COMMAND CENTER
            </Link>
          </div>

          <div className="mt-10 grid gap-px border border-border bg-border/70 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="bg-background/70 p-6 backdrop-blur-md sm:p-8">
              <p className="font-mono text-[0.58rem] tracking-[0.18em] text-primary">DESCRIPTION</p>
              <p className="mt-4 text-base leading-7 text-muted-foreground">{project.description}</p>

              <p className="mt-8 font-mono text-[0.58rem] tracking-[0.18em] text-primary">LIVE SYSTEM</p>
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={`Open live system ${project.name} in a new tab`}
                className="mt-4 inline-flex min-h-12 items-center justify-center gap-3 border border-primary bg-primary px-5 font-mono text-[0.66rem] font-semibold tracking-[0.16em] text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                OPEN LIVE SYSTEM ↗
              </a>
              <p className="mt-3 font-mono text-[0.6rem] tracking-[0.12em] text-muted-foreground">{project.liveLabel}</p>
            </div>

            <div className="bg-background/70 p-6 backdrop-blur-md sm:p-8">
              <p className="font-mono text-[0.58rem] tracking-[0.18em] text-primary">TECHNICAL INFORMATION</p>
              <dl className="mt-4 grid gap-px bg-border/60">
                {[
                  ["PROJECT NUMBER", project.number],
                  ["CATEGORY", project.category],
                  ["DEPLOYMENT", project.liveLabel],
                  ["STATUS", project.status],
                ].map(([label, value]) => (
                  <div key={label} className="grid grid-cols-[9rem_minmax(0,1fr)] gap-3 bg-background/80 p-3">
                    <dt className="font-mono text-[0.58rem] tracking-[0.14em] text-muted-foreground">{label}</dt>
                    <dd className="font-mono text-[0.62rem] tracking-[0.1em]">{value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-5 text-sm leading-6 text-muted-foreground">{PROJECT_EMPTY_STATE}</p>
            </div>
          </div>

          <div className="mt-10">
            <p className="font-mono text-[0.58rem] tracking-[0.18em] text-primary">PROJECT VISUALIZATION</p>
            <div className="mt-4">
              <ProjectFlowVisualization kind={project.visualization} reducedMotion={reducedMotion} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

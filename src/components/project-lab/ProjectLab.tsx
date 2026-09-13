import { useMemo, useState } from "react";
import { PROJECT_CATEGORIES, PROJECTS } from "../../lib/projects";
import type { ProjectCategory } from "../../types/projects";
import { ProjectStation } from "./ProjectStation";

interface ProjectLabProps {
  reducedMotion: boolean;
}

export function ProjectLab({ reducedMotion }: ProjectLabProps) {
  const [filter, setFilter] = useState<ProjectCategory["id"]>("all");
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return new Set(
      PROJECTS.filter((p) => {
        const inCategory = filter === "all" || p.categoryId === filter;
        const inQuery =
          q.length === 0 ||
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q);
        return inCategory && inQuery;
      }).map((p) => p.id),
    );
  }, [filter, query]);

  const matchCount = matches.size;

  return (
    <div className="relative">
      {/* Controls */}
      <div className="relative flex flex-col gap-5 border-y border-border py-6 lg:flex-row lg:items-center lg:justify-between">
        <div role="group" aria-label="Filter projects by category" className="flex flex-wrap gap-2">
          {PROJECT_CATEGORIES.map((category) => {
            const selected = filter === category.id;
            return (
              <button
                key={category.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setFilter(category.id)}
                className={`min-h-11 border px-4 font-mono text-[0.6rem] tracking-[0.14em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:border-primary/60 hover:text-primary"
                }`}
              >
                {category.label}
              </button>
            );
          })}
        </div>

        <div className="lg:w-72">
          <label htmlFor="project-search" className="sr-only">
            Search projects
          </label>
          <input
            id="project-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="SEARCH PROJECTS..."
            className="min-h-11 w-full border border-border bg-background/70 px-4 font-mono text-[0.65rem] tracking-[0.12em] text-foreground placeholder:text-muted-foreground focus-visible:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      <p aria-live="polite" className="mt-4 font-mono text-[0.6rem] tracking-[0.14em] text-muted-foreground">
        {matchCount} OF {PROJECTS.length} SYSTEMS MATCH CURRENT SELECTION
      </p>

      {/* Desktop spatial lab */}
      <div className="relative mt-10 hidden lg:block">
        <div className="relative h-[840px] overflow-hidden border border-border/70 bg-command/60">
          <div className="facility-grid absolute inset-x-0 bottom-0 h-2/3 opacity-60" aria-hidden="true" />
          <div className="command-grid absolute inset-0 opacity-40" aria-hidden="true" />

          <svg className="absolute inset-0 size-full" aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none">
            {PROJECTS.map((project) => {
              const isActive = activeId === project.id;
              const isMatch = matches.has(project.id);
              return (
                <line
                  key={project.id}
                  x1="50"
                  y1="50"
                  x2={project.x}
                  y2={project.y}
                  stroke="var(--primary)"
                  strokeWidth={isActive ? 0.35 : 0.15}
                  strokeDasharray="1.4 1.4"
                  opacity={isActive ? 0.85 : isMatch ? 0.35 : 0.12}
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
          </svg>

          {/* Central platform */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            <div
              className={`grid size-40 place-items-center rounded-full border border-primary/50 bg-background/70 backdrop-blur-md ${
                reducedMotion ? "" : "core-pulse-ring"
              }`}
            >
              <div className="text-center">
                <p className="font-mono text-[0.55rem] tracking-[0.2em] text-primary">PROJECT</p>
                <p className="font-display text-xl font-bold tracking-[0.1em]">LAB</p>
                <p className="mt-1 font-mono text-[0.5rem] tracking-[0.16em] text-muted-foreground">DATABASE ONLINE</p>
              </div>
            </div>
          </div>

          {PROJECTS.map((project) => (
            <div
              key={project.id}
              className="absolute w-[19rem] -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${project.x}%`, top: `${project.y}%` }}
            >
              <ProjectStation
                project={project}
                active={activeId === project.id}
                dimmed={!matches.has(project.id)}
                onActivate={setActiveId}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Tablet / mobile vertical stations */}
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:hidden">
        {PROJECTS.map((project) => (
          <ProjectStation
            key={project.id}
            project={project}
            active
            dimmed={!matches.has(project.id)}
            onActivate={() => undefined}
          />
        ))}
      </div>
    </div>
  );
}

import { Link } from "@tanstack/react-router";
import type { Project } from "../../types/projects";

interface StationProps {
  project: Project;
  dimmed: boolean;
  active: boolean;
  onActivate: (id: string | null) => void;
}

export function ProjectStation({ project, dimmed, active, onActivate }: StationProps) {
  return (
    <article
      className={`group relative w-full transition-all duration-300 ${dimmed ? "opacity-35" : "opacity-100"}`}
      onMouseEnter={() => onActivate(project.id)}
      onMouseLeave={() => onActivate(null)}
    >
      <div
        className={`relative border bg-surface/85 p-5 backdrop-blur-md transition-all duration-300 ${
          active ? "border-primary/70 shadow-signal" : "border-border/70"
        }`}
      >
        <div className="flex items-center justify-between font-mono text-[0.58rem] tracking-[0.18em]">
          <span className="text-primary">{project.number}</span>
          <span className="flex items-center gap-2 text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
            {project.status}
          </span>
        </div>

        <h3 className="mt-4 font-display text-lg font-bold leading-tight tracking-[0.05em]">{project.name}</h3>
        <p className="mt-2 font-mono text-[0.6rem] tracking-[0.14em] text-primary/80">{project.category}</p>

        <p
          className={`overflow-hidden text-sm leading-6 text-muted-foreground transition-all duration-300 ${
            active ? "mt-4 max-h-40 opacity-100" : "mt-0 max-h-0 opacity-0 lg:max-h-0"
          }`}
        >
          {project.description}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            to="/projects/$projectId"
            params={{ projectId: project.id }}
            onFocus={() => onActivate(project.id)}
            onBlur={() => onActivate(null)}
            className="inline-flex min-h-11 flex-1 items-center justify-center border border-primary/60 px-4 font-mono text-[0.62rem] tracking-[0.14em] text-primary transition hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            INSPECT SYSTEM
          </Link>
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={`Open live system ${project.name} in a new tab`}
            className="inline-flex min-h-11 items-center justify-center border border-border px-4 font-mono text-[0.62rem] tracking-[0.14em] text-muted-foreground transition hover:border-primary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            OPEN LIVE ↗
          </a>
        </div>

        <span
          className={`absolute inset-x-0 bottom-0 h-px bg-primary transition-all duration-500 ${active ? "opacity-100" : "opacity-0"}`}
          aria-hidden="true"
        />
      </div>
    </article>
  );
}

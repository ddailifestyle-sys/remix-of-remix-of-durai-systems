import { Link } from "@tanstack/react-router";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-3">
      <svg viewBox="0 0 48 48" className="h-9 w-9 shrink-0" aria-hidden="true">
        <g
          stroke="var(--cyan)"
          strokeWidth="1.6"
          fill="none"
          strokeLinecap="round"
        >
          <path d="M24 24 8 12M24 24 8 36M24 24 40 12M24 24 40 36M24 24V6M24 24v18" />
        </g>
        <circle cx="24" cy="24" r="5" fill="var(--blue)" />
        <g fill="var(--cyan)">
          <circle cx="8" cy="12" r="3" />
          <circle cx="8" cy="36" r="3" />
          <circle cx="40" cy="12" r="3" />
          <circle cx="40" cy="36" r="3" />
          <circle cx="24" cy="6" r="3" />
          <circle cx="24" cy="42" r="3" />
        </g>
      </svg>
      {!compact && (
        <span className="leading-none">
          <span className="block font-display text-xl font-bold tracking-tight">IoT SimLab</span>
          <span className="mt-1 block text-[10px] font-medium tracking-[0.22em] text-muted-foreground">
            SIMULATE · CONNECT · SOLVE
          </span>
        </span>
      )}
    </Link>
  );
}

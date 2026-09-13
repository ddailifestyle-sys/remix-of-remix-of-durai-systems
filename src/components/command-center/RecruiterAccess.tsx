import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { NAV_ITEMS, profileData } from "../../lib/portfolio";

export function RecruiterAccess() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="recruiter-panel"
        className="inline-flex min-h-11 items-center gap-2 border border-border px-4 font-mono text-[0.62rem] tracking-[0.16em] text-muted-foreground transition hover:border-primary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="size-1.5 bg-primary shadow-signal" />
        RECRUITER VIEW
      </button>
      {open ? (
        <div
          id="recruiter-panel"
          className="absolute right-0 top-full z-20 mt-2 w-72 border border-border bg-background/95 p-5 backdrop-blur-xl"
          role="dialog"
          aria-label="Recruiter quick navigation"
        >
          <p className="font-mono text-[0.56rem] tracking-[0.18em] text-primary">QUICK ACCESS / RECRUITER</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Skip to what matters most for hiring decisions.</p>
          <ul className="mt-4 space-y-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className="flex min-h-11 items-center justify-between border-b border-border/50 px-1 font-mono text-[0.66rem] tracking-[0.14em] transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {item.label} <span aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
            <li>
              <Link to="/resume" className="flex min-h-11 items-center justify-between px-1 font-mono text-[0.66rem] tracking-[0.14em] transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                RESUME <span aria-hidden="true">→</span>
              </Link>
            </li>
            <li>
              <a href={`mailto:${profileData.contact[0]?.value ?? ""}`} className="flex min-h-11 items-center justify-between px-1 font-mono text-[0.66rem] tracking-[0.14em] transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                CONTACT <span aria-hidden="true">→</span>
              </a>
            </li>
          </ul>
        </div>
      ) : null}
    </div>
  );
}

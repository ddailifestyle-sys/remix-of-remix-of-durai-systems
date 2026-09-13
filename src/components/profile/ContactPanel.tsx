import { ArrowUpRight, Github, Globe, Linkedin, Mail, MapPin } from "lucide-react";
import type { ComponentType } from "react";
import { profileData } from "../../lib/portfolio";

const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  email: Mail,
  location: MapPin,
  website: Globe,
  github: Github,
  linkedin: Linkedin,
};

export function ContactPanel() {
  return (
    <ul className="grid gap-px border border-border bg-border/70 sm:grid-cols-2" aria-label="Contact channels">
      {profileData.contact.map((item) => {
        const Icon = ICONS[item.id] ?? Globe;
        const body = (
          <>
            <span className="flex items-center gap-3">
              <Icon aria-hidden="true" className="size-4 shrink-0 text-primary" />
              <span className="min-w-0">
                <span className="block font-mono text-[0.58rem] tracking-[0.18em] text-muted-foreground">{item.label}</span>
                <span className="mt-1 block truncate font-mono text-[0.72rem] tracking-[0.06em] text-foreground">{item.value}</span>
              </span>
            </span>
            {item.href ? <ArrowUpRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" /> : null}
          </>
        );
        return (
          <li key={item.id} className="min-w-0 bg-surface">
            {item.href ? (
              <a
                href={item.href}
                {...(item.external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
                aria-label={`${item.label}: ${item.value}${item.external ? " (opens in a new tab)" : ""}`}
                className="group flex min-h-16 items-center justify-between gap-4 p-5 transition hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {body}
              </a>
            ) : (
              <div className="flex min-h-16 items-center justify-between gap-4 p-5">{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

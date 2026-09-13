import type { FocusArea } from "../../types/portfolio";
import { profileData } from "../../lib/portfolio";

const FOCUS_ICONS: Record<string, string> = {
  backend: "⚙",
  cloud: "☁",
  iot: "📡",
  fullstack: "⬡",
};

function FocusCard({ area, index }: { area: FocusArea; index: number }) {
  return (
    <div
      className="group relative border border-border/70 bg-surface/80 p-6 backdrop-blur-md transition-all duration-300 hover:border-primary/60 hover:bg-surface"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[0.58rem] tracking-[0.18em] text-primary">{area.index}</span>
        <span className="text-2xl text-primary/70 transition-transform duration-300 group-hover:scale-110" aria-hidden="true">{FOCUS_ICONS[area.id] ?? "◈"}</span>
      </div>
      <h3 className="mt-5 font-display text-lg font-bold tracking-[0.06em]">{area.label}</h3>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{area.description}</p>
      <span className="absolute bottom-0 left-0 h-px w-0 bg-primary transition-all duration-500 group-hover:w-full" aria-hidden="true" />
    </div>
  );
}

export function EngineeringFocus() {
  return (
    <section aria-labelledby="focus-title" className="border-t border-border py-16 sm:py-20">
      <div className="flex items-center gap-4">
        <h2 id="focus-title" className="font-display text-2xl font-bold tracking-[0.06em] sm:text-3xl">ENGINEERING FOCUS</h2>
        <span className="h-px flex-1 bg-border" />
      </div>
      <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">Four interconnected domains connected to the central engineering identity.</p>
      <div className="mt-8 grid gap-px bg-border/70 sm:grid-cols-2">
        {profileData.focusAreas.map((area, i) => (
          <div key={area.id} className="bg-background">
            <FocusCard area={area} index={i} />
          </div>
        ))}
      </div>
    </section>
  );
}

export function ProfileStatus() {
  return (
    <section aria-labelledby="status-title" className="border-t border-border py-12">
      <div className="flex items-center gap-4">
        <h2 id="status-title" className="font-display text-xl font-bold tracking-[0.06em]">ENGINEER STATUS</h2>
        <span className="h-px flex-1 bg-border" />
      </div>
      <dl className="mt-6 grid grid-cols-2 gap-px border border-border bg-border/70 lg:grid-cols-4">
        {profileData.status.map((item) => (
          <div key={item.label} className="bg-background/60 p-4 backdrop-blur-md">
            <dt className="font-mono text-[0.55rem] tracking-[0.18em] text-muted-foreground">{item.label}</dt>
            <dd className="mt-2 font-mono text-[0.66rem] tracking-[0.1em] text-foreground">
              <span className="mr-2 inline-block size-1.5 bg-primary shadow-signal" />
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function IdentityPanel() {
  return (
    <section aria-labelledby="identity-title" className="border-t border-border py-12">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start">
        <div>
          <div className="border border-border bg-surface/60 p-6 backdrop-blur-md sm:p-8">
            <div className="flex items-center gap-3 font-mono text-[0.6rem] tracking-[0.18em] text-primary">
              <span className="size-1.5 bg-primary shadow-signal" />
              PROFILE ACTIVE
            </div>
            <h2 id="identity-title" className="mt-5 font-display text-4xl font-bold tracking-[0.04em] sm:text-5xl">{profileData.name}</h2>
            <div className="mt-4 border-l border-primary/70 pl-5">
              {profileData.roles.map((role) => (
                <p key={role} className="font-display text-sm font-semibold tracking-[0.1em] text-muted-foreground sm:text-base">{role}</p>
              ))}
            </div>
            <p className="mt-5 font-mono text-[0.66rem] tracking-[0.1em] text-muted-foreground">{profileData.location}</p>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <a
            href={`mailto:${profileData.contact[0]?.value ?? ""}`}
            className="inline-flex min-h-12 items-center justify-center gap-3 border border-primary bg-primary px-5 font-mono text-xs font-semibold tracking-[0.16em] text-primary-foreground shadow-signal transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            CONTACT
          </a>
          <a
            href="/resume"
            className="inline-flex min-h-12 items-center justify-center gap-3 border border-border bg-surface/70 px-5 font-mono text-xs font-semibold tracking-[0.16em] text-foreground transition hover:border-primary/60 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            RESUME
          </a>
        </div>
      </div>
    </section>
  );
}

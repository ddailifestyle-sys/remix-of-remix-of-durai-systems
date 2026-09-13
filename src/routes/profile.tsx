import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { SystemNavigation } from "../components/navigation/SystemNavigation";
import { ContactPanel } from "../components/profile/ContactPanel";
import { EngineeringFocus, IdentityPanel, ProfileStatus } from "../components/profile/ProfileSections";
import { profileData } from "../lib/portfolio";
import { useReducedMotion } from "../hooks/use-reduced-motion";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Durai B" },
      { name: "description", content: "Professional profile of backend, cloud and IoT engineer Durai B based in Tamil Nadu, India." },
      { property: "og:title", content: "Profile — Durai B" },
      { property: "og:description", content: "Professional profile of backend, cloud and IoT engineer Durai B." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/profile" }],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const reducedMotion = useReducedMotion();
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") navigate({ to: "/", hash: "command-center" });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <SystemNavigation />

      <section className="relative overflow-hidden border-b border-border px-5 pt-24 pb-12 sm:px-8 lg:px-10" aria-labelledby="profile-title">
        <div className="command-grid absolute inset-0 opacity-30" aria-hidden="true" />
        <div className="relative mx-auto max-w-[1500px]">
          <div className="flex items-center gap-3 font-mono text-[0.62rem] tracking-[0.18em] text-muted-foreground">
            <span className="text-primary">SYSTEM 01</span>
            <span className="h-px w-8 bg-border" />
            <span>DURAI SYSTEMS // PERSONNEL DATABASE</span>
          </div>
          <h1 id="profile-title" className="mt-6 font-display text-5xl font-bold tracking-[0.04em] sm:text-7xl">ENGINEER PROFILE</h1>

          <Link
            to="/"
            hash="command-center"
            className="mt-8 inline-flex min-h-11 items-center gap-3 border border-border px-4 font-mono text-[0.66rem] tracking-[0.14em] transition hover:border-primary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            COMMAND CENTER
          </Link>

          <div className="mt-10 grid gap-px border border-border bg-border/70 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <div className="bg-background/70 p-6 backdrop-blur-md sm:p-8">
              <p className="font-mono text-[0.58rem] tracking-[0.18em] text-primary">IDENTITY</p>
              <p className="mt-4 font-display text-3xl font-bold tracking-[0.06em] sm:text-5xl">{profileData.name}</p>
              <div className="mt-4 border-l border-primary/70 pl-5">
                {profileData.roles.map((role) => (
                  <p key={role} className="font-display text-sm font-semibold tracking-[0.1em] text-muted-foreground sm:text-base">{role}</p>
                ))}
              </div>
            </div>
            <div className="bg-background/70 p-6 backdrop-blur-md sm:p-8">
              <p className="font-mono text-[0.58rem] tracking-[0.18em] text-primary">POSITIONING</p>
              <p className="mt-4 text-base leading-7 text-foreground sm:text-lg">{profileData.positioning}</p>
              <p className="mt-5 flex items-center gap-2 font-mono text-[0.6rem] tracking-[0.16em] text-muted-foreground">
                <span className="size-1.5 bg-primary shadow-signal" />
                {profileData.location}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About + Summary */}
      <section aria-labelledby="about-title" className="px-5 py-16 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-[1500px] grid gap-px border border-border bg-border/70 lg:grid-cols-2">
          <div className="bg-background/70 p-6 backdrop-blur-md sm:p-8">
            <div className="flex items-center gap-4">
              <h2 id="about-title" className="font-display text-2xl font-bold tracking-[0.06em]">ABOUT</h2>
              <span className="h-px flex-1 bg-border" />
            </div>
            <div className="mt-5 space-y-4">
              {profileData.about.map((para, i) => (
                <p key={i} className="text-base leading-7 text-muted-foreground">{para}</p>
              ))}
            </div>
          </div>
          <div className="bg-background/70 p-6 backdrop-blur-md sm:p-8">
            <div className="flex items-center gap-4">
              <h2 className="font-display text-2xl font-bold tracking-[0.06em]">PROFESSIONAL SUMMARY</h2>
              <span className="h-px flex-1 bg-border" />
            </div>
            <div className="mt-5 space-y-4">
              {profileData.summary.map((para, i) => (
                <p key={i} className="text-base leading-7 text-muted-foreground">{para}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="px-5 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-[1500px]">
          <EngineeringFocus />
          <ProfileStatus />
          <IdentityPanel />

          {/* Contact */}
          <section aria-labelledby="contact-title" className="border-t border-border py-16">
            <div className="flex items-center gap-4">
              <h2 id="contact-title" className="font-display text-2xl font-bold tracking-[0.06em]">CONTACT</h2>
              <span className="h-px flex-1 bg-border" />
            </div>
            <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">Direct channels for professional contact.</p>
            <div className="mt-8"><ContactPanel /></div>
          </section>
        </div>
      </div>

      <footer className="border-t border-border bg-background px-5 py-7 font-mono text-[0.62rem] tracking-[0.15em] text-muted-foreground sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-3 sm:flex-row">
          <span>DURAI SYSTEMS / PROFILE</span>
          <span>ENGINEERING CORE ONLINE</span>
        </div>
      </footer>
    </main>
  );
}

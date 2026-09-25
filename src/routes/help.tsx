import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, LifeBuoy, MessageCircle, Video } from "lucide-react";
import helpImg from "@/assets/help-hero.jpg";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help & Documentation — IoT SimLab" },
      {
        name: "description",
        content:
          "Step-by-step guide to using IoT SimLab: register, pick a problem, build a circuit, simulate, debug and submit.",
      },
      { property: "og:title", content: "Help & Documentation — IoT SimLab" },
      {
        property: "og:description",
        content: "Everything you need to know to use the IoT SimLab platform.",
      },
    ],
  }),
  component: HelpPage,
});

const STEPS = [
  { title: "Register Your Team", text: "Create a team account with 2–4 members and verify your college email." },
  { title: "Login to Dashboard", text: "Sign in to see your progress, announcements and the countdown timer." },
  { title: "Browse Problems", text: "Explore all problem statements sorted by difficulty and points." },
  { title: "Read the Statement", text: "Study requirements, level logic and the provided component list." },
  { title: "Open Simulation Lab", text: "Launch the virtual board and drag the required components in." },
  { title: "Wire & Program", text: "Connect the components and write firmware in the built-in editor." },
  { title: "Run & Debug", text: "Watch live sensor readings and use the serial console to debug states." },
  { title: "Submit Solution", text: "Run the test cases and submit — your best score is kept." },
];

const LINKS = [
  { icon: BookOpen, title: "Platform Guide", text: "Full written documentation of every screen.", to: "/how-it-works" as const },
  { icon: Video, title: "Rules Recap", text: "Scoring and submission rules in one page.", to: "/rules" as const },
  { icon: MessageCircle, title: "FAQ", text: "Answers to the most common questions.", to: "/faq" as const },
  { icon: LifeBuoy, title: "Contact Support", text: "Reach the organising team directly.", to: "/contact" as const },
];

function HelpPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="hero-glow border-b border-border">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 lg:grid-cols-2 lg:px-8">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan/40 bg-cyan/10 px-4 py-1.5 text-xs font-semibold text-cyan">
              <LifeBuoy className="h-3.5 w-3.5" /> Help Center
            </span>
            <h1 className="mt-5 text-4xl font-extrabold sm:text-5xl">
              Everything you <span className="text-gradient">need to know</span>
            </h1>
            <p className="mt-5 max-w-xl text-muted-foreground">
              Guides, walkthroughs and quick links for every stage of the challenge — from
              registration to final submission.
            </p>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 rounded-[2rem] bg-brand-gradient opacity-15 blur-3xl" />
            <img
              src={helpImg}
              width={1024}
              height={1024}
              loading="lazy"
              alt="3D render of a monitor showing documentation pages and user guides"
              className="relative w-full rounded-3xl border border-border object-cover"
            />
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <h2 className="text-2xl font-bold">
            How to Use the <span className="text-gradient">Platform</span>
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <article key={s.title} className="panel p-6">
                <span className="font-mono text-sm text-cyan">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 text-base font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
              </article>
            ))}
          </div>

          <h2 className="mt-16 text-2xl font-bold">Quick Links</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {LINKS.map((l) => (
              <Link key={l.title} to={l.to} className="panel p-6 transition-colors hover:bg-surface-2">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient">
                  <l.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <h3 className="mt-4 text-base font-semibold">{l.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{l.text}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

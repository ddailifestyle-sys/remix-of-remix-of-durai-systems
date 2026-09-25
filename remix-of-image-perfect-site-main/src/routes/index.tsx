import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Cpu,
  FileCheck2,
  Layers,
  PlayCircle,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import heroImg from "@/assets/hero-iot.jpg";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PROBLEMS } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "IoT SimLab — Build. Simulate. Innovate." },
      {
        name: "description",
        content:
          "Join the IoT Simulation Challenge: design circuits, run virtual sensors, analyze live data and submit your solution — all in the browser.",
      },
      { property: "og:title", content: "IoT SimLab — Build. Simulate. Innovate." },
      {
        property: "og:description",
        content: "A virtual IoT lab for college teams: design, simulate, analyze and submit.",
      },
    ],
  }),
  component: Landing,
});

const STATS = [
  { icon: Layers, label: "Total Problems", value: `${PROBLEMS.length}` },
  { icon: Users, label: "Team Size", value: "2 – 4" },
  { icon: Zap, label: "Duration", value: "24 Hours" },
  { icon: Trophy, label: "Max Points", value: "800" },
];

const FEATURES = [
  {
    icon: Cpu,
    title: "Design",
    text: "Drag components onto the virtual breadboard and wire your circuit exactly like real hardware.",
  },
  {
    icon: PlayCircle,
    title: "Simulate",
    text: "Run your firmware against live virtual sensors and watch the system respond in real time.",
  },
  {
    icon: BarChart3,
    title: "Analyze",
    text: "Read the serial console, inspect sensor charts and debug logic before you submit.",
  },
  {
    icon: FileCheck2,
    title: "Submit",
    text: "Push your solution through public and hidden test cases and climb the leaderboard.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="hero-glow relative overflow-hidden border-b border-border">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 lg:grid-cols-2 lg:px-8 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan/40 bg-cyan/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-cyan">
              <Activity className="h-3.5 w-3.5" /> IoT Simulation Challenge 2025
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.08] sm:text-5xl lg:text-6xl">
              Build. Simulate.
              <br />
              <span className="text-gradient">Innovate.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Welcome to IoT SimLab — a fully virtual laboratory where student teams design IoT
              circuits, simulate real sensors, analyze live data and submit working solutions. No
              hardware required.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:-translate-y-0.5"
              >
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/problems"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-7 py-3.5 text-sm font-semibold transition-colors hover:bg-accent"
              >
                Explore Problems
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 rounded-[2rem] bg-brand-gradient opacity-20 blur-3xl" />
            <img
              src={heroImg}
              width={1024}
              height={1024}
              alt="3D render of an Arduino board with sensors beside a laptop showing live IoT data"
              className="relative w-full rounded-3xl border border-border object-cover shadow-[var(--shadow-card)]"
            />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border bg-sidebar py-14">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">
            Event <span className="text-gradient">At A Glance</span>
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="panel p-6 text-center">
                <s.icon className="mx-auto h-7 w-7 text-cyan" />
                <p className="mt-4 font-display text-3xl font-bold">{s.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">
              A complete <span className="text-gradient">IoT workflow</span>
            </h2>
            <p className="mt-3 text-muted-foreground">
              Four stages take you from an empty breadboard to an evaluated submission.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f, i) => (
              <article key={f.title} className="panel group p-6">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient">
                    <f.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <span className="font-mono text-sm text-muted-foreground">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-sidebar py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">Ready to start simulating?</h2>
          <p className="mt-3 text-muted-foreground">
            Register your team, pick a problem and open the simulation lab in minutes.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="rounded-xl bg-brand-gradient px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
            >
              Register Your Team
            </Link>
            <Link
              to="/how-it-works"
              className="rounded-xl border border-border bg-surface px-7 py-3.5 text-sm font-semibold"
            >
              How It Works
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

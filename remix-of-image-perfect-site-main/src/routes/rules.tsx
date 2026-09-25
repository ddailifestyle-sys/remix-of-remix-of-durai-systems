import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ClipboardList, FileCheck2, Gavel, Trophy } from "lucide-react";
import rulesImg from "@/assets/rules-hero.jpg";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/rules")({
  head: () => ({
    meta: [
      { title: "Rules & Guidelines — IoT SimLab" },
      {
        name: "description",
        content:
          "Official rules of the IoT Simulation Challenge: team eligibility, simulation rules, scoring criteria and submission requirements.",
      },
      { property: "og:title", content: "Rules & Guidelines — IoT SimLab" },
      {
        property: "og:description",
        content: "Read the general, simulation, scoring and submission rules before you compete.",
      },
    ],
  }),
  component: RulesPage,
});

const SECTIONS = [
  {
    icon: Gavel,
    title: "General Rules",
    items: [
      "Each team must have between 2 and 4 members from the same college.",
      "One registration per team — duplicate accounts will be disqualified.",
      "All members must carry a valid college ID during the event.",
      "Teams must use only the official IoT SimLab platform for simulation.",
      "Any form of plagiarism results in immediate disqualification.",
    ],
  },
  {
    icon: ClipboardList,
    title: "Problem & Simulation Rules",
    items: [
      "Problems are released in sets; each set unlocks at the announced time.",
      "Only components listed in the problem statement may be used.",
      "Unlimited simulation runs are allowed before submission.",
      "Firmware must be written by the team — no pre-built project imports.",
      "The serial console output must clearly show the required states.",
    ],
  },
  {
    icon: Trophy,
    title: "Scoring Criteria",
    items: [
      "Correctness of logic and test cases passed — 50%.",
      "Circuit design quality and component usage — 20%.",
      "Code readability and efficiency — 15%.",
      "Documentation and explanation of approach — 10%.",
      "Innovation and extra features — 5%.",
    ],
  },
  {
    icon: FileCheck2,
    title: "Submission Rules",
    items: [
      "Submit before the deadline shown on your dashboard — late entries score zero.",
      "Each problem can be submitted multiple times; the best score counts.",
      "Include a short note describing your approach with every submission.",
      "Hidden test cases run after submission and may change your final score.",
      "Decisions of the evaluation panel are final.",
    ],
  },
];

function RulesPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="hero-glow border-b border-border">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 lg:grid-cols-2 lg:px-8">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan/40 bg-cyan/10 px-4 py-1.5 text-xs font-semibold text-cyan">
              <ClipboardList className="h-3.5 w-3.5" /> Official Document
            </span>
            <h1 className="mt-5 text-4xl font-extrabold sm:text-5xl">
              Rules & <span className="text-gradient">Guidelines</span>
            </h1>
            <p className="mt-5 max-w-xl text-muted-foreground">
              Everything your team must follow during the IoT Simulation Challenge. Read carefully —
              these rules decide eligibility and final scores.
            </p>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 rounded-[2rem] bg-brand-gradient opacity-15 blur-3xl" />
            <img
              src={rulesImg}
              width={1024}
              height={1024}
              loading="lazy"
              alt="3D render of a clipboard next to IoT hardware components"
              className="relative w-full rounded-3xl border border-border object-cover"
            />
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 lg:grid-cols-2 lg:px-8">
          {SECTIONS.map((s) => (
            <article key={s.title} className="panel p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient">
                  <s.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <h2 className="text-lg font-semibold">{s.title}</h2>
              </div>
              <ul className="mt-5 space-y-3">
                {s.items.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}

          <div className="panel border-warning/40 bg-warning/5 p-7 lg:col-span-2">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <h2 className="text-lg font-semibold">Disqualification Notice</h2>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Sharing solutions between teams, using external simulators, or attempting to tamper
              with the evaluation system will lead to immediate disqualification of all members.
            </p>
            <Link
              to="/register"
              className="mt-6 inline-block rounded-xl bg-brand-gradient px-6 py-3 text-sm font-semibold text-primary-foreground"
            >
              I understand — Register
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

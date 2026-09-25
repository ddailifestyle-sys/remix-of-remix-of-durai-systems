import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/timeline")({
  head: () => ({
    meta: [
      { title: "Event Timeline — IoT SimLab" },
      {
        name: "description",
        content:
          "Key dates for the IoT Simulation Challenge: registration window, problem release, simulation window, submission deadline and results.",
      },
      { property: "og:title", content: "Event Timeline — IoT SimLab" },
      { property: "og:description", content: "All key dates of the IoT Simulation Challenge." },
    ],
  }),
  component: TimelinePage,
});

const EVENTS = [
  { date: "01 May 2025", title: "Registration Opens", text: "Teams can register and verify their college details." },
  { date: "08 May 2025", title: "Orientation Session", text: "Live walkthrough of the simulation lab and rules." },
  { date: "10 May 2025", title: "Problem Sets Released", text: "All eight problem statements unlock on the dashboard." },
  { date: "11 May 2025", title: "Simulation Window", text: "24 hours to design, simulate and refine your solutions." },
  { date: "12 May 2025", title: "Submission Deadline", text: "Final submissions close at 11:59 PM." },
  { date: "14 May 2025", title: "Results & Awards", text: "Leaderboard is finalised and winners announced." },
];

function TimelinePage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="hero-glow border-b border-border py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h1 className="text-4xl font-extrabold sm:text-5xl">
            Event <span className="text-gradient">Timeline</span>
          </h1>
          <p className="mt-5 text-muted-foreground">Mark these dates so your team never misses a stage.</p>
        </div>
      </section>
      <section className="py-14">
        <div className="mx-auto max-w-3xl space-y-4 px-4">
          {EVENTS.map((e) => (
            <article key={e.title} className="panel flex flex-col gap-2 p-6 sm:flex-row sm:items-center sm:gap-8">
              <span className="w-32 shrink-0 font-mono text-sm text-cyan">{e.date}</span>
              <div>
                <h2 className="font-semibold">{e.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{e.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}

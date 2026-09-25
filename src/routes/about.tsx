import { createFileRoute } from "@tanstack/react-router";
import { Cpu, Globe2, GraduationCap, Target } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About the Challenge — IoT SimLab" },
      {
        name: "description",
        content:
          "Learn why IoT SimLab exists, who it is for and what participants gain from the virtual IoT simulation challenge.",
      },
      { property: "og:title", content: "About the Challenge — IoT SimLab" },
      {
        property: "og:description",
        content: "A virtual IoT lab built so every participant can build without hardware.",
      },
    ],
  }),
  component: AboutPage,
});

const CARDS = [
  {
    icon: Target,
    title: "Our Mission",
    text: "Make hands-on IoT learning available to every student, regardless of access to physical kits or lab time.",
  },
  {
    icon: Cpu,
    title: "Real Hardware Behaviour",
    text: "Sensors, relays and displays behave like their physical counterparts, so what you learn transfers directly.",
  },
  {
    icon: GraduationCap,
    title: "Built for Colleges",
    text: "Individual registration, structured problem sets and automated scoring designed for campus events.",
  },
  {
    icon: Globe2,
    title: "Zero Setup",
    text: "Everything runs in the browser. No installs, no drivers, no shipping delays for components.",
  },
];

function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="hero-glow border-b border-border py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h1 className="text-4xl font-extrabold sm:text-5xl">
            About the <span className="text-gradient">Challenge</span>
          </h1>
          <p className="mt-5 text-muted-foreground">
            IoT SimLab is a virtual laboratory and competition platform for the IoT Simulation
            Challenge. Participants solve real-world IoT problems by designing circuits, writing firmware
            and validating behaviour against test cases — entirely in simulation.
          </p>
        </div>
      </section>
      <section className="py-14">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:grid-cols-2 lg:px-8">
          {CARDS.map((c) => (
            <article key={c.title} className="panel p-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient">
                <c.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h2 className="mt-5 text-lg font-semibold">{c.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.text}</p>
            </article>
          ))}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}

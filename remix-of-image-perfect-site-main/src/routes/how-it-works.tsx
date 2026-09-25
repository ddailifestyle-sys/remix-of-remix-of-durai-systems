import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How It Works — IoT SimLab" },
      {
        name: "description",
        content:
          "The five-stage IoT SimLab workflow: register, choose a problem, design the circuit, simulate and debug, then submit for scoring.",
      },
      { property: "og:title", content: "How It Works — IoT SimLab" },
      {
        property: "og:description",
        content: "From registration to evaluated submission in five clear stages.",
      },
    ],
  }),
  component: HowItWorks,
});

const STAGES = [
  {
    title: "Register your team",
    text: "Complete the three-step registration wizard with team info, member details and login credentials.",
  },
  {
    title: "Choose a problem",
    text: "Browse the problem library, filter by difficulty and open the statement that fits your team.",
  },
  {
    title: "Design the circuit",
    text: "Add the allowed components in the simulation lab and wire them to the ESP32 board.",
  },
  {
    title: "Simulate & debug",
    text: "Run the simulation, watch live sensor readings and follow the serial console output.",
  },
  {
    title: "Submit & score",
    text: "Run public test cases, submit your solution and let hidden tests finalise your score.",
  },
];

function HowItWorks() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="hero-glow border-b border-border py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h1 className="text-4xl font-extrabold sm:text-5xl">
            How It <span className="text-gradient">Works</span>
          </h1>
          <p className="mt-5 text-muted-foreground">
            Five stages take your team from sign-up to a scored submission.
          </p>
        </div>
      </section>
      <section className="py-14">
        <div className="mx-auto max-w-3xl px-4">
          <ol className="relative border-l border-border pl-8">
            {STAGES.map((s, i) => (
              <li key={s.title} className="pb-10 last:pb-0">
                <span className="absolute -left-[17px] flex h-8 w-8 items-center justify-center rounded-full bg-brand-gradient font-mono text-xs font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <h2 className="text-lg font-semibold">{s.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
              </li>
            ))}
          </ol>
          <Link
            to="/register"
            className="mt-4 inline-block rounded-xl bg-brand-gradient px-7 py-3.5 text-sm font-semibold text-primary-foreground"
          >
            Start now
          </Link>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — IoT SimLab" },
      {
        name: "description",
        content:
          "Frequently asked questions about team size, hardware requirements, scoring, retries and submissions in IoT SimLab.",
      },
      { property: "og:title", content: "FAQ — IoT SimLab" },
      { property: "og:description", content: "Answers to the most common IoT SimLab questions." },
    ],
  }),
  component: FaqPage,
});

const FAQS = [
  {
    q: "Do we need physical IoT hardware?",
    a: "No. Every component in the problem statements is available in the virtual simulation lab, so your team can build and test entirely in the browser.",
  },
  {
    q: "How many members can a team have?",
    a: "Between 2 and 4 members, all from the same college. The team leader registers on behalf of everyone.",
  },
  {
    q: "Can we submit the same problem more than once?",
    a: "Yes. You can submit as many times as you like before the deadline — your best score for each problem is kept.",
  },
  {
    q: "How is the final score calculated?",
    a: "Test cases carry 50%, circuit design 20%, code quality 15%, documentation 10% and innovation 5%.",
  },
  {
    q: "Is our work saved if we close the browser?",
    a: "Yes. Circuits, simulation state and submissions are stored locally on your device and restored the next time you sign in.",
  },
  {
    q: "What happens if the deadline passes mid-simulation?",
    a: "The lab stays open for practice but submissions are locked, so submit early and refine afterwards.",
  },
];

function FaqPage() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="hero-glow border-b border-border py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h1 className="text-4xl font-extrabold sm:text-5xl">
            Frequently Asked <span className="text-gradient">Questions</span>
          </h1>
        </div>
      </section>
      <section className="py-14">
        <div className="mx-auto max-w-3xl space-y-3 px-4">
          {FAQS.map((f, i) => (
            <div key={f.q} className="panel overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 p-5 text-left font-medium"
              >
                {f.q}
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-cyan transition-transform ${open === i ? "rotate-180" : ""}`}
                />
              </button>
              {open === i && (
                <p className="border-t border-border px-5 py-4 text-sm leading-relaxed text-muted-foreground">
                  {f.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}

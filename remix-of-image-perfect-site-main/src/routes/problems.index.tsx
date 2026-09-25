import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProblemCard } from "@/components/ProblemCard";
import { PROBLEMS, useStore } from "@/lib/store";

export const Route = createFileRoute("/problems/")({
  head: () => ({
    meta: [
      { title: "All Problems — IoT SimLab" },
      {
        name: "description",
        content:
          "Browse all IoT Simulation Challenge problems — smart agriculture, water management, fire detection, air quality and more, by difficulty and points.",
      },
      { property: "og:title", content: "All Problems — IoT SimLab" },
      {
        property: "og:description",
        content: "Eight IoT challenges across easy, medium and hard difficulty.",
      },
    ],
  }),
  component: ProblemsPage,
});

const FILTERS = ["All", "Easy", "Medium", "Hard"] as const;

function ProblemsPage() {
  const { state } = useStore();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [q, setQ] = useState("");

  const list = useMemo(
    () =>
      PROBLEMS.filter((p) => (filter === "All" ? true : p.difficulty === filter)).filter((p) =>
        (p.title + p.category + p.summary).toLowerCase().includes(q.toLowerCase()),
      ),
    [filter, q],
  );

  const statusOf = (id: string) => {
    if (state.submissions.some((s) => s.problemId === id)) return "Completed" as const;
    if (state.attempts.some((a) => a.problemId === id)) return "In Progress" as const;
    return "Not Started" as const;
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="hero-glow border-b border-border py-14">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <h1 className="text-4xl font-extrabold sm:text-5xl">
            All <span className="text-gradient">Problems</span>
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            {PROBLEMS.length} IoT challenges across three difficulty levels. Open any problem to read
            the full statement and launch the simulation lab.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search problems..."
                className="w-full rounded-xl border border-input bg-surface py-3 pl-10 pr-4 text-sm outline-none focus:border-cyan"
              />
            </div>
            <div className="flex gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
                    filter === f
                      ? "border-transparent bg-brand-gradient text-primary-foreground"
                      : "border-border bg-surface text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="py-14">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:grid-cols-2 lg:grid-cols-3 lg:px-8">
          {list.map((p) => (
            <ProblemCard key={p.id} problem={p} status={statusOf(p.id)} />
          ))}
          {list.length === 0 && (
            <p className="text-sm text-muted-foreground">No problems match your search.</p>
          )}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}

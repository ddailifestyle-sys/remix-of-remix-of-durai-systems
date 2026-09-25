import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft,
  BookOpen,
  CircuitBoard,
  FlaskConical,
  ListChecks,
  Package,
  PlayCircle,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { difficultyClass } from "@/components/ProblemCard";
import { problemById, type Problem } from "@/lib/store";

export const Route = createFileRoute("/problems/$problemId")({
  loader: ({ params }): { problem: Problem } => {
    const problem = problemById(params.problemId);
    if (!problem) throw notFound();
    return { problem };
  },
  head: ({ loaderData }) => {
    if (!loaderData)
      return {
        meta: [
          { title: "Problem unavailable — IoT SimLab" },
          { name: "robots", content: "noindex" },
        ],
      };
    const { problem } = loaderData as { problem: Problem };
    const title = `${problem.title} — IoT SimLab Problem ${problem.no}`;
    return {
      meta: [
        { title },
        { name: "description", content: problem.summary },
        { property: "og:title", content: title },
        { property: "og:description", content: problem.summary },
      ],
    };
  },
  component: ProblemDetail,
});

function ProblemDetail() {
  const { problem } = Route.useLoaderData() as { problem: Problem };


  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <Link
          to="/problems"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to problems
        </Link>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <span className="text-4xl">{problem.emoji}</span>
          <div>
            <p className="font-mono text-xs text-muted-foreground">Problem {problem.no}</p>
            <h1 className="text-3xl font-extrabold sm:text-4xl">{problem.title}</h1>
          </div>
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${difficultyClass(problem.difficulty)}`}
          >
            {problem.difficulty}
          </span>
          <span className="rounded-full border border-cyan/40 bg-cyan/10 px-3 py-1 text-xs font-semibold text-cyan">
            {problem.points} points
          </span>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.7fr_1fr]">
          <div className="space-y-6">
            <section className="panel p-7">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <BookOpen className="h-5 w-5 text-cyan" /> Problem Statement
              </h2>
              {problem.statement.map((p) => (
                <p key={p} className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {p}
                </p>
              ))}
            </section>

            <section className="panel p-7">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <ListChecks className="h-5 w-5 text-cyan" /> Functional Requirements
              </h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {problem.requirements.map((r) => (
                  <li key={r} className="flex gap-3 text-sm text-muted-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan" />
                    {r}
                  </li>
                ))}
              </ul>
            </section>

            <section className="panel p-7">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <CircuitBoard className="h-5 w-5 text-cyan" /> Level Logic
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {problem.logic.map((l) => (
                  <div key={l.range} className="rounded-xl border border-border bg-surface-2 p-4">
                    <p className="font-mono text-xs text-cyan">{l.range}</p>
                    <p className="mt-2 text-sm font-medium">{l.result}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="panel p-7">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Package className="h-5 w-5 text-cyan" /> Provided Components
              </h2>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="pb-3">Component</th>
                      <th className="pb-3">Specification</th>
                      <th className="pb-3 text-right">Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {problem.components.map((c) => (
                      <tr key={c.name} className="border-t border-border">
                        <td className="py-3 font-medium">{c.name}</td>
                        <td className="py-3 text-muted-foreground">{c.spec}</td>
                        <td className="py-3 text-right font-mono">{c.qty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="panel p-7">
              <h2 className="text-lg font-semibold">Sample Input / Output</h2>
              <div className="mt-4 space-y-3">
                {problem.io.map((io) => (
                  <div
                    key={io.input}
                    className="grid gap-2 rounded-xl border border-border bg-surface-2 p-4 font-mono text-xs sm:grid-cols-2"
                  >
                    <p className="text-muted-foreground">IN → {io.input}</p>
                    <p className="text-cyan">OUT → {io.output}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <div className="panel p-6">
              <h2 className="text-base font-semibold">Ready to build?</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Open the circuit builder with this problem, its starter sketch and test cases loaded.
              </p>
              <Link
                to="/app/builder"
                search={{ problem: problem.id }}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3 text-sm font-semibold text-primary-foreground"
              >
                <PlayCircle className="h-4 w-4" /> Open Circuit Builder
              </Link>
            </div>

            <div className="panel p-6">
              <h2 className="flex items-center gap-2 text-base font-semibold">
                <FlaskConical className="h-4 w-4 text-cyan" /> Test Cases
              </h2>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Public test cases</span>
                  <span className="font-mono">{problem.publicTests}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Hidden test cases</span>
                  <span className="font-mono">{problem.hiddenTests}</span>
                </div>
              </div>
            </div>

            <div className="panel p-6">
              <h2 className="text-base font-semibold">Constraints</h2>
              <ul className="mt-4 space-y-3">
                {problem.constraints.map((c) => (
                  <li key={c} className="flex gap-3 text-sm text-muted-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>

            <div className="panel p-6">
              <h2 className="text-base font-semibold">Resources</h2>
              <ul className="mt-4 space-y-2 text-sm">
                {["Sensor datasheets", "Wiring reference", "Serial debug guide"].map((r) => (
                  <li key={r}>
                    <Link to="/help" className="text-cyan hover:underline">
                      {r}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}

import { Link } from "@tanstack/react-router";
import { Circle, CheckCircle2, PlayCircle } from "lucide-react";
import type { Difficulty, Problem } from "@/lib/store";

export const difficultyClass = (d: Difficulty) =>
  d === "Easy"
    ? "border-success/40 bg-success/10 text-success"
    : d === "Medium"
      ? "border-warning/40 bg-warning/10 text-warning"
      : "border-danger/40 bg-danger/10 text-danger";

export function ProblemCard({
  problem,
  status = "Not Started",
  linkTo = "detail",
}: {
  problem: Problem;
  status?: "Not Started" | "In Progress" | "Completed";
  /** "detail" opens the problem page, "builder" jumps straight into the circuit builder */
  linkTo?: "detail" | "builder";
}) {
  const StatusIcon =
    status === "Completed" ? CheckCircle2 : status === "In Progress" ? PlayCircle : Circle;

  const linkProps =
    linkTo === "builder"
      ? ({ to: "/app/builder", search: { problem: problem.id } } as const)
      : ({ to: "/problems/$problemId", params: { problemId: problem.id } } as const);

  return (
    <Link
      {...linkProps}
      className="panel flex flex-col p-6 transition-transform hover:-translate-y-1"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-3xl" aria-hidden="true">
          {problem.emoji}
        </span>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${difficultyClass(problem.difficulty)}`}
        >
          {problem.difficulty}
        </span>
      </div>
      <p className="mt-4 font-mono text-xs text-muted-foreground">Problem {problem.no}</p>
      <h3 className="mt-1 text-lg font-semibold">{problem.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{problem.summary}</p>
      <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-sm">
        <span className="font-semibold text-cyan">{problem.points} pts</span>
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <StatusIcon className="h-4 w-4" /> {status}
        </span>
      </div>
    </Link>
  );
}

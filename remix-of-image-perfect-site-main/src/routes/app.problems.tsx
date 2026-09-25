import { createFileRoute } from "@tanstack/react-router";
import { ProblemCard } from "@/components/ProblemCard";
import { PROBLEMS, useStore } from "@/lib/store";

export const Route = createFileRoute("/app/problems")({
  head: () => ({
    meta: [
      { title: "Your Problems — IoT SimLab" },
      { name: "description", content: "All challenge problems with your team's status." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AppProblems,
});

function AppProblems() {
  const { state } = useStore();
  const statusOf = (id: string) =>
    state.submissions.some((s) => s.problemId === id)
      ? ("Completed" as const)
      : state.attempts.some((a) => a.problemId === id)
        ? ("In Progress" as const)
        : ("Not Started" as const);

  return (
    <div>
      <h1 className="text-2xl font-bold">
        All <span className="text-gradient">Problems</span>
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Pick a problem to open it directly in the circuit builder.
      </p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {PROBLEMS.map((p) => (
          <ProblemCard key={p.id} problem={p} status={statusOf(p.id)} linkTo="builder" />
        ))}
      </div>
    </div>
  );
}

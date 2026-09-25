import { createFileRoute, Link } from "@tanstack/react-router";
import { PROBLEMS, useStore } from "@/lib/store";

export const Route = createFileRoute("/app/lab/")({
  head: () => ({
    meta: [
      { title: "Simulation Lab — IoT SimLab" },
      { name: "description", content: "Pick a problem and open the virtual simulation lab." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LabIndex,
});

function LabIndex() {
  const { state } = useStore();
  return (
    <div>
      <h1 className="text-2xl font-bold">
        Simulation <span className="text-gradient">Lab</span>
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Choose a problem to open its virtual board and sensors.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {PROBLEMS.map((p) => {
          const sim = state.simulations.find((s) => s.problemId === p.id);
          return (
            <Link
              key={p.id}
              to="/app/lab/$problemId"
              params={{ problemId: p.id }}
              className="panel flex items-center gap-4 p-5 transition-transform hover:-translate-y-1"
            >
              <span className="text-2xl">{p.emoji}</span>
              <div>
                <p className="font-semibold">{p.title}</p>
                <p className="text-xs text-muted-foreground">
                  {sim ? `${sim.runs} run(s) · ${sim.status}` : "No simulation yet"}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

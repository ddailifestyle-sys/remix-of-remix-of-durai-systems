import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Cpu, Play, Plus, RotateCcw, Send, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  COMPONENT_LIBRARY,
  problemById,
  uid,
  useStore,
  type Problem,
} from "@/lib/store";

export const Route = createFileRoute("/app/lab/$problemId")({
  loader: ({ params }): { problem: Problem } => {
    const problem = problemById(params.problemId);
    if (!problem) throw notFound();
    return { problem };
  },
  head: ({ loaderData }) => {
    const p = (loaderData as { problem: Problem } | undefined)?.problem;
    return {
      meta: [
        { title: p ? `${p.title} — Simulation Lab` : "Simulation Lab" },
        { name: "description", content: "Virtual IoT simulation workspace." },
        { name: "robots", content: "noindex" },
      ],
    };
  },
  component: Lab,
});

function Lab() {
  const { problem } = Route.useLoaderData() as { problem: Problem };
  const { state, update, logActivity } = useStore();
  const sim = useMemo(
    () => state.simulations.find((s) => s.problemId === problem.id),
    [state.simulations, problem.id],
  );
  const [running, setRunning] = useState(false);
  const [notes, setNotes] = useState("");

  const components = sim?.components ?? [];
  const logs = sim?.logs ?? [];
  const readings = sim?.readings ?? { level: 0, temp: 0, humidity: 0 };

  const save = (patch: Partial<NonNullable<typeof sim>>) =>
    update((s) => {
      const existing = s.simulations.find((x) => x.problemId === problem.id);
      const base = existing ?? {
        id: uid(),
        name: `${problem.title} sim`,
        problemId: problem.id,
        status: "Draft" as const,
        updatedAt: new Date().toISOString(),
        runs: 0,
        components: [] as string[],
        logs: [] as string[],
        readings: { level: 0, temp: 0, humidity: 0 },
      };
      const next = { ...base, ...patch, updatedAt: new Date().toISOString() };
      return {
        ...s,
        simulations: existing
          ? s.simulations.map((x) => (x.problemId === problem.id ? next : x))
          : [next, ...s.simulations],
        attempts: s.attempts.some((a) => a.problemId === problem.id)
          ? s.attempts
          : [
              {
                id: uid(),
                problemId: problem.id,
                startedAt: new Date().toISOString(),
                status: "In Progress" as const,
                testsPassed: 0,
                testsTotal: problem.publicTests,
                score: 0,
              },
              ...s.attempts,
            ],
      };
    });

  const addComponent = (name: string) => {
    save({ components: [...components, name] });
    toast.success(`${name} added to the board`);
  };

  const run = () => {
    setRunning(true);
    const level = Math.round(Math.random() * 100);
    const temp = 24 + Math.round(Math.random() * 14);
    const humidity = 40 + Math.round(Math.random() * 45);
    const band = problem.logic[level < 30 ? 0 : level < 70 ? 1 : 2];
    const newLogs = [
      `[${new Date().toLocaleTimeString()}] Booting ESP32...`,
      `[sensor] reading = ${level} % | temp = ${temp} °C | humidity = ${humidity} %`,
      `[logic] state = ${band?.result ?? "OK"}`,
      `[system] loop complete`,
    ];
    save({
      runs: (sim?.runs ?? 0) + 1,
      status: "In Progress",
      readings: { level, temp, humidity },
      logs: [...newLogs, ...logs].slice(0, 40),
    });
    logActivity(`Ran simulation for ${problem.title}`);
    setTimeout(() => setRunning(false), 600);
  };

  const submit = () => {
    if (components.length === 0) {
      toast.error("Add at least one component before submitting.");
      return;
    }
    const testsTotal = problem.publicTests + problem.hiddenTests;
    const testsPassed = Math.max(
      3,
      Math.min(testsTotal, Math.round(testsTotal * (0.5 + Math.min(components.length, 5) / 12))),
    );
    const score = Math.round((testsPassed / testsTotal) * problem.points * 10) / 10;
    update((s) => ({
      ...s,
      submissions: [
        {
          id: uid(),
          problemId: problem.id,
          submittedAt: new Date().toISOString(),
          notes,
          score,
          testsPassed,
          testsTotal,
          status: "Evaluated" as const,
        },
        ...s.submissions.filter((x) => x.problemId !== problem.id),
      ],
      attempts: s.attempts.map((a) =>
        a.problemId === problem.id
          ? { ...a, status: "Completed" as const, testsPassed, testsTotal, score }
          : a,
      ),
      simulations: s.simulations.map((x) =>
        x.problemId === problem.id ? { ...x, status: "Completed" as const } : x,
      ),
    }));
    logActivity(`Submitted ${problem.title} — scored ${score}`);
    toast.success(`Submitted! ${testsPassed}/${testsTotal} test cases passed · ${score} pts`);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link to="/app/lab" className="text-sm text-muted-foreground hover:text-foreground">
            ← Simulation Lab
          </Link>
          <h1 className="mt-2 text-2xl font-bold">
            {problem.emoji} {problem.title}
          </h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={run}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-5 py-3 text-sm font-semibold text-primary-foreground"
          >
            <Play className="h-4 w-4" /> {running ? "Running..." : "Run Simulation"}
          </button>
          <button
            onClick={() => save({ logs: [], readings: { level: 0, temp: 0, humidity: 0 } })}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-semibold"
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[260px_1fr_300px]">
        <aside className="panel p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Component Library
          </h2>
          <ul className="mt-4 space-y-2">
            {COMPONENT_LIBRARY.map((c) => (
              <li key={c}>
                <button
                  onClick={() => addComponent(c)}
                  className="flex w-full items-center justify-between rounded-lg border border-border bg-surface-2 px-3 py-2 text-left text-sm hover:border-cyan"
                >
                  {c} <Plus className="h-3.5 w-3.5 text-cyan" />
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="space-y-6">
          <div className="panel circuit-bg min-h-[280px] p-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Cpu className="h-4 w-4 text-cyan" /> Virtual Board — ESP32
            </div>
            {components.length === 0 ? (
              <p className="mt-16 text-center text-sm text-muted-foreground">
                Add components from the library to start wiring your circuit.
              </p>
            ) : (
              <div className="mt-5 flex flex-wrap gap-3">
                {components.map((c, i) => (
                  <span
                    key={`${c}-${i}`}
                    className="inline-flex items-center gap-2 rounded-xl border border-cyan/40 bg-cyan/10 px-3 py-2 text-xs font-medium text-cyan"
                  >
                    {c}
                    <button
                      aria-label={`Remove ${c}`}
                      onClick={() => save({ components: components.filter((_, j) => j !== i) })}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="panel p-5">
            <h2 className="text-sm font-semibold">Console / Serial Monitor</h2>
            <pre className="mt-3 max-h-56 overflow-auto rounded-xl bg-background p-4 font-mono text-xs leading-relaxed text-muted-foreground">
              {logs.length ? logs.join("\n") : "// serial output appears here after a run"}
            </pre>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="panel p-5">
            <h2 className="text-sm font-semibold">Live Sensor Readings</h2>
            <div className="mt-4 space-y-3 text-sm">
              {[
                ["Primary reading", `${readings.level} %`],
                ["Temperature", `${readings.temp} °C`],
                ["Humidity", `${readings.humidity} %`],
                ["Runs", String(sim?.runs ?? 0)],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-mono text-cyan">{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel p-5">
            <h2 className="text-sm font-semibold">Submit Solution</h2>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe your approach..."
              className="mt-3 w-full rounded-xl border border-input bg-background p-3 text-sm outline-none focus:border-cyan"
            />
            <button
              onClick={submit}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3 text-sm font-semibold text-primary-foreground"
            >
              <Send className="h-4 w-4" /> Submit for Evaluation
            </button>
          </div>

          <div className="panel p-5">
            <h2 className="text-sm font-semibold">Problem Requirements</h2>
            <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
              {problem.requirements.map((r) => (
                <li key={r}>• {r}</li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

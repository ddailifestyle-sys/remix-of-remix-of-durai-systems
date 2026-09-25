import { CheckCircle2, EyeOff, FlaskConical, Loader2, Send, XCircle } from "lucide-react";
import type { SuiteResult } from "@/lib/tests/engine";

type Props = {
  suite: SuiteResult | null;
  running: boolean;
  points: number;
  onRun: () => void;
  onSubmit: () => void;
  submitted?: {
    score: number;
    testsPassed: number;
    testsTotal: number;
    submittedAt: string;
  } | null;
};

export function TestPanel({ suite, running, points, onRun, onSubmit, submitted }: Props) {
  const publicCases = suite?.results.filter((r) => !r.hidden) ?? [];
  const hiddenCases = suite?.results.filter((r) => r.hidden) ?? [];
  const pct = suite && suite.total ? Math.round((suite.passed / suite.total) * 100) : 0;

  return (
    <div className="panel p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <FlaskConical className="h-4 w-4 text-cyan" /> Test Case Engine
        </h2>
        <div className="flex gap-2">
          <button
            onClick={onRun}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-lg border border-cyan px-3 py-1.5 text-xs font-semibold text-cyan disabled:opacity-60"
          >
            {running ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <FlaskConical className="h-3.5 w-3.5" />
            )}
            Run all tests
          </button>
          <button
            onClick={onSubmit}
            disabled={running || !suite || !suite.compiled}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-gradient px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" /> Submit attempt
          </button>
        </div>
      </div>

      {!suite && (
        <p className="mt-3 text-xs text-muted-foreground">
          Run all tests to evaluate your sketch against the public and hidden cases.
        </p>
      )}

      {suite && !suite.compiled && (
        <div className="mt-3 rounded-xl border border-danger/50 bg-danger/10 p-3 text-xs text-danger">
          <p className="font-semibold">Compilation failed — 0 tests executed.</p>
          <ul className="mt-2 space-y-1 font-mono">
            {suite.errors.map((e, i) => (
              <li key={i}>
                sketch.ino:{e.line}: {e.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {suite?.compiled && (
        <>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            {[
              ["Passed", `${suite.passed}/${suite.total}`],
              ["Pass rate", `${pct}%`],
              ["Score", `${suite.score} / ${points}`],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl border border-border bg-surface-2 p-3">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{k}</p>
                <p className="mt-1 font-mono text-sm text-cyan">{v}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-brand-gradient transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>

          <h3 className="mt-5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Public test cases
          </h3>
          <ul className="mt-2 space-y-2">
            {publicCases.map((r) => (
              <li key={r.id} className="rounded-xl border border-border bg-surface-2 p-3 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 font-semibold">
                    {r.passed ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : (
                      <XCircle className="h-4 w-4 text-danger" />
                    )}
                    {r.name}
                  </span>
                  <span className={r.passed ? "text-success" : "text-danger"}>
                    {r.passed ? "PASSED" : "FAILED"} · {r.earned}/{r.points} pt
                  </span>
                </div>
                <dl className="mt-2 grid gap-1 font-mono text-[11px] text-muted-foreground">
                  <div>
                    <span className="text-foreground">input:</span> {r.input}
                  </div>
                  <div>
                    <span className="text-foreground">expected:</span> {r.expected}
                  </div>
                  <div className="truncate">
                    <span className="text-foreground">serial:</span> {r.actual}
                  </div>
                </dl>
                {!r.passed && <p className="mt-1 text-[11px] text-danger">{r.message}</p>}
              </li>
            ))}
          </ul>

          <h3 className="mt-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <EyeOff className="h-3.5 w-3.5" /> Hidden test cases
          </h3>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Inputs and expected outputs stay hidden — only the verdict is shown.
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {hiddenCases.map((r) => (
              <li
                key={r.id}
                title={`${r.name}: ${r.message}`}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] ${
                  r.passed
                    ? "border-success/50 bg-success/10 text-success"
                    : "border-danger/50 bg-danger/10 text-danger"
                }`}
              >
                {r.passed ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <XCircle className="h-3.5 w-3.5" />
                )}
                {r.name.replace("Hidden test ", "H")}
              </li>
            ))}
          </ul>
        </>
      )}

      {submitted && (
        <p className="mt-5 rounded-xl border border-success/40 bg-success/10 p-3 text-xs text-success">
          Submitted — {submitted.testsPassed}/{submitted.testsTotal} tests passed ·{" "}
          {submitted.score} pts
        </p>
      )}
    </div>
  );
}

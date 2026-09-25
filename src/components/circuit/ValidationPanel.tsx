import { useState } from "react";
import { AlertTriangle, CheckCircle2, Crosshair, ShieldCheck, TriangleAlert, XCircle } from "lucide-react";
import { nodeDef, type Circuit } from "@/lib/circuit/model";
import { pinDef } from "@/lib/circuit/parts";
import { verifyBoard, type Issue, type VerifyReport } from "@/lib/circuit/validate";

type Selection = { kind: "node" | "wire"; id: string } | null;

type Props = {
  circuit: Circuit;
  code: string;
  issues: Issue[];
  activeIndex: number | null;
  onFocusIssue: (index: number | null) => void;
  onSelect: (s: Selection) => void;
};

/** Dedicated sidebar that names the exact pins/wires at fault and how to fix them. */
export function ValidationPanel({ circuit, code, issues, activeIndex, onFocusIssue, onSelect }: Props) {
  const [report, setReport] = useState<VerifyReport | null>(null);
  const errors = issues.filter((i) => i.level === "error");
  const warnings = issues.filter((i) => i.level === "warning");

  const pinLabels = (issue: Issue) =>
    (issue.pins ?? [])
      .map((p) => {
        const node = circuit.nodes.find((n) => n.id === p.node);
        const def = node ? nodeDef(node) : undefined;
        const pin = pinDef(node?.type ?? "", p.pin);
        if (!def) return p.pin;
        return `${def.label} · ${pin?.label ?? p.pin}${pin ? ` (${pin.kind})` : ""}`;
      })
      .filter(Boolean);

  return (
    <section aria-labelledby="validation-heading" className="panel p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 id="validation-heading" className="flex items-center gap-2 text-sm font-semibold">
          <ShieldCheck className="h-4 w-4 text-cyan" aria-hidden="true" /> Electrical Validation
        </h2>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
            errors.length ? "bg-danger/15 text-danger" : "bg-success/15 text-success"
          }`}
        >
          {errors.length} error{errors.length === 1 ? "" : "s"} · {warnings.length} warning
          {warnings.length === 1 ? "" : "s"}
        </span>
      </div>

      <p aria-live="polite" className="mt-2 text-xs text-muted-foreground">
        {issues.length === 0
          ? "All electrical checks passed — the circuit is ready to run."
          : `${issues.length} issue${issues.length === 1 ? "" : "s"} found. Select one to highlight the pins and wires involved.`}
      </p>

      {issues.length === 0 ? (
        <p className="mt-3 flex items-center gap-2 text-xs text-success">
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> No invalid connections detected.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {issues.map((issue, idx) => {
            const active = activeIndex === idx;
            const labels = pinLabels(issue);
            return (
              <li key={`${issue.message}-${idx}`}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    const next = active ? null : idx;
                    onFocusIssue(next);
                    if (next !== null) {
                      if (issue.wireIds?.length) onSelect({ kind: "wire", id: issue.wireIds[0]! });
                      else if (issue.nodeId) onSelect({ kind: "node", id: issue.nodeId });
                    }
                  }}
                  className={`w-full rounded-xl border p-3 text-left transition-colors ${
                    active
                      ? "border-cyan bg-cyan/5"
                      : issue.level === "error"
                        ? "border-danger/40 hover:border-danger"
                        : "border-warning/40 hover:border-warning"
                  }`}
                >
                  <span className="flex items-start gap-2 text-xs font-semibold">
                    {issue.level === "error" ? (
                      <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-danger" aria-hidden="true" />
                    ) : (
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" aria-hidden="true" />
                    )}
                    <span className={issue.level === "error" ? "text-danger" : "text-warning"}>
                      <span className="sr-only">{issue.level === "error" ? "Error: " : "Warning: "}</span>
                      {issue.message}
                    </span>
                  </span>
                  {labels.length > 0 && (
                    <span className="mt-2 block font-mono text-[10px] text-muted-foreground">
                      Pins: {labels.join(" · ")}
                    </span>
                  )}
                  {issue.wireIds && issue.wireIds.length > 0 && (
                    <span className="mt-1 block font-mono text-[10px] text-muted-foreground">
                      {issue.wireIds.length} wire{issue.wireIds.length === 1 ? "" : "s"} involved
                    </span>
                  )}
                  {issue.hint && (
                    <span className="mt-2 block text-[11px] text-muted-foreground">
                      <span className="font-semibold text-foreground">How to fix: </span>
                      {issue.hint}
                    </span>
                  )}
                  <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-cyan">
                    <Crosshair className="h-3 w-3" aria-hidden="true" />
                    {active ? "Highlighting on canvas" : "Highlight on canvas"}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-5 border-t border-border pt-4">
        <button
          type="button"
          onClick={() => setReport(verifyBoard(circuit, code))}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-cyan/15 px-3 text-xs font-semibold text-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
        >
          <ShieldCheck className="h-4 w-4" aria-hidden="true" /> Verify board circuit
        </button>
        {report && (
          <div aria-live="polite" className="mt-3">
            <p className={`text-xs font-semibold ${report.ok ? "text-success" : "text-danger"}`}>
              {report.ok ? "Board verified" : "Verification failed"} — {report.passed}/{report.total} checks passed
            </p>
            <ul className="mt-2 space-y-1.5">
              {report.checks.map((c) => (
                <li key={c.id} className="flex items-start gap-2 rounded-lg border border-border p-2">
                  {c.status === "pass" ? (
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" aria-hidden="true" />
                  ) : c.status === "warn" ? (
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" aria-hidden="true" />
                  ) : (
                    <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-danger" aria-hidden="true" />
                  )}
                  <span className="min-w-0">
                    <span className="block text-[11px] font-semibold">{c.label}</span>
                    <span className="block text-[10px] text-muted-foreground">{c.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[10px] text-muted-foreground">
              Checked {new Date(report.ranAt).toLocaleTimeString()}
            </p>
          </div>
        )}
      </div>

      {errors.length > 0 && (
        <p className="mt-3 text-[11px] text-muted-foreground">
          Simulation cannot start until {errors.length} error{errors.length > 1 ? "s are" : " is"} resolved.
        </p>
      )}
    </section>
  );
}

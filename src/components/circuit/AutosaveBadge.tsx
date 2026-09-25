import { useEffect, useState } from "react";
import { Check, CloudOff, Loader2 } from "lucide-react";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

const relative = (ts: number) => {
  const s = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.round(m / 60)}h ago`;
};

type Props = { status: SaveStatus; savedAt: number | null };

/** Shows autosave state for the circuit, scenario and calibration settings. */
export function AutosaveBadge({ status, savedAt }: Props) {
  const [, tick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => tick((n) => n + 1), 10000);
    return () => window.clearInterval(id);
  }, []);

  const label =
    status === "saving"
      ? "Saving…"
      : status === "error"
        ? "Autosave failed"
        : savedAt
          ? `Saved · last saved ${relative(savedAt)}`
          : "Autosave on";

  return (
    <span
      role="status"
      aria-live="polite"
      title={savedAt ? `Last saved at ${new Date(savedAt).toLocaleTimeString()}` : "Autosave is on"}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${
        status === "error"
          ? "border-danger/40 text-danger"
          : status === "saving"
            ? "border-border text-muted-foreground"
            : "border-success/40 text-success"
      }`}
    >
      {status === "saving" ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
      ) : status === "error" ? (
        <CloudOff className="h-3.5 w-3.5" aria-hidden="true" />
      ) : (
        <Check className="h-3.5 w-3.5" aria-hidden="true" />
      )}
      {label}
    </span>
  );
}

import type { ProjectVisualization as VizKind } from "../../types/projects";

interface VizProps {
  kind: VizKind;
  reducedMotion: boolean;
}

const FLOWS: Record<VizKind, string[]> = {
  fullstack: ["USER", "FRONTEND", "BACKEND", "DATA", "DEPLOYMENT"],
  ai: ["USER", "USER WORKFLOW", "AI-ASSISTED FUNCTIONALITY", "PLATFORM"],
  event: ["VISITOR", "EVENT INTERFACE", "EVENT CONTENT", "RESPONSIVE PLATFORM"],
  iot: ["IoT DEVICE", "IoT SENSOR", "IoT NETWORK", "CLOUD", "DASHBOARD"],
  erp: ["CAMPUS CORE", "ACADEMIC WORKFLOWS", "INSTITUTIONAL WORKFLOWS", "CAMPUS MANAGEMENT"],
};

const CAPTIONS: Record<VizKind, string> = {
  fullstack: "CONCEPTUAL FULL-STACK ARCHITECTURE",
  ai: "CONCEPTUAL PLATFORM WORKFLOW",
  event: "CONCEPTUAL EVENT PLATFORM STRUCTURE",
  iot: "CONCEPTUAL IoT NETWORK — SIMULATION VIEW",
  erp: "CONCEPTUAL CAMPUS SYSTEM STRUCTURE",
};

/** Visual, non-numeric telemetry labels. Clearly marked as simulated. */
const DEMO_TELEMETRY = ["TEMPERATURE", "HUMIDITY", "DEVICE STATUS", "SIGNAL", "PACKETS"];

export function ProjectFlowVisualization({ kind, reducedMotion }: VizProps) {
  const nodes = FLOWS[kind];

  return (
    <figure className="relative overflow-hidden border border-border/70 bg-command/70 p-6 backdrop-blur-md sm:p-8">
      <div className="command-grid absolute inset-0 opacity-40" aria-hidden="true" />
      <figcaption className="relative font-mono text-[0.58rem] tracking-[0.18em] text-primary">
        {CAPTIONS[kind]}
      </figcaption>

      <ol className="relative mt-6 space-y-0">
        {nodes.map((node, i) => (
          <li key={node} className="relative">
            <div className="flex items-center gap-4">
              <span className="grid size-9 shrink-0 place-items-center border border-primary/50 bg-background/80 font-mono text-[0.6rem] text-primary">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="flex-1 border-b border-border/60 py-3 font-mono text-[0.7rem] tracking-[0.14em] text-foreground">
                {node}
              </span>
            </div>
            {i < nodes.length - 1 ? (
              <span className="ml-[1.05rem] block h-6 w-px bg-border/70" aria-hidden="true">
                {!reducedMotion ? (
                  <span
                    className="data-packet block size-1.5 -translate-x-[0.2rem] rounded-full bg-primary"
                    style={{ animationDelay: `${i * 320}ms` }}
                  />
                ) : null}
              </span>
            ) : null}
          </li>
        ))}
      </ol>

      {kind === "iot" ? (
        <div className="relative mt-8 border-t border-border/70 pt-6">
          <p className="font-mono text-[0.58rem] tracking-[0.18em] text-primary">DEMO TELEMETRY / SIMULATION</p>
          <p className="mt-2 font-mono text-[0.6rem] leading-5 tracking-[0.1em] text-muted-foreground">
            Visual simulation labels only. Not connected to live devices or live data.
          </p>
          <ul className="mt-4 grid grid-cols-2 gap-px bg-border/60 sm:grid-cols-5">
            {DEMO_TELEMETRY.map((item) => (
              <li key={item} className="bg-background/80 p-3 font-mono text-[0.58rem] tracking-[0.12em] text-muted-foreground">
                {item}
                <span className="mt-2 block h-px w-full bg-primary/40" aria-hidden="true" />
                <span className="mt-2 block text-primary">SIMULATION</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </figure>
  );
}

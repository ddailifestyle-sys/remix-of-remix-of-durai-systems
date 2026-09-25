import { useState } from "react";
import { Gauge, RefreshCw, SlidersHorizontal } from "lucide-react";
import { CHANNEL_META, calibrationOf, defaultCalibration, defaultScenario, type Calibration, type Scenario } from "@/lib/circuit/engine";
import { nodeDef, type Circuit } from "@/lib/circuit/model";
import type { SensorChannel } from "@/lib/circuit/parts";

type Props = {
  circuit: Circuit;
  scenario: Scenario;
  onChange: (s: Scenario) => void;
  running: boolean;
};

const PRESETS: { name: string; patch: Partial<Record<SensorChannel, number>> }[] = [
  { name: "Normal day", patch: { waterLevel: 55, temperature: 27, humidity: 60, soilMoisture: 45, light: 70, gas: 90, flame: 0, smoke: 3 } },
  { name: "Drought", patch: { soilMoisture: 8, humidity: 22, temperature: 41, waterLevel: 12, light: 95 } },
  { name: "Heavy rain", patch: { soilMoisture: 92, humidity: 95, waterLevel: 96, temperature: 21, light: 20 } },
  { name: "Fire alarm", patch: { flame: 88, smoke: 76, gas: 640, temperature: 58 } },
  { name: "Gas leak", patch: { gas: 820, smoke: 40, humidity: 55 } },
];

export function ScenarioPanel({ circuit, scenario, onChange, running }: Props) {
  const channels = new Set<SensorChannel>();
  for (const n of circuit.nodes) {
    const ch = nodeDef(n)?.channel;
    if (ch) channels.add(ch);
    if (nodeDef(n)?.type === "dht11" || nodeDef(n)?.type === "dht22") channels.add("humidity");
  }
  const list = channels.size ? [...channels] : (Object.keys(CHANNEL_META) as SensorChannel[]);
  const manual = circuit.nodes.filter((n) => ["push-button", "potentiometer"].includes(nodeDef(n)?.type ?? ""));

  const [open, setOpen] = useState<Record<string, boolean>>({});

  const setChannel = (ch: SensorChannel, v: number) =>
    onChange({ ...scenario, channels: { ...scenario.channels, [ch]: v } });

  const setCal = (ch: SensorChannel, patch: Partial<Calibration>) =>
    onChange({
      ...scenario,
      calibration: {
        ...scenario.calibration,
        [ch]: { ...calibrationOf(scenario, ch), ...patch },
      },
    });

  const resetCal = (ch: SensorChannel) => {
    const next = { ...scenario.calibration };
    delete next[ch];
    onChange({ ...scenario, calibration: next });
  };

  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Gauge className="h-4 w-4 text-cyan" aria-hidden="true" /> Scenario Control
        </h2>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${running ? "bg-success/15 text-success" : "bg-surface-2 text-muted-foreground"}`}>
          {running ? "LIVE — applies next loop" : "IDLE"}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {PRESETS.map((p) => (
          <button
            key={p.name}
            onClick={() => onChange({ ...scenario, channels: { ...scenario.channels, ...p.patch } })}
            className="rounded-lg border border-border bg-surface-2 px-2.5 py-1 text-xs hover:border-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
          >
            {p.name}
          </button>
        ))}
        <button
          onClick={() => onChange({ ...defaultScenario(), nodes: scenario.nodes, speed: scenario.speed })}
          className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
        >
          <RefreshCw className="h-3 w-3" aria-hidden="true" /> Reset
        </button>
      </div>

      <div className="mt-4 space-y-4">
        {list.map((ch) => {
          const m = CHANNEL_META[ch];
          const cal = calibrationOf(scenario, ch);
          const isOpen = open[ch] ?? false;
          return (
            <div key={ch}>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{m.label}</span>
                <span className="font-mono text-cyan">
                  {scenario.channels[ch]} {m.unit}
                </span>
              </div>
              <input
                type="range"
                min={m.min}
                max={m.max}
                step={m.step}
                value={scenario.channels[ch]}
                onChange={(e) => setChannel(ch, Number(e.target.value))}
                className="mt-1 w-full accent-cyan"
                aria-label={`${m.label} scenario value`}
              />
              <button
                type="button"
                onClick={() => setOpen((o) => ({ ...o, [ch]: !isOpen }))}
                className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground hover:text-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
                aria-expanded={isOpen}
                aria-controls={`cal-${ch}`}
              >
                <SlidersHorizontal className="h-3 w-3" aria-hidden="true" /> Calibration {isOpen ? "▾" : "▸"}
              </button>
              {isOpen && (
                <div id={`cal-${ch}`} className="mt-3 space-y-3 rounded-xl border border-border bg-surface-2 p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Range</span>
                    <span className="font-mono text-cyan">{cal.min} … {cal.max}</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={cal.min}
                      min={m.min}
                      max={cal.max}
                      step={m.step}
                      onChange={(e) => setCal(ch, { min: Number(e.target.value) })}
                      className="w-full rounded-lg border border-input bg-background px-2 py-1.5 text-xs"
                      aria-label={`${m.label} minimum`}
                    />
                    <input
                      type="number"
                      value={cal.max}
                      min={cal.min}
                      max={m.max}
                      step={m.step}
                      onChange={(e) => setCal(ch, { max: Number(e.target.value) })}
                      className="w-full rounded-lg border border-input bg-background px-2 py-1.5 text-xs"
                      aria-label={`${m.label} maximum`}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Noise ±</span>
                    <span className="font-mono text-cyan">{cal.noise}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    step={0.5}
                    value={cal.noise}
                    onChange={(e) => setCal(ch, { noise: Number(e.target.value) })}
                    className="w-full accent-cyan"
                    aria-label={`${m.label} noise`}
                  />
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Smoothing</span>
                    <span className="font-mono text-cyan">{cal.smoothing}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={0.95}
                    step={0.05}
                    value={cal.smoothing}
                    onChange={(e) => setCal(ch, { smoothing: Number(e.target.value) })}
                    className="w-full accent-cyan"
                    aria-label={`${m.label} smoothing`}
                  />
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Update rate</span>
                    <span className="font-mono text-cyan">{cal.rate > 0 ? `${cal.rate} Hz` : "every read"}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    step={1}
                    value={cal.rate}
                    onChange={(e) => setCal(ch, { rate: Number(e.target.value) })}
                    className="w-full accent-cyan"
                    aria-label={`${m.label} update rate`}
                  />
                  <button
                    type="button"
                    onClick={() => resetCal(ch)}
                    className="w-full rounded-lg border border-border px-2 py-1.5 text-[10px] font-semibold text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
                  >
                    Reset calibration
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {manual.length > 0 && (
        <div className="mt-5 space-y-3 border-t border-border pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Manual inputs</p>
          {manual.map((n) => {
            const def = nodeDef(n)!;
            if (def.type === "push-button")
              return (
                <button
                  key={n.id}
                  onPointerDown={() => onChange({ ...scenario, nodes: { ...scenario.nodes, [n.id]: 1 } })}
                  onPointerUp={() => onChange({ ...scenario, nodes: { ...scenario.nodes, [n.id]: 0 } })}
                  onPointerLeave={() => onChange({ ...scenario, nodes: { ...scenario.nodes, [n.id]: 0 } })}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onChange({ ...scenario, nodes: { ...scenario.nodes, [n.id]: scenario.nodes[n.id] ? 0 : 1 } }); }}}
                  className={`w-full rounded-lg border px-3 py-2 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan ${
                    scenario.nodes[n.id] ? "border-cyan bg-cyan text-background" : "border-border bg-surface-2"
                  }`}
                >
                  {scenario.nodes[n.id] ? "Pressed" : "Hold to press"} · Push Button
                </button>
              );
            const v = scenario.nodes[n.id] ?? Number(n.props["value"] ?? 50);
            return (
              <div key={n.id}>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Potentiometer</span>
                  <span className="font-mono text-cyan">{v} %</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={v}
                  onChange={(e) => onChange({ ...scenario, nodes: { ...scenario.nodes, [n.id]: Number(e.target.value) } })}
                  className="mt-1 w-full accent-cyan"
                  aria-label="Potentiometer value"
                />
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-5 border-t border-border pt-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Loop speed</span>
          <span className="font-mono text-cyan">{scenario.speed} Hz</span>
        </div>
        <input
          type="range"
          min={1}
          max={10}
          value={scenario.speed}
          onChange={(e) => onChange({ ...scenario, speed: Number(e.target.value) })}
          className="mt-1 w-full accent-cyan"
          aria-label="Loop speed"
        />
      </div>
    </div>
  );
}

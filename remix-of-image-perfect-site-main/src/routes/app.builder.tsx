import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Cable, CircuitBoard, Code2, Play, Save, Search, Square, StepForward, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { CircuitCanvas, type View } from "@/components/circuit/CircuitCanvas";
import { ScenarioPanel } from "@/components/circuit/ScenarioPanel";
import { PartIcon } from "@/components/circuit/PartIcon";
import { CameraPanel } from "@/components/circuit/CameraPanel";
import { CodeEditor } from "@/components/lab/CodeEditor";
import { TestPanel } from "@/components/lab/TestPanel";
import { buildSuite, runSuite, type SuiteResult } from "@/lib/tests/engine";
import { PROBLEMS, defaultSketch, uid, useStore } from "@/lib/store";
import {
  SimulationEngine,
  defaultScenario,
  type ComponentOutput,
  type LogLine,
  type Scenario,
} from "@/lib/circuit/engine";
import {
  WIRE_COLORS,
  buildNets,
  createNode,
  emptyCircuit,
  newId,
  nodeDef,
  type Circuit,
  type PinAddr,
} from "@/lib/circuit/model";
import { PARTS, partByType } from "@/lib/circuit/parts";
import { canConnect, validateCircuit } from "@/lib/circuit/validate";

export const Route = createFileRoute("/app/builder")({
  validateSearch: (search: Record<string, unknown>): { problem?: string } =>
    typeof search["problem"] === "string" ? { problem: search["problem"] } : {},
  head: () => ({
    meta: [
      { title: "Circuit Builder — IoT SimLab" },
      { name: "description", content: "Design Arduino circuits, run your sketch and drive live scenario inputs." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Builder,
});

const STORAGE = "simlab-circuit-workspace";
const storageKey = (problemId?: string) => (problemId ? `${STORAGE}:${problemId}` : STORAGE);

const STARTER = `#include <Arduino.h>

const int SENSOR_PIN = A0;
const int LED_PIN = 8;

void setup() {
  Serial.begin(9600);
  pinMode(LED_PIN, OUTPUT);
  Serial.println("Circuit Builder ready");
}

void loop() {
  int raw = analogRead(SENSOR_PIN);
  int percent = map(raw, 0, 1023, 0, 100);
  Serial.print("reading = ");
  Serial.println(percent);

  if (percent < 30) {
    digitalWrite(LED_PIN, HIGH);
    Serial.println("ALERT: low reading");
  } else {
    digitalWrite(LED_PIN, LOW);
  }
  delay(500);
}
`;

type Saved = { circuit: Circuit; code: string; scenario: Scenario; view: View };

function Builder() {
  const { problem: problemId } = Route.useSearch();
  const problem = PROBLEMS.find((p) => p.id === problemId);
  const { state, update } = useStore();
  const [circuit, setCircuit] = useState<Circuit>(emptyCircuit());
  const [code, setCode] = useState(STARTER);
  const [scenario, setScenario] = useState<Scenario>(defaultScenario());
  const [view, setView] = useState<View>({ x: 60, y: 40, z: 0.8 });
  const [selected, setSelected] = useState<{ kind: "node" | "wire"; id: string } | null>(null);
  const [pending, setPending] = useState<PinAddr | null>(null);
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [outputs, setOutputs] = useState<ComponentOutput[]>([]);
  const [sensors, setSensors] = useState<{ nodeId: string; label: string; reading: string }[]>([]);
  const [running, setRunning] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [suite, setSuite] = useState<SuiteResult | null>(null);
  const [testing, setTesting] = useState(false);
  const [errorLine, setErrorLine] = useState<number | null>(null);

  const engineRef = useRef<SimulationEngine | null>(null);
  const consoleRef = useRef<HTMLPreElement>(null);

  /* ------------------------------ persistence ----------------------------- */
  useEffect(() => {
    setHydrated(false);
    const fallback = problem ? defaultSketch(problem) : STARTER;
    try {
      const raw = window.localStorage.getItem(storageKey(problemId));
      if (raw) {
        const s = JSON.parse(raw) as Saved;
        setCircuit(s.circuit ?? emptyCircuit());
        setCode(s.code ?? fallback);
        setScenario({ ...defaultScenario(), ...(s.scenario ?? {}) });
        setView(s.view ?? { x: 60, y: 40, z: 0.8 });
      } else {
        setCircuit(emptyCircuit());
        setCode(fallback);
        setScenario(defaultScenario());
      }
    } catch {
      /* ignore corrupt state */
    }
    setSuite(null);
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problemId]);

  useEffect(() => {
    if (!hydrated) return;
    const id = window.setTimeout(() => {
      window.localStorage.setItem(
        storageKey(problemId),
        JSON.stringify({ circuit, code, scenario, view } satisfies Saved),
      );
      setSavedAt(Date.now());
    }, 800);
    return () => window.clearTimeout(id);
  }, [circuit, code, scenario, view, hydrated, problemId]);

  const [, forceTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => forceTick((n) => n + 1), 5000);
    return () => window.clearInterval(id);
  }, []);

  /* ------------------------------ circuit ops ----------------------------- */
  const addPart = useCallback((type: string, x?: number, y?: number) => {
    const def = partByType(type);
    if (!def) return;
    setCircuit((c) => {
      const px = x ?? 80 + ((c.nodes.length * 60) % 400);
      const py = y ?? 80 + ((c.nodes.length * 90) % 320);
      return { ...c, nodes: [...c.nodes, createNode(def, px, py)] };
    });
    toast.success(`${def.label} placed`);
  }, []);

  const moveNode = useCallback((id: string, x: number, y: number) => {
    setCircuit((c) => ({ ...c, nodes: c.nodes.map((n) => (n.id === id ? { ...n, x, y } : n)) }));
  }, []);

  const rotateNode = useCallback((id: string) => {
    setCircuit((c) => ({
      ...c,
      nodes: c.nodes.map((n) => (n.id === id ? { ...n, rotation: (n.rotation + 90) % 360 } : n)),
    }));
  }, []);

  const deleteNode = useCallback((id: string) => {
    setCircuit((c) => ({
      nodes: c.nodes.filter((n) => n.id !== id),
      wires: c.wires.filter((w) => w.from.node !== id && w.to.node !== id),
    }));
    setSelected(null);
    setPending(null);
  }, []);

  const deleteWire = useCallback((id: string) => {
    setCircuit((c) => ({ ...c, wires: c.wires.filter((w) => w.id !== id) }));
    setSelected(null);
  }, []);

  const changeWirePin = useCallback((wireId: string, end: "from" | "to", pin: string) => {
    setCircuit((c) => {
      const wire = c.wires.find((w) => w.id === wireId);
      if (!wire) return c;
      const next = { ...wire, [end]: { ...wire[end], pin } };
      const others: Circuit = { nodes: c.nodes, wires: c.wires.filter((w) => w.id !== wireId) };
      const check = canConnect(others, next.from, next.to);
      if (!check.ok) {
        toast.error(check.reason);
        return c;
      }
      return { ...c, wires: c.wires.map((w) => (w.id === wireId ? next : w)) };
    });
  }, []);

  const onPinClick = useCallback(
    (addr: PinAddr) => {
      setPending((prev) => {
        if (!prev) return addr;
        if (prev.node === addr.node && prev.pin === addr.pin) return null;
        const check = canConnect(circuit, prev, addr);
        if (!check.ok) {
          toast.error(check.reason);
          return null;
        }
        setCircuit((c) => ({
          ...c,
          wires: [
            ...c.wires,
            {
              id: newId("wire"),
              from: prev,
              to: addr,
              color: WIRE_COLORS[c.wires.length % WIRE_COLORS.length]!,
            },
          ],
        }));
        return null;
      });
    },
    [circuit],
  );

  const resetWorkspace = () => {
    stop();
    setCircuit(emptyCircuit());
    setCode(STARTER);
    setScenario(defaultScenario());
    setView({ x: 60, y: 40, z: 0.8 });
    setLogs([]);
    setOutputs([]);
    setSensors([]);
    setSelected(null);
    setPending(null);
    toast.success("Workspace reset");
  };

  /* -------------------------------- engine -------------------------------- */
  const pushLogs = (lines: LogLine[]) =>
    setLogs((l) => [...l, ...lines].slice(-400));

  const start = () => {
    const engine = new SimulationEngine(circuit, code, scenario);
    const res = engine.start();
    setLogs(res.logs);
    if (!res.ok) {
      engineRef.current = null;
      setRunning(false);
      const first = res.issues[0];
      toast.error(first ? first.message : "Simulation cannot start — see the console.");
      return;
    }
    engineRef.current = engine;
    setRunning(true);
  };

  const stop = () => {
    setRunning(false);
    engineRef.current = null;
  };

  const stepOnce = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    const r = engine.step();
    pushLogs(r.logs);
    setOutputs(r.outputs);
    setSensors(r.sensors);
    if (r.error) {
      setRunning(false);
      engineRef.current = null;
    }
  }, []);

  // live scenario updates reach the running engine immediately
  useEffect(() => {
    engineRef.current?.setScenario(scenario);
  }, [scenario]);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(stepOnce, Math.max(60, 1000 / scenario.speed));
    return () => window.clearInterval(id);
  }, [running, scenario.speed, stepOnce]);

  useEffect(() => {
    const el = consoleRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [logs]);

  /* -------------------------------- derived ------------------------------- */
  const issues = useMemo(() => validateCircuit(circuit, code), [circuit, code]);
  const errors = issues.filter((i) => i.level === "error");
  const selectedNode = selected?.kind === "node" ? circuit.nodes.find((n) => n.id === selected.id) : undefined;
  const selectedWire = selected?.kind === "wire" ? circuit.wires.find((w) => w.id === selected.id) : undefined;
  const netCount = useMemo(() => new Set([...buildNets(circuit).nets.keys()]).size, [circuit]);

  const categories = useMemo(() => {
    const map = new Map<string, typeof PARTS>();
    for (const p of PARTS) map.set(p.category, [...(map.get(p.category) ?? []), p]);
    return [...map.entries()];
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return categories
      .filter(([cat]) => category === "All" || cat === category)
      .map(([cat, parts]) => {
        const hits = parts.filter(
          (p) =>
            !q ||
            p.label.toLowerCase().includes(q) ||
            p.type.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q),
        );
        return [cat, hits] as const;
      })
      .filter(([, parts]) => parts.length > 0);
  }, [categories, category, query]);

  const cameraNode = circuit.nodes.find((n) => nodeDef(n)?.hasCamera);

  /* --------------------------------- tests -------------------------------- */
  const runTests = () => {
    if (!problem) return;
    setTesting(true);
    window.setTimeout(() => {
      const result = runSuite(code, problem, buildSuite(problem));
      setSuite(result);
      setTesting(false);
      if (!result.compiled) {
        setErrorLine(result.errors[0]?.line ?? null);
        toast.error("Compilation failed — tests could not run.");
        return;
      }
      setErrorLine(null);
      toast[result.passed === result.total ? "success" : "message"](
        `${result.passed}/${result.total} test cases passed`,
      );
    }, 120);
  };

  const submitAttempt = () => {
    if (!problem) return;
    if (circuit.nodes.length === 0) {
      toast.error("Build the circuit before submitting.");
      return;
    }
    const result = runSuite(code, problem, buildSuite(problem));
    setSuite(result);
    if (!result.compiled) {
      setErrorLine(result.errors[0]?.line ?? null);
      toast.error("Your sketch does not compile — fix the errors before submitting.");
      return;
    }
    const { passed: testsPassed, total: testsTotal, score } = result;
    update((s) => ({
      ...s,
      submissions: [
        {
          id: uid(),
          problemId: problem.id,
          submittedAt: new Date().toISOString(),
          notes: "",
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
    }));
    toast.success(`Submitted — ${testsPassed}/${testsTotal} passed · ${score} pts`);
  };

  const setProp = (nodeId: string, key: string, value: string | number) =>
    setCircuit((c) => ({
      ...c,
      nodes: c.nodes.map((n) => (n.id === nodeId ? { ...n, props: { ...n.props, [key]: value } } : n)),
    }));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <CircuitBoard className="h-6 w-6 text-cyan" /> Circuit <span className="text-gradient">Builder</span>
          </h1>
          {problem ? (
            <p className="mt-1 text-sm text-muted-foreground">
              <span className="mr-1">{problem.emoji}</span>
              <span className="font-semibold text-foreground">{problem.title}</span> · {problem.points} pts ·{" "}
              <Link
                to="/problems/$problemId"
                params={{ problemId: problem.id }}
                className="text-cyan hover:underline"
              >
                view statement
              </Link>
            </p>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">
              Place parts, wire pins, run your sketch and drive the scenario live.
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {savedAt ? `✓ Saved ${Math.max(1, Math.round((Date.now() - savedAt) / 1000))}s ago` : "Autosave on"}
          </span>
          {running ? (
            <button onClick={stop} className="inline-flex items-center gap-2 rounded-xl border border-danger px-5 py-3 text-sm font-semibold text-danger">
              <Square className="h-4 w-4" /> Stop
            </button>
          ) : (
            <button onClick={start} className="inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-5 py-3 text-sm font-semibold text-primary-foreground">
              <Play className="h-4 w-4" /> Run Simulation
            </button>
          )}
          <button
            onClick={() => {
              if (!engineRef.current) start();
              window.setTimeout(stepOnce, 0);
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-semibold"
          >
            <StepForward className="h-4 w-4" /> Step
          </button>
          <button onClick={resetWorkspace} className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-semibold text-muted-foreground">
            <Trash2 className="h-4 w-4" /> Reset
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[240px_1fr_320px]">
        <aside className="panel max-h-[720px] overflow-auto p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Component Library</h2>
          <div className="sticky top-0 z-10 -mx-4 mt-3 bg-card px-4 pb-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search components…"
                className="w-full rounded-lg border border-input bg-background py-2 pl-8 pr-2 text-xs outline-none focus:border-cyan"
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {["All", ...categories.map(([c]) => c)].map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                    category === c ? "border-cyan bg-cyan/10 text-cyan" : "border-border text-muted-foreground"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          {filtered.length === 0 && (
            <p className="mt-4 text-xs text-muted-foreground">No components match “{query}”.</p>
          )}
          {filtered.map(([cat, parts]) => (
            <div key={cat} className="mt-4">
              <p className="text-[11px] font-semibold uppercase text-cyan">{cat}</p>
              <ul className="mt-2 grid grid-cols-2 gap-2">
                {parts.map((p) => (
                  <li key={p.type}>
                    <button
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData("text/part", p.type)}
                      onClick={() => addPart(p.type)}
                      title={p.description}
                      className="flex w-full flex-col items-center gap-1.5 rounded-lg border border-border bg-surface-2 p-2 text-center text-[11px] leading-tight hover:border-cyan"
                    >
                      <PartIcon def={p} className="h-9 w-full" />
                      <span className="line-clamp-2">{p.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </aside>

        <div className="space-y-6">
          <div className="panel p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <Cable className="h-3.5 w-3.5 text-cyan" />
                {pending
                  ? `Selected ${nodeDef(circuit.nodes.find((n) => n.id === pending.node)!)?.label} · ${pending.pin} — click a second pin`
                  : "Click a pin then another to wire · drag to move · scroll to zoom · drag canvas to pan"}
              </span>
              <span>
                {circuit.nodes.length} parts · {circuit.wires.length} wires · {netCount} nets
              </span>
            </div>
            <CircuitCanvas
              circuit={circuit}
              view={view}
              onViewChange={setView}
              selected={selected}
              onSelect={setSelected}
              pending={pending}
              onPinClick={onPinClick}
              onMoveNode={moveNode}
              onRotateNode={rotateNode}
              onDeleteNode={deleteNode}
              onDropPart={addPart}
              outputs={outputs}
              running={running}
            />
          </div>

          <div className="panel p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Code2 className="h-4 w-4 text-cyan" /> sketch.ino
            </h2>
            <div className="mt-3">
              <CodeEditor value={code} onChange={setCode} errorLine={errorLine} rows={18} />
            </div>
          </div>

          {problem && (
            <TestPanel
              suite={suite}
              running={testing}
              points={problem.points}
              onRun={runTests}
              onSubmit={submitAttempt}
              submitted={state.submissions.find((x) => x.problemId === problem.id) ?? null}
            />
          )}

          <div className="panel p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Console / Serial Monitor</h2>
              <button onClick={() => setLogs([])} className="text-xs text-muted-foreground hover:text-foreground">
                Clear
              </button>
            </div>
            <pre ref={consoleRef} className="mt-3 h-64 overflow-auto rounded-xl bg-background p-4 font-mono text-xs leading-relaxed">
              {logs.length === 0
                ? "// run the simulation to see serial output, pin activity and errors"
                : logs
                    .map((l) => `[${String(l.t).padStart(6, " ")}ms] ${l.kind === "serial" ? "" : `${l.kind.toUpperCase()}: `}${l.text}`)
                    .join("\n")}
            </pre>
          </div>
        </div>

        <aside className="space-y-6">
          {cameraNode && (
            <CameraPanel
              running={running}
              resolution={String(cameraNode.props["resolution"] ?? "VGA 640x480")}
              facing={String(cameraNode.props["facing"] ?? "Front")}
              label={nodeDef(cameraNode)?.label ?? "Camera"}
            />
          )}
          <ScenarioPanel circuit={circuit} scenario={scenario} onChange={setScenario} running={running} />

          <div className="panel p-5">
            <h2 className="text-sm font-semibold">Live Readings</h2>
            {sensors.length === 0 ? (
              <p className="mt-2 text-xs text-muted-foreground">No sensor readings yet.</p>
            ) : (
              <ul className="mt-3 space-y-2 text-xs">
                {sensors.map((s) => (
                  <li key={s.nodeId} className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-mono text-cyan">{s.reading}</span>
                  </li>
                ))}
              </ul>
            )}
            <h3 className="mt-5 text-sm font-semibold">Outputs</h3>
            {outputs.length === 0 ? (
              <p className="mt-2 text-xs text-muted-foreground">No actuators driven yet.</p>
            ) : (
              <ul className="mt-3 space-y-2 text-xs">
                {outputs.map((o) => (
                  <li key={o.nodeId} className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${o.active ? "bg-success" : "bg-border"}`} />
                      {o.label}
                    </span>
                    <span className="font-mono text-cyan">{o.detail}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {selectedNode && (
            <div className="panel p-5">
              <h2 className="text-sm font-semibold">{nodeDef(selectedNode)?.label}</h2>
              <p className="mt-1 text-xs text-muted-foreground">{nodeDef(selectedNode)?.description}</p>
              <div className="mt-3 flex gap-2">
                <button onClick={() => rotateNode(selectedNode.id)} className="rounded-lg border border-border px-3 py-1.5 text-xs">
                  Rotate ({selectedNode.rotation}°)
                </button>
                <button onClick={() => deleteNode(selectedNode.id)} className="rounded-lg border border-danger px-3 py-1.5 text-xs text-danger">
                  Delete
                </button>
              </div>
              {(nodeDef(selectedNode)?.props ?? []).map((p) => (
                <div key={p.key} className="mt-3">
                  <label className="text-xs text-muted-foreground">{p.label}</label>
                  {p.type === "select" ? (
                    <select
                      value={String(selectedNode.props[p.key] ?? p.default)}
                      onChange={(e) => setProp(selectedNode.id, p.key, e.target.value)}
                      className="mt-1 w-full rounded-lg border border-input bg-background px-2 py-1.5 text-xs"
                    >
                      {(p.options ?? []).map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={p.type === "number" ? "number" : "text"}
                      value={String(selectedNode.props[p.key] ?? p.default)}
                      min={p.min}
                      max={p.max}
                      step={p.step}
                      onChange={(e) =>
                        setProp(selectedNode.id, p.key, p.type === "number" ? Number(e.target.value) : e.target.value)
                      }
                      className="mt-1 w-full rounded-lg border border-input bg-background px-2 py-1.5 text-xs"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {selectedWire && (
            <div className="panel p-5">
              <h2 className="text-sm font-semibold">Wire</h2>
              {(["from", "to"] as const).map((end) => {
                const addr = selectedWire[end];
                const node = circuit.nodes.find((n) => n.id === addr.node);
                if (!node) return null;
                return (
                  <div key={end} className="mt-3">
                    <label className="text-xs text-muted-foreground">
                      {end === "from" ? "From" : "To"} · {nodeDef(node)?.label}
                    </label>
                    <select
                      value={addr.pin}
                      onChange={(e) => changeWirePin(selectedWire.id, end, e.target.value)}
                      className="mt-1 w-full rounded-lg border border-input bg-background px-2 py-1.5 text-xs"
                    >
                      {(nodeDef(node)?.pins ?? []).map((pin) => (
                        <option key={pin.id} value={pin.id}>
                          {pin.label} ({pin.kind})
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
              <button
                onClick={() => deleteWire(selectedWire.id)}
                className="mt-4 w-full rounded-lg border border-danger px-3 py-1.5 text-xs text-danger"
              >
                Remove wire
              </button>
            </div>
          )}

          <div className="panel p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Pre-flight checks</h2>
              <Save className="h-4 w-4 text-muted-foreground" />
            </div>
            {issues.length === 0 ? (
              <p className="mt-2 text-xs text-success">All checks passed — ready to run.</p>
            ) : (
              <ul className="mt-3 space-y-2 text-xs">
                {issues.slice(0, 8).map((i, idx) => (
                  <li key={idx} className={i.level === "error" ? "text-danger" : "text-warning"}>
                    {i.level === "error" ? "⚠️" : "•"} {i.message}
                    {i.hint && <span className="block text-muted-foreground">{i.hint}</span>}
                  </li>
                ))}
              </ul>
            )}
            {errors.length > 0 && (
              <p className="mt-3 text-[11px] text-muted-foreground">
                Simulation cannot start until {errors.length} error{errors.length > 1 ? "s are" : " is"} resolved.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
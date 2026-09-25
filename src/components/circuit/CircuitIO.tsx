import { useEffect, useRef, useState } from "react";
import { Code2, Cpu, Download, FolderOpen, Image, Play, Save, Sprout, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import type { Circuit } from "@/lib/circuit/model";
import type { Scenario } from "@/lib/circuit/engine";
import { downloadCircuitPng, downloadCircuitSvg } from "@/lib/circuit/export-image";
import { gardenCircuit } from "@/lib/circuit/templates";
import { BOARD_PARTS, boardNodeOf, retargetBoard } from "@/lib/circuit/board-map";
import { generateSketch } from "@/lib/circuit/codegen";

export type CircuitFile = {
  format: "iot-simlab.circuit";
  version: 1;
  name: string;
  problemId?: string;
  savedAt: string;
  circuit: Circuit;
  code: string;
  scenario: Scenario;
};

const SNAPSHOTS = "simlab-circuit-snapshots";

type StoredSnapshot = CircuitFile & { id: string };

const readSnapshots = (): StoredSnapshot[] => {
  try {
    const raw = window.localStorage.getItem(SNAPSHOTS);
    const list = raw ? (JSON.parse(raw) as StoredSnapshot[]) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
};

function isCircuitFile(v: unknown): v is CircuitFile {
  const f = v as CircuitFile | null;
  return !!f && typeof f === "object" && !!f.circuit && Array.isArray(f.circuit.nodes) && Array.isArray(f.circuit.wires);
}

type Props = {
  circuit: Circuit;
  code: string;
  scenario: Scenario;
  problemId: string | undefined;
  onImport: (file: CircuitFile) => void;
  /** replace the sketch in the editor with generated code */
  onCode?: (code: string) => void;
  /** replace the circuit (used by the board selector) */
  onCircuit?: (circuit: Circuit) => void;
  /** generate the sketch and immediately start the simulation with it */
  onGenerateRun?: () => void;
};

/** Export/import the builder state as JSON, plus named snapshots kept in local storage. */
export function CircuitIO({ circuit, code, scenario, problemId, onImport, onCode, onCircuit, onGenerateRun }: Props) {
  const board = boardNodeOf(circuit);
  const [name, setName] = useState("My circuit");
  const [snapshots, setSnapshots] = useState<StoredSnapshot[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => setSnapshots(readSnapshots()), []);

  const persist = (list: StoredSnapshot[]) => {
    setSnapshots(list);
    window.localStorage.setItem(SNAPSHOTS, JSON.stringify(list));
  };

  const payload = (): CircuitFile => ({
    format: "iot-simlab.circuit",
    version: 1,
    name: name.trim() || "Untitled circuit",
    ...(problemId ? { problemId } : {}),
    savedAt: new Date().toISOString(),
    circuit,
    code,
    scenario,
  });

  const exportJson = () => {
    const file = payload();
    const blob = new Blob([JSON.stringify(file, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${file.name.replace(/[^a-z0-9-_]+/gi, "-").toLowerCase()}.circuit.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported “${file.name}”`);
  };

  const importJson = async (file: File) => {
    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (!isCircuitFile(parsed)) {
        toast.error("That file is not a valid IoT SimLab circuit.");
        return;
      }
      onImport(parsed);
      setName(parsed.name ?? "Imported circuit");
      toast.success(`Imported “${parsed.name ?? file.name}”`);
    } catch {
      toast.error("Could not read that JSON file.");
    }
  };

  const slug = () => (name.trim() || "circuit").replace(/[^a-z0-9-_]+/gi, "-").toLowerCase();

  const exportSvg = () => {
    if (circuit.nodes.length === 0) {
      toast.error("Place a component before exporting a diagram.");
      return;
    }
    downloadCircuitSvg(circuit, `${slug()}.svg`, name.trim() || "Circuit diagram");
    toast.success("Diagram exported as SVG");
  };

  const exportPng = async () => {
    if (circuit.nodes.length === 0) {
      toast.error("Place a component before exporting a diagram.");
      return;
    }
    try {
      await downloadCircuitPng(circuit, `${slug()}.png`, name.trim() || "Circuit diagram");
      toast.success("Diagram exported as PNG");
    } catch {
      toast.error("Could not render the PNG — try the SVG export.");
    }
  };

  const loadGarden = () => {
    const garden = gardenCircuit();
    onImport({
      format: "iot-simlab.circuit",
      version: 1,
      name: garden.name,
      savedAt: new Date().toISOString(),
      circuit: garden.circuit,
      code: garden.code,
      scenario,
    });
    setName(garden.name);
  };

  const changeBoard = (type: string) => {
    const res = retargetBoard(circuit, type);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    onCircuit?.(res.circuit);
    const gen = generateSketch(res.circuit, scenario);
    if (gen.code) onCode?.(gen.code);
    toast.success(`Switched to ${res.boardLabel}`, {
      description: res.changes.length
        ? `Rewired: ${res.changes.join(", ")}. Sketch regenerated with the new pin numbers.`
        : "All wires kept their pins. Sketch regenerated with the new pin numbers.",
    });
  };

  const generateCode = () => {
    const gen = generateSketch(circuit, scenario);
    if (!gen.code) {
      toast.error(gen.notes[0] ?? "Nothing to generate yet.");
      return;
    }
    if (onCode) onCode(gen.code);
    else
      onImport({
        format: "iot-simlab.circuit",
        version: 1,
        name: name.trim() || "Generated sketch",
        savedAt: new Date().toISOString(),
        circuit,
        code: gen.code,
        scenario,
      });
    toast.success(`Sketch generated for ${gen.boardLabel}`, { description: gen.notes.join(" ") });
  };

  const saveSnapshot = () => {
    const snap: StoredSnapshot = { ...payload(), id: `snap-${Date.now().toString(36)}` };
    persist([snap, ...snapshots].slice(0, 20));
    toast.success(`Saved “${snap.name}” to this browser`);
  };

  return (
    <section aria-labelledby="circuit-io-heading" className="panel p-5">
      <h2 id="circuit-io-heading" className="flex items-center gap-2 text-sm font-semibold">
        <FolderOpen className="h-4 w-4 text-cyan" aria-hidden="true" /> Share &amp; Restore
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Export the circuit as JSON or a shareable SVG/PNG diagram, or keep named snapshots in this browser.
      </p>

      <div className="mt-3">
        <label htmlFor="circuit-name" className="text-xs text-muted-foreground">
          Circuit name
        </label>
        <input
          id="circuit-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-input bg-background px-2 py-1.5 text-xs outline-none focus-visible:border-cyan focus-visible:ring-2 focus-visible:ring-cyan/40"
        />
      </div>

      <div className="mt-3">
        <label htmlFor="circuit-board" className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Cpu className="h-3.5 w-3.5" aria-hidden="true" /> Microcontroller
        </label>
        <select
          id="circuit-board"
          value={board?.type ?? ""}
          disabled={!board || !onCircuit}
          onChange={(e) => changeBoard(e.target.value)}
          className="mt-1 w-full rounded-lg border border-input bg-background px-2 py-1.5 text-xs outline-none focus-visible:border-cyan focus-visible:ring-2 focus-visible:ring-cyan/40 disabled:opacity-60"
        >
          {!board && <option value="">Place a board first</option>}
          {BOARD_PARTS.map((b) => (
            <option key={b.type} value={b.type}>
              {b.label}
            </option>
          ))}
        </select>
        <p className="mt-1 text-[10px] text-muted-foreground">
          Switching boards moves each wire to a matching real pin and regenerates the sketch.
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={exportJson}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
        >
          <Download className="h-3.5 w-3.5" aria-hidden="true" /> Export JSON
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
        >
          <Upload className="h-3.5 w-3.5" aria-hidden="true" /> Import JSON
        </button>
        <button
          type="button"
          onClick={exportSvg}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
        >
          <Image className="h-3.5 w-3.5" aria-hidden="true" /> Export SVG
        </button>
        <button
          type="button"
          onClick={() => void exportPng()}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
        >
          <Image className="h-3.5 w-3.5" aria-hidden="true" /> Export PNG
        </button>
        <button
          type="button"
          onClick={loadGarden}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-cyan/50 px-3 text-xs font-semibold text-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
        >
          <Sprout className="h-3.5 w-3.5" aria-hidden="true" /> Load garden circuit
        </button>
        <button
          type="button"
          onClick={generateCode}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-violet/50 px-3 text-xs font-semibold text-violet focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
        >
          <Code2 className="h-3.5 w-3.5" aria-hidden="true" /> Generate sketch
        </button>
        {onGenerateRun && (
          <button
            type="button"
            onClick={onGenerateRun}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-brand-gradient px-3 text-xs font-semibold text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
          >
            <Play className="h-3.5 w-3.5" aria-hidden="true" /> Generate → Run
          </button>
        )}
        <button
          type="button"
          onClick={saveSnapshot}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
        >
          <Save className="h-3.5 w-3.5" aria-hidden="true" /> Save snapshot
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          aria-label="Import a circuit JSON file"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void importJson(f);
            e.target.value = "";
          }}
        />
      </div>

      <h3 className="mt-5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Saved snapshots ({snapshots.length})
      </h3>
      {snapshots.length === 0 ? (
        <p className="mt-2 text-xs text-muted-foreground">No snapshots yet.</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {snapshots.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-2 rounded-lg border border-border p-2">
              <span className="min-w-0">
                <span className="block truncate text-xs font-semibold">{s.name}</span>
                <span className="block text-[10px] text-muted-foreground">
                  {s.circuit.nodes.length} parts · {new Date(s.savedAt).toLocaleString()}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    onImport(s);
                    setName(s.name);
                    toast.success(`Restored “${s.name}”`);
                  }}
                  className="rounded-lg border border-border px-2 py-1 text-[10px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
                >
                  Restore
                </button>
                <button
                  type="button"
                  onClick={() => persist(snapshots.filter((x) => x.id !== s.id))}
                  aria-label={`Delete snapshot ${s.name}`}
                  className="rounded-lg border border-border p-1.5 text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

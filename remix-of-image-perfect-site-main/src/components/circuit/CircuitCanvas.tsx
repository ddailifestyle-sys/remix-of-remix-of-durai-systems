import { useCallback, useEffect, useRef, useState } from "react";
import { Maximize2, Minus, Plus, RotateCw, Trash2 } from "lucide-react";
import {
  nodeDef,
  type Circuit,
  type CircuitNode,
  type PinAddr,
} from "@/lib/circuit/model";
import { circuitBounds, nodeSize, pinLocal, pinPosition, wirePath } from "@/lib/circuit/geometry";
import type { ComponentOutput } from "@/lib/circuit/engine";

export type View = { x: number; y: number; z: number };

type Props = {
  circuit: Circuit;
  view: View;
  onViewChange: (v: View) => void;
  selected: { kind: "node" | "wire"; id: string } | null;
  onSelect: (s: { kind: "node" | "wire"; id: string } | null) => void;
  pending: PinAddr | null;
  onPinClick: (addr: PinAddr) => void;
  onMoveNode: (id: string, x: number, y: number) => void;
  onRotateNode: (id: string) => void;
  onDeleteNode: (id: string) => void;
  onDropPart: (type: string, x: number, y: number) => void;
  outputs: ComponentOutput[];
  running: boolean;
};

const MIN_Z = 0.25;
const MAX_Z = 3;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const PIN_FILL: Record<string, string> = {
  power: "var(--danger)",
  ground: "var(--muted-foreground)",
  digital: "var(--cyan)",
  pwm: "var(--violet)",
  analog: "var(--success)",
  i2c: "var(--warning)",
  passive: "var(--border)",
};

export function CircuitCanvas(props: Props) {
  const {
    circuit, view, onViewChange, selected, onSelect, pending, onPinClick,
    onMoveNode, onRotateNode, onDeleteNode, onDropPart, outputs, running,
  } = props;
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: string; dx: number; dy: number } | null>(null);
  const panRef = useRef<{ x: number; y: number; vx: number; vy: number } | null>(null);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const viewRef = useRef(view);
  viewRef.current = view;

  const toWorld = useCallback((clientX: number, clientY: number) => {
    const rect = ref.current?.getBoundingClientRect();
    const v = viewRef.current;
    if (!rect) return { x: 0, y: 0 };
    return { x: (clientX - rect.left - v.x) / v.z, y: (clientY - rect.top - v.y) / v.z };
  }, []);

  // non-passive wheel: zoom anchored at the cursor
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const v = viewRef.current;
      const rect = el.getBoundingClientRect();
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
      const next = clamp(v.z * Math.exp(-dy * 0.0015), MIN_Z, MAX_Z);
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const k = next / v.z;
      onViewChange({ z: next, x: px - (px - v.x) * k, y: py - (py - v.y) * k });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [onViewChange]);

  const zoomAtCenter = (factor: number) => {
    const rect = ref.current?.getBoundingClientRect();
    const v = viewRef.current;
    const px = (rect?.width ?? 800) / 2;
    const py = (rect?.height ?? 600) / 2;
    const next = clamp(v.z * factor, MIN_Z, MAX_Z);
    const k = next / v.z;
    onViewChange({ z: next, x: px - (px - v.x) * k, y: py - (py - v.y) * k });
  };

  const fit = () => {
    const rect = ref.current?.getBoundingClientRect();
    const b = circuitBounds(circuit);
    const w = rect?.width ?? 800;
    const h = rect?.height ?? 600;
    const z = clamp(Math.min((w - 80) / Math.max(b.w, 1), (h - 80) / Math.max(b.h, 1)), MIN_Z, 1.5);
    onViewChange({ z, x: w / 2 - (b.x + b.w / 2) * z, y: h / 2 - (b.y + b.h / 2) * z });
  };

  const onPointerDownBackground = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.button !== 1) return;
    onSelect(null);
    panRef.current = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y };
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const w = toWorld(e.clientX, e.clientY);
    if (pending) setCursor(w);
    if (drag.current) {
      onMoveNode(drag.current.id, Math.round(w.x - drag.current.dx), Math.round(w.y - drag.current.dy));
      return;
    }
    const p = panRef.current;
    if (p) onViewChange({ ...viewRef.current, x: p.vx + (e.clientX - p.x), y: p.vy + (e.clientY - p.y) });
  };

  const endPointer = (e: React.PointerEvent) => {
    drag.current = null;
    panRef.current = null;
    try {
      (e.currentTarget as Element).releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const startNodeDrag = (e: React.PointerEvent, n: CircuitNode) => {
    e.stopPropagation();
    onSelect({ kind: "node", id: n.id });
    const w = toWorld(e.clientX, e.clientY);
    drag.current = { id: n.id, dx: w.x - n.x, dy: w.y - n.y };
    (e.currentTarget as Element).closest("svg")?.setPointerCapture(e.pointerId);
  };

  const outputFor = (id: string) => outputs.find((o) => o.nodeId === id);

  return (
    <div
      ref={ref}
      className="relative h-[560px] w-full overflow-hidden rounded-2xl border border-border bg-surface-2"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const type = e.dataTransfer.getData("text/part");
        if (!type) return;
        const w = toWorld(e.clientX, e.clientY);
        onDropPart(type, Math.round(w.x), Math.round(w.y));
      }}
    >
      <svg
        className="h-full w-full touch-none select-none"
        style={{ cursor: pending ? "crosshair" : "grab" }}
        onPointerDown={onPointerDownBackground}
        onPointerMove={onPointerMove}
        onPointerUp={endPointer}
        onPointerLeave={endPointer}
      >
        <defs>
          <pattern id="cb-grid" width={24} height={24} patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="currentColor" strokeWidth={1} className="text-border/50" />
          </pattern>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="url(#cb-grid)"
          transform={`translate(${view.x % (24 * view.z)} ${view.y % (24 * view.z)}) scale(${view.z})`}
        />
        <g transform={`translate(${view.x} ${view.y}) scale(${view.z})`}>
          {/* wires */}
          {circuit.wires.map((w) => {
            const na = circuit.nodes.find((n) => n.id === w.from.node);
            const nb = circuit.nodes.find((n) => n.id === w.to.node);
            if (!na || !nb) return null;
            const a = pinPosition(na, w.from.pin);
            const b = pinPosition(nb, w.to.pin);
            const isSel = selected?.kind === "wire" && selected.id === w.id;
            return (
              <g key={w.id} onPointerDown={(e) => { e.stopPropagation(); onSelect({ kind: "wire", id: w.id }); }}>
                <path d={wirePath(a, b)} fill="none" stroke="transparent" strokeWidth={14} className="cursor-pointer" />
                <path
                  d={wirePath(a, b)}
                  fill="none"
                  stroke={w.color}
                  strokeWidth={isSel ? 5 : 3}
                  strokeLinecap="round"
                  opacity={isSel ? 1 : 0.85}
                  className={running ? "animate-pulse" : ""}
                />
              </g>
            );
          })}

          {/* pending wire preview */}
          {pending && cursor && (() => {
            const n = circuit.nodes.find((x) => x.id === pending.node);
            if (!n) return null;
            const a = pinPosition(n, pending.pin);
            return <path d={wirePath(a, cursor)} fill="none" stroke="var(--cyan)" strokeWidth={2} strokeDasharray="6 6" />;
          })()}

          {/* nodes */}
          {circuit.nodes.map((n) => {
            const def = nodeDef(n);
            if (!def) return null;
            const { w, h } = nodeSize(n);
            const cx = n.x + w / 2;
            const cy = n.y + h / 2;
            const isSel = selected?.kind === "node" && selected.id === n.id;
            const out = outputFor(n.id);
            return (
              <g key={n.id} transform={`rotate(${n.rotation} ${cx} ${cy})`}>
                <rect
                  x={n.x}
                  y={n.y}
                  width={w}
                  height={h}
                  rx={12}
                  fill="var(--surface)"
                  stroke={isSel ? "var(--cyan)" : def.color}
                  strokeWidth={isSel ? 3 : 1.5}
                  className="cursor-move"
                  onPointerDown={(e) => startNodeDrag(e, n)}
                />
                <rect x={n.x} y={n.y} width={w} height={22} rx={10} fill={def.color} opacity={0.18} className="pointer-events-none" />
                <text x={cx} y={n.y + 16} textAnchor="middle" className="pointer-events-none fill-foreground text-[11px] font-semibold">
                  {def.label}
                </text>
                {out && (
                  <>
                    <circle cx={n.x + w - 14} cy={n.y + h - 14} r={6} fill={out.active ? def.color : "var(--border)"} className={out.active ? "animate-pulse" : ""} />
                    <text x={cx} y={n.y + h - 10} textAnchor="middle" className="pointer-events-none fill-muted-foreground text-[10px]">
                      {out.detail.slice(0, 26)}
                    </text>
                  </>
                )}
                {def.pins.map((pin) => {
                  const l = pinLocal(n, pin);
                  const px = n.x + l.x;
                  const py = n.y + l.y;
                  const isPending = pending?.node === n.id && pending.pin === pin.id;
                  const wired = circuit.wires.some(
                    (x) =>
                      (x.from.node === n.id && x.from.pin === pin.id) ||
                      (x.to.node === n.id && x.to.pin === pin.id),
                  );
                  return (
                    <g
                      key={pin.id}
                      className="cursor-pointer"
                      onPointerDown={(e) => { e.stopPropagation(); }}
                      onClick={(e) => { e.stopPropagation(); onPinClick({ node: n.id, pin: pin.id }); }}
                    >
                      <circle cx={px} cy={py} r={9} fill="transparent" />
                      <circle
                        cx={px}
                        cy={py}
                        r={isPending ? 6 : 4.5}
                        fill={wired ? PIN_FILL[pin.kind] : "var(--background)"}
                        stroke={isPending ? "var(--cyan)" : PIN_FILL[pin.kind]}
                        strokeWidth={2}
                      />
                      <text
                        x={px}
                        y={pin.side === "bottom" ? py + 16 : py - 8}
                        textAnchor="middle"
                        className="pointer-events-none fill-muted-foreground text-[9px] font-mono"
                      >
                        {pin.label}
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })}
        </g>
      </svg>

      <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
        <div className="pointer-events-auto flex items-center gap-1 rounded-xl border border-border bg-surface/95 p-1 shadow-lg backdrop-blur">
          <button onClick={() => zoomAtCenter(1 / 1.2)} className="rounded-lg p-2 hover:bg-surface-2" aria-label="Zoom out">
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-14 text-center font-mono text-xs text-muted-foreground">{Math.round(view.z * 100)}%</span>
          <button onClick={() => zoomAtCenter(1.2)} className="rounded-lg p-2 hover:bg-surface-2" aria-label="Zoom in">
            <Plus className="h-4 w-4" />
          </button>
          <button onClick={fit} className="rounded-lg p-2 hover:bg-surface-2" aria-label="Fit to view">
            <Maximize2 className="h-4 w-4" />
          </button>
          <div className="mx-1 h-5 w-px bg-border" />
          <button
            disabled={selected?.kind !== "node"}
            onClick={() => selected && onRotateNode(selected.id)}
            className="rounded-lg p-2 hover:bg-surface-2 disabled:opacity-40"
            aria-label="Rotate component"
          >
            <RotateCw className="h-4 w-4" />
          </button>
          <button
            disabled={selected?.kind !== "node"}
            onClick={() => selected && onDeleteNode(selected.id)}
            className="rounded-lg p-2 text-danger hover:bg-surface-2 disabled:opacity-40"
            aria-label="Delete component"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {circuit.nodes.length === 0 && (
        <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
          Drag a component from the library, or click it to place it here.
        </p>
      )}
    </div>
  );
}
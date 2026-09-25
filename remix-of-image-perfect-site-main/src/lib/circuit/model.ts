import { defaultProps, partByType, type PartDef } from "./parts";

export type NodeId = string;
export type CircuitNode = {
  id: NodeId;
  type: string;
  x: number;
  y: number;
  rotation: number;
  props: Record<string, string | number>;
};
export type PinAddr = { node: NodeId; pin: string };
export type CircuitWire = { id: string; from: PinAddr; to: PinAddr; color: string };
export type Circuit = { nodes: CircuitNode[]; wires: CircuitWire[] };

export const emptyCircuit = (): Circuit => ({ nodes: [], wires: [] });

export const WIRE_COLORS = ["#ef4444", "#22c55e", "#3b82f6", "#eab308", "#a855f7", "#e2e8f0"];

let counter = 0;
export const newId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${(counter++).toString(36)}-${Math.floor(Math.random() * 1e4).toString(36)}`;

export function createNode(def: PartDef, x: number, y: number): CircuitNode {
  return { id: newId(def.type), type: def.type, x, y, rotation: 0, props: defaultProps(def) };
}

export const nodeDef = (n: CircuitNode) => partByType(n.type)!;
export const pinKey = (a: PinAddr) => `${a.node}:${a.pin}`;
export const samePin = (a: PinAddr, b: PinAddr) => a.node === b.node && a.pin === b.pin;

/** Union-find over wires so breadboard rails and daisy chains form one net. */
export function buildNets(circuit: Circuit) {
  const parent = new Map<string, string>();
  const find = (k: string): string => {
    if (!parent.has(k)) parent.set(k, k);
    const p = parent.get(k)!;
    if (p === k) return k;
    const r = find(p);
    parent.set(k, r);
    return r;
  };
  const union = (a: string, b: string) => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent.set(ra, rb);
  };
  for (const n of circuit.nodes)
    for (const pin of nodeDef(n)?.pins ?? []) find(`${n.id}:${pin.id}`);
  // breadboard: every hole on a board shares its rail group
  for (const n of circuit.nodes) {
    if (n.type !== "breadboard") continue;
    const holes = nodeDef(n).pins.filter((x) => x.kind === "passive");
    for (let i = 1; i < holes.length; i++) union(`${n.id}:${holes[0]!.id}`, `${n.id}:${holes[i]!.id}`);
  }
  for (const w of circuit.wires) union(pinKey(w.from), pinKey(w.to));

  const nets = new Map<string, PinAddr[]>();
  for (const n of circuit.nodes)
    for (const pin of nodeDef(n)?.pins ?? []) {
      const root = find(`${n.id}:${pin.id}`);
      const list = nets.get(root) ?? [];
      list.push({ node: n.id, pin: pin.id });
      nets.set(root, list);
    }
  const netOf = (a: PinAddr) => nets.get(find(pinKey(a))) ?? [{ ...a }];
  return { netOf, nets };
}

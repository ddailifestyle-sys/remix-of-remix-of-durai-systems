/*
 * Board retargeting + board pin usage.
 *
 * Every board definition uses the same pin id vocabulary (D<n>, A<n>, SDA, SCL,
 * 3V3, 5V, GND, GND2) but exposes a different set of them, so swapping the
 * microcontroller means remapping the wires that land on missing pins.
 */
import { nodeDef, type Circuit, type CircuitNode } from "./model";
import { PARTS, partByType, type PartDef, type PartPin, type PinKind } from "./parts";
import { boardPinNumbers } from "./pin-numbers";

export const BOARD_PARTS: PartDef[] = PARTS.filter((p) => p.isBoard);

export const boardNodeOf = (circuit: Circuit): CircuitNode | undefined =>
  circuit.nodes.find((n) => nodeDef(n)?.isBoard);

const isSignal = (k: PinKind) => k === "digital" || k === "pwm" || k === "analog" || k === "i2c";

/**
 * Pick a replacement pin of a compatible kind that is not already taken.
 * `taken` holds physical GPIO numbers (as strings) as well as pin ids, so two
 * silkscreen names for the same GPIO (e.g. GPIO1 and A0 on the S3) never collide.
 */
function substitute(target: PartDef, pin: PartPin, taken: Set<string>): PartPin | undefined {
  const nums = boardPinNumbers(target.type).byId;
  const free = (p: PartPin) => {
    if (taken.has(p.id)) return false;
    const n = nums.get(p.id);
    return p.kind === "power" || p.kind === "ground" || n === undefined || !taken.has(`#${n}`);
  };
  const want =
    pin.kind === "analog"
      ? (p: PartPin) => p.kind === "analog"
      : pin.kind === "i2c"
        ? (p: PartPin) => p.kind === "i2c"
        : pin.kind === "power"
          ? (p: PartPin) => p.kind === "power"
          : pin.kind === "ground"
            ? (p: PartPin) => p.kind === "ground"
            : (p: PartPin) => p.kind === "digital" || p.kind === "pwm";
  const pool = target.pins.filter(want);
  return pool.find(free) ?? pool[0];
}

export type RetargetResult = {
  circuit: Circuit;
  boardLabel: string;
  /** human readable "OLED SDA: A4 → GPIO21" style notes */
  changes: string[];
  error?: string;
};

/** Swap the placed board for another microcontroller, remapping every wire. */
export function retargetBoard(circuit: Circuit, boardType: string): RetargetResult {
  const board = boardNodeOf(circuit);
  const target = partByType(boardType);
  if (!board) return { circuit, boardLabel: "", changes: [], error: "Place a board before choosing a target." };
  if (!target?.isBoard) return { circuit, boardLabel: "", changes: [], error: "Unknown target board." };
  if (board.type === boardType) return { circuit, boardLabel: target.label, changes: [] };

  const available = new Map(target.pins.map((p) => [p.id, p] as const));
  const targetNums = boardPinNumbers(boardType).byId;
  const taken = new Set<string>();
  const claim = (id: string) => {
    taken.add(id);
    const n = targetNums.get(id);
    const kind = available.get(id)?.kind;
    if (n !== undefined && kind !== "power" && kind !== "ground") taken.add(`#${n}`);
  };
  const changes: string[] = [];
  const oldDef = nodeDef(board);

  // keep pins that exist on the new board, then fill the gaps
  for (const w of circuit.wires)
    for (const end of ["from", "to"] as const)
      if (w[end].node === board.id && available.has(w[end].pin)) claim(w[end].pin);

  const remap = new Map<string, string>();
  const wires = circuit.wires.map((w) => {
    let next = w;
    for (const end of ["from", "to"] as const) {
      const addr = next[end];
      if (addr.node !== board.id || available.has(addr.pin)) continue;
      const mapped = remap.get(addr.pin);
      if (mapped) {
        next = { ...next, [end]: { ...addr, pin: mapped } };
        continue;
      }
      const oldPin = oldDef?.pins.find((p) => p.id === addr.pin);
      const sub = oldPin ? substitute(target, oldPin, taken) : undefined;
      if (!sub) continue;
      claim(sub.id);
      remap.set(addr.pin, sub.id);
      changes.push(`${oldPin?.label ?? addr.pin} → ${sub.label}`);
      next = { ...next, [end]: { ...addr, pin: sub.id } };
    }
    return next;
  });

  const nodes = circuit.nodes.map((n) =>
    n.id === board.id
      ? {
          ...n,
          type: boardType,
          props: Object.fromEntries((target.props ?? []).map((p) => [p.key, n.props[p.key] ?? p.default])),
        }
      : n,
  );

  return { circuit: { nodes, wires }, boardLabel: target.label, changes };
}

/* ------------------------------- pin usage -------------------------------- */

export type PinUse = {
  pinId: string;
  label: string;
  kind: PinKind;
  users: { nodeId: string; wireId: string; component: string; componentPin: string }[];
};

export type BoardUsage = {
  boardType: string;
  boardLabel: string;
  pins: PinUse[];
  usedCount: number;
  freeCount: number;
};

/** Which board pins are already wired, and to what. */
export function boardPinUsage(circuit: Circuit): BoardUsage | null {
  const board = boardNodeOf(circuit);
  const def = board ? nodeDef(board) : undefined;
  if (!board || !def) return null;

  const pins: PinUse[] = def.pins
    .filter((p) => isSignal(p.kind))
    .map((p) => ({ pinId: p.id, label: p.label, kind: p.kind, users: [] }));
  const byId = new Map(pins.map((p) => [p.pinId, p] as const));

  for (const w of circuit.wires) {
    for (const end of ["from", "to"] as const) {
      const addr = w[end];
      if (addr.node !== board.id) continue;
      const use = byId.get(addr.pin);
      if (!use) continue;
      const other = end === "from" ? w.to : w.from;
      const otherNode = circuit.nodes.find((n) => n.id === other.node);
      use.users.push({
        nodeId: other.node,
        wireId: w.id,
        component: (otherNode && nodeDef(otherNode)?.label) ?? "unknown part",
        componentPin: other.pin,
      });
    }
  }

  const usedCount = pins.filter((p) => p.users.length > 0).length;
  return {
    boardType: board.type,
    boardLabel: def.label,
    pins,
    usedCount,
    freeCount: pins.length - usedCount,
  };
}

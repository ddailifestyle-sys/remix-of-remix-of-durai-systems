import { nodeDef, type CircuitNode, type PinAddr, type Circuit } from "./model";
import type { PartPin } from "./parts";

export type Point = { x: number; y: number };

export const nodeSize = (n: CircuitNode) => {
  const def = nodeDef(n);
  return { w: def?.width ?? 120, h: def?.height ?? 80 };
};

export const nodeCenter = (n: CircuitNode): Point => {
  const { w, h } = nodeSize(n);
  return { x: n.x + w / 2, y: n.y + h / 2 };
};

/**
 * Local (unrotated) offset of a pin from the node's top-left corner.
 * When the node is flipped (mounted solder-side up) the pinout is mirrored
 * horizontally: left/right sides swap and top/bottom rows reverse order.
 */
export function pinLocal(n: CircuitNode, pin: PartPin): Point {
  const def = nodeDef(n);
  const { w, h } = nodeSize(n);
  const flipped = !!n.flipped;
  const side = flipped ? mirrorSide(pin.side) : pin.side;
  const sideList = (def?.pins ?? []).filter((x) => x.side === pin.side);
  const idx = Math.max(0, sideList.findIndex((x) => x.id === pin.id));
  const count = Math.max(1, sideList.length);
  const raw = (idx + 0.5) / count;
  // mirroring reverses the order along the row/column as well
  const along = flipped ? 1 - raw : raw;
  switch (side) {
    case "top":
      return { x: along * w, y: 0 };
    case "bottom":
      return { x: along * w, y: h };
    case "left":
      return { x: 0, y: along * h };
    default:
      return { x: w, y: along * h };
  }
}

/** Left/right swap when a part is flipped; top/bottom keep their edge. */
export function mirrorSide(side: PartPin["side"]): PartPin["side"] {
  if (side === "left") return "right";
  if (side === "right") return "left";
  return side;
}


export function rotatePoint(p: Point, center: Point, deg: number): Point {
  const a = (deg * Math.PI) / 180;
  const dx = p.x - center.x;
  const dy = p.y - center.y;
  return {
    x: center.x + dx * Math.cos(a) - dy * Math.sin(a),
    y: center.y + dx * Math.sin(a) + dy * Math.cos(a),
  };
}

/** World position of a pin, accounting for node rotation. */
export function pinPosition(n: CircuitNode, pinId: string): Point {
  const def = nodeDef(n);
  const pin = def?.pins.find((x) => x.id === pinId);
  if (!pin) return nodeCenter(n);
  const local = pinLocal(n, pin);
  return rotatePoint({ x: n.x + local.x, y: n.y + local.y }, nodeCenter(n), n.rotation);
}

export function wireEndpoints(circuit: Circuit, a: PinAddr, b: PinAddr) {
  const na = circuit.nodes.find((n) => n.id === a.node);
  const nb = circuit.nodes.find((n) => n.id === b.node);
  if (!na || !nb) return null;
  return { a: pinPosition(na, a.pin), b: pinPosition(nb, b.pin) };
}

/** Smooth-ish cubic path between two pins. */
export function wirePath(a: Point, b: Point) {
  const dx = Math.max(40, Math.abs(b.x - a.x) * 0.5);
  return `M ${a.x} ${a.y} C ${a.x + dx} ${a.y}, ${b.x - dx} ${b.y}, ${b.x} ${b.y}`;
}

export function circuitBounds(circuit: Circuit) {
  if (!circuit.nodes.length) return { x: 0, y: 0, w: 800, h: 600 };
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const n of circuit.nodes) {
    const { w, h } = nodeSize(n);
    minX = Math.min(minX, n.x);
    minY = Math.min(minY, n.y);
    maxX = Math.max(maxX, n.x + w);
    maxY = Math.max(maxY, n.y + h);
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}
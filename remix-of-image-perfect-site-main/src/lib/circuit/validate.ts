import { buildNets, nodeDef, pinKey, type Circuit, type PinAddr } from "./model";
import { pinDef, type PinKind } from "./parts";

export type Issue = { level: "error" | "warning"; message: string; hint?: string; nodeId?: string };

/** Which pin kinds may legally be wired together. */
const COMPATIBLE: Record<PinKind, PinKind[]> = {
  power: ["power", "passive"],
  ground: ["ground", "passive"],
  digital: ["digital", "pwm", "analog", "passive"],
  pwm: ["digital", "pwm", "analog", "passive"],
  analog: ["analog", "digital", "pwm", "passive"],
  i2c: ["i2c", "passive"],
  passive: ["power", "ground", "digital", "pwm", "analog", "i2c", "passive"],
};

export function canConnect(
  circuit: Circuit,
  a: PinAddr,
  b: PinAddr,
): { ok: true } | { ok: false; reason: string } {
  if (a.node === b.node) return { ok: false, reason: "Cannot wire a component to itself." };
  const na = circuit.nodes.find((n) => n.id === a.node);
  const nb = circuit.nodes.find((n) => n.id === b.node);
  if (!na || !nb) return { ok: false, reason: "Component no longer exists." };
  const pa = pinDef(na.type, a.pin);
  const pb = pinDef(nb.type, b.pin);
  if (!pa || !pb) return { ok: false, reason: "Unknown pin." };
  const dup = circuit.wires.some(
    (w) =>
      (pinKey(w.from) === pinKey(a) && pinKey(w.to) === pinKey(b)) ||
      (pinKey(w.from) === pinKey(b) && pinKey(w.to) === pinKey(a)),
  );
  if (dup) return { ok: false, reason: "These two pins are already connected." };
  if (!COMPATIBLE[pa.kind].includes(pb.kind))
    return {
      ok: false,
      reason: `${nodeDef(na).label} ${pa.label} (${pa.kind}) cannot connect to ${nodeDef(nb).label} ${pb.label} (${pb.kind}).`,
    };
  if (pa.kind === "power" && pb.kind === "ground")
    return { ok: false, reason: "Short circuit: power cannot be wired directly to ground." };

  const isSignal = (k: PinKind) => k === "digital" || k === "pwm" || k === "analog";
  const fanout = (addr: PinAddr, kind: PinKind) => {
    if (!isSignal(kind)) return 0;
    return circuit.wires.filter((w) => pinKey(w.from) === pinKey(addr) || pinKey(w.to) === pinKey(addr)).length;
  };
  const boardA = nodeDef(na).isBoard;
  const boardB = nodeDef(nb).isBoard;
  if (boardA && fanout(a, pa.kind) >= 1)
    return { ok: false, reason: `Arduino ${pa.label} is already driving another component. Choose a free pin.` };
  if (boardB && fanout(b, pb.kind) >= 1)
    return { ok: false, reason: `Arduino ${pb.label} is already driving another component. Choose a free pin.` };
  return { ok: true };
}

/** Map a component pin to the Arduino pin it eventually reaches (through breadboards). */
export function resolveBoardPin(circuit: Circuit, addr: PinAddr): string | null {
  const { netOf } = buildNets(circuit);
  for (const member of netOf(addr)) {
    const n = circuit.nodes.find((x) => x.id === member.node);
    if (n && nodeDef(n)?.isBoard) return member.pin;
  }
  return null;
}

export function validateCircuit(circuit: Circuit, code: string): Issue[] {
  const issues: Issue[] = [];
  const boards = circuit.nodes.filter((n) => nodeDef(n)?.isBoard);
  if (boards.length === 0)
    issues.push({
      level: "error",
      message: "No Arduino board on the workspace.",
      hint: "Add an Arduino UNO from the component library.",
    });
  if (boards.length > 1)
    issues.push({ level: "error", message: "More than one Arduino board found.", hint: "Delete the extra board." });
  if (circuit.nodes.length <= boards.length)
    issues.push({ level: "error", message: "No components connected to the Arduino.", hint: "Add at least one sensor or output." });
  if (!code.trim())
    issues.push({ level: "error", message: "The sketch is empty.", hint: "Write setup() and loop() before running." });

  const { netOf } = buildNets(circuit);
  const board = boards[0];
  const boardHas = (addr: PinAddr, kind: "power" | "ground") =>
    netOf(addr).some((m) => {
      const n = circuit.nodes.find((x) => x.id === m.node);
      if (!n) return false;
      const d = pinDef(n.type, m.pin);
      return !!d && d.kind === kind && (nodeDef(n).isBoard || n.type === "breadboard");
    });

  for (const n of circuit.nodes) {
    const def = nodeDef(n);
    if (!def || def.isBoard || def.type === "breadboard") continue;
    const wiredPins = new Set<string>();
    for (const w of circuit.wires) {
      if (w.from.node === n.id) wiredPins.add(w.from.pin);
      if (w.to.node === n.id) wiredPins.add(w.to.pin);
    }
    if (wiredPins.size === 0) {
      issues.push({ level: "error", nodeId: n.id, message: `${def.label} is not connected to anything.`, hint: "Wire it to the Arduino or delete it." });
      continue;
    }
    for (const pin of def.pins) {
      if (!pin.required || wiredPins.has(pin.id)) continue;
      issues.push({
        level: "error",
        nodeId: n.id,
        message: `${def.label} ${pin.label} pin is not connected.`,
        hint:
          pin.kind === "power"
            ? "Connect it to Arduino 5V."
            : pin.kind === "ground"
              ? "Connect it to an Arduino GND pin."
              : `Connect ${pin.label} to a ${pin.kind === "analog" ? "analog (A0-A5)" : "digital"} Arduino pin.`,
      });
    }
    if (board) {
      const powerPin = def.pins.find((x) => x.kind === "power");
      const gndPin = def.pins.find((x) => x.kind === "ground");
      if (powerPin && wiredPins.has(powerPin.id) && !boardHas({ node: n.id, pin: powerPin.id }, "power"))
        issues.push({ level: "error", nodeId: n.id, message: `${def.label} has no path to a 5V/3.3V supply.`, hint: "Trace VCC back to the Arduino 5V pin." });
      if (gndPin && wiredPins.has(gndPin.id) && !boardHas({ node: n.id, pin: gndPin.id }, "ground"))
        issues.push({ level: "error", nodeId: n.id, message: `${def.label} has no path to GND.`, hint: "Trace GND back to an Arduino GND pin." });
    }
  }

  // conflicting signal nets: two component signal pins sharing one Arduino pin
  const seen = new Map<string, string>();
  for (const n of circuit.nodes) {
    const def = nodeDef(n);
    if (!def || def.isBoard || def.type === "breadboard") continue;
    for (const pin of def.pins) {
      if (!["digital", "pwm", "analog"].includes(pin.kind)) continue;
      const bp = resolveBoardPin(circuit, { node: n.id, pin: pin.id });
      if (!bp) continue;
      const owner = `${def.label} ${pin.label}`;
      if (seen.has(bp) && seen.get(bp) !== owner)
        issues.push({
          level: "error",
          nodeId: n.id,
          message: `Arduino ${bp} is shared by ${seen.get(bp)} and ${owner}.`,
          hint: "Move one of them to a free pin.",
        });
      else seen.set(bp, owner);
    }
  }
  return issues;
}

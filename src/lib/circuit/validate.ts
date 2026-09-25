import { buildNets, nodeDef, pinKey, type Circuit, type PinAddr } from "./model";
import { pinDef, type PinKind } from "./parts";

export type Issue = {
  level: "error" | "warning";
  message: string;
  hint?: string;
  nodeId?: string;
  /** pins responsible for the issue — highlighted on the canvas */
  pins?: PinAddr[];
  /** wires responsible for the issue — highlighted on the canvas */
  wireIds?: string[];
};

/** Wires that touch any of the given pins (used to highlight offending connections). */
export function wiresTouching(circuit: Circuit, pins: PinAddr[]): string[] {
  const keys = new Set(pins.map(pinKey));
  return circuit.wires.filter((w) => keys.has(pinKey(w.from)) || keys.has(pinKey(w.to))).map((w) => w.id);
}

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
      issues.push({
        level: "error",
        nodeId: n.id,
        message: `${def.label} is not connected to anything.`,
        hint: "Wire it to the Arduino or delete it.",
        pins: def.pins.map((p) => ({ node: n.id, pin: p.id })),
      });
      continue;
    }
    for (const pin of def.pins) {
      if (!pin.required || wiredPins.has(pin.id)) continue;
      issues.push({
        level: "error",
        nodeId: n.id,
        pins: [{ node: n.id, pin: pin.id }],
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
        issues.push({
          level: "error",
          nodeId: n.id,
          message: `${def.label} has no path to a 5V/3.3V supply.`,
          hint: "Trace VCC back to the Arduino 5V pin.",
          pins: [{ node: n.id, pin: powerPin.id }],
          wireIds: wiresTouching(circuit, [{ node: n.id, pin: powerPin.id }]),
        });
      if (gndPin && wiredPins.has(gndPin.id) && !boardHas({ node: n.id, pin: gndPin.id }, "ground"))
        issues.push({
          level: "error",
          nodeId: n.id,
          message: `${def.label} has no path to GND.`,
          hint: "Trace GND back to an Arduino GND pin.",
          pins: [{ node: n.id, pin: gndPin.id }],
          wireIds: wiresTouching(circuit, [{ node: n.id, pin: gndPin.id }]),
        });
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
          pins: [{ node: n.id, pin: pin.id }],
          wireIds: wiresTouching(circuit, [{ node: n.id, pin: pin.id }]),
        });
      else seen.set(bp, owner);
    }
  }
  return issues;
}

/* ------------------------------ board verification ----------------------------- */

export type VerifyCheck = {
  id: string;
  label: string;
  status: "pass" | "fail" | "warn";
  detail: string;
};

export type VerifyReport = {
  checks: VerifyCheck[];
  passed: number;
  total: number;
  ok: boolean;
  ranAt: string;
};

/** Board pins referenced by the sketch (resolving simple `const int NAME = pin;`). */
export function sketchPins(code: string): string[] {
  const consts = new Map<string, string>();
  for (const m of code.matchAll(/const\s+(?:int|uint8_t|byte)\s+(\w+)\s*=\s*(A?\d+)\s*;/g))
    consts.set(m[1]!, m[2]!);
  const out = new Set<string>();
  const calls = /\b(?:pinMode|digitalWrite|digitalRead|analogWrite|analogRead|attachInterrupt)\s*\(\s*([A-Za-z_]\w*|A?\d+)/g;
  for (const m of code.matchAll(calls)) {
    const raw = m[1]!;
    const value = /^A?\d+$/.test(raw) ? raw : consts.get(raw);
    if (!value) continue;
    out.add(/^A/.test(value) ? value.toUpperCase() : `D${value}`);
  }
  return [...out];
}

/**
 * Full board check: one board, power/ground rail continuity, required pins,
 * no shared signal pins, and sketch pins that actually exist in the wiring.
 */
export function verifyBoard(circuit: Circuit, code: string): VerifyReport {
  const issues = validateCircuit(circuit, code);
  const boards = circuit.nodes.filter((n) => nodeDef(n)?.isBoard);
  const board = boards[0];
  const parts = circuit.nodes.filter((n) => {
    const d = nodeDef(n);
    return !!d && !d.isBoard && d.type !== "breadboard";
  });
  const checks: VerifyCheck[] = [];
  const add = (id: string, label: string, ok: boolean, pass: string, fail: string, warn = false) =>
    checks.push({ id, label, status: ok ? "pass" : warn ? "warn" : "fail", detail: ok ? pass : fail });

  add(
    "board",
    "Exactly one microcontroller board",
    boards.length === 1,
    `${board ? nodeDef(board).label : "Board"} detected.`,
    boards.length === 0 ? "No board on the workspace — add one from the library." : `${boards.length} boards found — delete the extras.`,
  );

  add(
    "parts",
    "Peripherals present",
    parts.length > 0,
    `${parts.length} peripheral${parts.length === 1 ? "" : "s"} wired to the board.`,
    "Add at least one sensor, display or actuator.",
  );

  const powerIssues = issues.filter((i) => /5V\/3\.3V supply|no path to a 5V/.test(i.message));
  add(
    "power",
    "Power rail continuity (VCC → 3V3/5V)",
    powerIssues.length === 0,
    "Every module reaches the board supply rail.",
    powerIssues.map((i) => i.message).join(" "),
  );

  const gndIssues = issues.filter((i) => /no path to GND/.test(i.message));
  add(
    "ground",
    "Ground rail continuity (GND → board GND)",
    gndIssues.length === 0,
    "All grounds are common with the board.",
    gndIssues.map((i) => i.message).join(" "),
  );

  const missingPin = issues.filter((i) => /pin is not connected|is not connected to anything/.test(i.message));
  add(
    "required",
    "All required pins wired",
    missingPin.length === 0,
    "No unconnected required pins.",
    missingPin.map((i) => i.message).join(" "),
  );

  const shared = issues.filter((i) => /is shared by/.test(i.message));
  add(
    "conflicts",
    "No shared or conflicting signal pins",
    shared.length === 0,
    "Each signal has its own board pin.",
    shared.map((i) => i.message).join(" "),
  );

  const wiredBoardPins = new Set<string>();
  if (board)
    for (const w of circuit.wires) {
      if (w.from.node === board.id) wiredBoardPins.add(w.from.pin);
      if (w.to.node === board.id) wiredBoardPins.add(w.to.pin);
    }
  const referenced = sketchPins(code);
  const unwired = referenced.filter((p) => !wiredBoardPins.has(p));
  add(
    "sketch",
    "Sketch pins match the wiring",
    referenced.length > 0 && unwired.length === 0,
    `${referenced.length} pin${referenced.length === 1 ? "" : "s"} used in the sketch are all wired: ${referenced.join(", ")}.`,
    referenced.length === 0
      ? "The sketch does not reference any board pin yet."
      : `Sketch uses ${unwired.join(", ")} but ${unwired.length === 1 ? "it is" : "they are"} not wired on the board.`,
    true,
  );

  const dangling = circuit.wires.filter(
    (w) => !circuit.nodes.some((n) => n.id === w.from.node) || !circuit.nodes.some((n) => n.id === w.to.node),
  );
  add(
    "wires",
    "No dangling wires",
    dangling.length === 0,
    `${circuit.wires.length} wire${circuit.wires.length === 1 ? "" : "s"} all terminate on real pins.`,
    `${dangling.length} wire(s) point at deleted components.`,
  );

  const passed = checks.filter((c) => c.status === "pass").length;
  return {
    checks,
    passed,
    total: checks.length,
    ok: checks.every((c) => c.status !== "fail"),
    ranAt: new Date().toISOString(),
  };
}

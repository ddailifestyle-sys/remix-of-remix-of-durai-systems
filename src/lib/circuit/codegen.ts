/* Generates a real Arduino / ESP32 sketch from the placed circuit + scenario. */
import { nodeDef, type Circuit, type CircuitNode } from "./model";
import { pinDef, type PartPin } from "./parts";
import { resolveBoardPin } from "./validate";
import { CHANNEL_META, type Scenario } from "./engine";
import { boardPinNumbers } from "./pin-numbers";

export type GeneratedSketch = {
  code: string;
  /** human readable notes: what was wired, what was skipped */
  notes: string[];
  boardLabel: string;
};

const slug = (s: string) =>
  s
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 18) || "PART";

/** Numeric/symbolic sketch expression for a board pin id, plus its silkscreen name. */
function pinExpr(boardType: string, pinId: string): { expr: string; label: string } {
  const def = pinDef(boardType, pinId);
  const label = def?.label ?? pinId;
  const gpio = /GPIO(\d+)/i.exec(label);
  if (gpio) return { expr: gpio[1]!, label };
  if (/^A\d$/.test(pinId)) return { expr: pinId, label };
  const m = /^D(\d+)$/.exec(pinId);
  if (m) return { expr: m[1]!, label };
  return { expr: pinId, label };
}

type Bound = {
  node: CircuitNode;
  label: string;
  ident: string;
  signals: { pinId: string; boardPin: string; analog: boolean; i2c: boolean }[];
};

/** Threshold in 0-100 % taken from the scenario's live channel value. */
function scenarioPercent(scenario: Scenario, channel: keyof typeof CHANNEL_META): number {
  const meta = CHANNEL_META[channel];
  const v = scenario.channels[channel] ?? meta.min;
  const pct = ((v - meta.min) / Math.max(1e-6, meta.max - meta.min)) * 100;
  return Math.min(95, Math.max(5, Math.round(pct)));
}

export function generateSketch(circuit: Circuit, scenario: Scenario): GeneratedSketch {
  const notes: string[] = [];
  const board = circuit.nodes.find((n) => nodeDef(n)?.isBoard);
  if (!board) {
    return {
      code: "",
      notes: ["Add a board (Arduino UNO, ESP32, …) before generating a sketch."],
      boardLabel: "",
    };
  }
  const boardDef = nodeDef(board)!;
  const esp = /esp|pico/i.test(board.type);
  const adcMax = boardPinNumbers(board.type).adcMax;

  const bound: Bound[] = [];
  const used = new Set<string>();
  for (const n of circuit.nodes) {
    const def = nodeDef(n);
    if (!def || def.isBoard || def.type === "breadboard") continue;
    const signals: Bound["signals"] = [];
    for (const p of def.pins) {
      if (p.kind === "power" || p.kind === "ground" || p.kind === "passive") continue;
      const bp = resolveBoardPin(circuit, { node: n.id, pin: p.id });
      if (!bp) continue;
      const bdef = pinDef(board.type, bp);
      signals.push({ pinId: p.id, boardPin: bp, analog: bdef?.kind === "analog", i2c: bdef?.kind === "i2c" });
    }
    if (signals.length === 0) {
      notes.push(`${def.label} has no signal wired to the board — skipped.`);
      continue;
    }
    let ident = slug(def.label);
    let i = 2;
    while (used.has(ident)) ident = `${slug(def.label)}_${i++}`;
    used.add(ident);
    bound.push({ node: n, label: def.label, ident, signals });
  }

  const has = (re: RegExp) => bound.some((b) => re.test(b.node.type));
  const includes = ["#include <Arduino.h>"];
  if (has(/^servo$/)) includes.push("#include <Servo.h>");
  if (has(/^dht/)) includes.push("#include <DHT.h>");
  if (has(/^lcd-i2c$/)) includes.push("#include <Wire.h>", "#include <LiquidCrystal_I2C.h>");
  if (has(/^oled$/)) includes.push("#include <Wire.h>", "#include <Adafruit_SSD1306.h>");
  const hasCamera = Boolean(boardDef.hasCamera);
  if (hasCamera) includes.push("#include <esp_camera.h>");

  const consts: string[] = [];
  const objects: string[] = [];
  const setup: string[] = [];
  const loop: string[] = [];
  const readings: { ident: string; varName: string; percent: boolean; channel?: keyof typeof CHANNEL_META }[] = [];

  const constFor = (b: Bound, sig: Bound["signals"][number], suffix = "PIN") => {
    const name = `${b.ident}_${suffix}`;
    const { expr, label } = pinExpr(board.type, sig.boardPin);
    consts.push(`const int ${name} = ${expr};   // ${b.label} ${sig.pinId} → ${label}`);
    return name;
  };

  for (const b of bound) {
    const type = b.node.type;
    const def = nodeDef(b.node)!;
    const first = b.signals[0]!;

    if (/^dht(11|22)$/.test(type)) {
      const pin = constFor(b, first);
      objects.push(`DHT ${b.ident.toLowerCase()}(${pin}, ${type === "dht11" ? "DHT11" : "DHT22"});`);
      setup.push(`  ${b.ident.toLowerCase()}.begin();`);
      loop.push(`  float ${b.ident.toLowerCase()}_t = ${b.ident.toLowerCase()}.readTemperature();`);
      loop.push(`  float ${b.ident.toLowerCase()}_h = ${b.ident.toLowerCase()}.readHumidity();`);
      loop.push(`  Serial.print("${b.label} temp = "); Serial.println(${b.ident.toLowerCase()}_t);`);
      loop.push(`  Serial.print("${b.label} humidity = "); Serial.println(${b.ident.toLowerCase()}_h);`);
      readings.push({ ident: b.ident, varName: `${b.ident.toLowerCase()}_t`, percent: false, channel: "temperature" });
      continue;
    }

    if (type === "ultrasonic") {
      const trig = b.signals.find((s) => s.pinId === "TRIG");
      const echo = b.signals.find((s) => s.pinId === "ECHO");
      if (!trig || !echo) {
        notes.push(`${b.label} needs both TRIG and ECHO wired — skipped.`);
        continue;
      }
      const tp = constFor(b, trig, "TRIG");
      const ep = constFor(b, echo, "ECHO");
      setup.push(`  pinMode(${tp}, OUTPUT);`);
      setup.push(`  pinMode(${ep}, INPUT);`);
      const v = `${b.ident.toLowerCase()}_cm`;
      loop.push(`  digitalWrite(${tp}, LOW); delayMicroseconds(2);`);
      loop.push(`  digitalWrite(${tp}, HIGH); delayMicroseconds(10); digitalWrite(${tp}, LOW);`);
      loop.push(`  long ${v} = pulseIn(${ep}, HIGH) / 58;`);
      loop.push(`  Serial.print("${b.label} distance = "); Serial.println(${v});`);
      readings.push({ ident: b.ident, varName: v, percent: false, channel: "distance" });
      continue;
    }

    if (def.category === "Sensor" || type === "potentiometer" || type === "push-button") {
      const pin = constFor(b, first);
      const v = `${b.ident.toLowerCase()}_val`;
      if (first.analog) {
        loop.push(`  int ${v} = map(analogRead(${pin}), 0, ${adcMax}, 0, 100);   // 0-100 %${adcMax === 4095 ? " (12-bit ADC)" : ""}`);
        readings.push({ ident: b.ident, varName: v, percent: true, ...(def.channel ? { channel: def.channel } : {}) });
      } else {
        const pullup = type === "push-button" && String(b.node.props["mode"] ?? "") === "Pull-up";
        setup.push(`  pinMode(${pin}, ${pullup ? "INPUT_PULLUP" : "INPUT"});`);
        loop.push(`  int ${v} = digitalRead(${pin});`);
        readings.push({ ident: b.ident, varName: v, percent: false, ...(def.channel ? { channel: def.channel } : {}) });
      }
      loop.push(`  Serial.print("${b.label} = "); Serial.println(${v});`);
      continue;
    }

    if (type === "servo") {
      const pin = constFor(b, first);
      const obj = b.ident.toLowerCase();
      objects.push(`Servo ${obj};`);
      setup.push(`  ${obj}.attach(${pin});`);
      setup.push(`  ${obj}.write(0);`);
      continue;
    }

    if (type === "lcd-i2c") {
      const addr = String(b.node.props["address"] ?? "0x27");
      objects.push(`LiquidCrystal_I2C lcd(${addr}, 16, 2);`);
      setup.push(`  lcd.init();`);
      setup.push(`  lcd.backlight();`);
      setup.push(`  lcd.print("IoT SimLab ready");`);
      continue;
    }

    if (type === "oled") {
      objects.push(`Adafruit_SSD1306 display(128, 64);`);
      setup.push(`  display.begin();`);
      setup.push(`  display.print("IoT SimLab ready");`);
      setup.push(`  display.display();`);
      continue;
    }

    if (type === "rgb-led") {
      for (const s of b.signals.filter((x) => ["R", "G", "B"].includes(x.pinId))) {
        const pin = constFor(b, s, `${s.pinId}_PIN`);
        setup.push(`  pinMode(${pin}, OUTPUT);`);
      }
      continue;
    }

    // led, buzzer, relay and other single-signal outputs
    const pin = constFor(b, first);
    setup.push(`  pinMode(${pin}, OUTPUT);`);
    const activeLow = String(b.node.props["active"] ?? "") === "Active LOW";
    setup.push(`  digitalWrite(${pin}, ${activeLow ? "HIGH" : "LOW"});   // idle`);
  }

  const actuators = bound.filter(
    (b) => nodeDef(b.node)?.category === "Output" || nodeDef(b.node)?.category === "Actuator",
  );
  const driveable = actuators.filter((b) => !["lcd-i2c", "oled", "servo", "rgb-led"].includes(b.node.type));
  const primary = readings[0];

  const dht = bound.find((b) => b.node.type === "dht22" || b.node.type === "dht11");
  const soil = bound.find((b) => b.node.type === "soil-moisture");
  const ldr = bound.find((b) => b.node.type === "ldr");
  const oled = bound.find((b) => b.node.type === "oled");
  if (oled && (dht || soil || ldr)) {
    loop.push("  display.clearDisplay();");
    loop.push("  display.setCursor(0, 0);");
    if (dht) loop.push(`  display.print("T: "); display.println(${dht.ident.toLowerCase()}_t);`);
    if (soil) loop.push(`  display.print("Soil: "); display.println(${soil.ident.toLowerCase()}_val);`);
    if (ldr) loop.push(`  display.print("Light: "); display.println(${ldr.ident.toLowerCase()}_val);`);
    loop.push("  display.display();");
  }

  if (primary) {
    const ch = primary.channel ?? "waterLevel";
    const threshold = primary.percent
      ? scenarioPercent(scenario, ch)
      : Math.round(scenario.channels[ch] ?? 50);
    loop.push("");
    loop.push(`  // Alarm rule from the scenario panel: ${CHANNEL_META[ch].label} above ${threshold} ${primary.percent ? "%" : CHANNEL_META[ch].unit}`);
    loop.push(`  bool alert = ${primary.varName} > ${threshold};`);
    loop.push(`  if (alert) {`);
    loop.push(`    Serial.println("ALERT: ${CHANNEL_META[ch].label} above ${threshold}");`);
    for (const b of driveable) {
      const activeLow = String(b.node.props["active"] ?? "") === "Active LOW";
      loop.push(`    digitalWrite(${b.ident}_PIN, ${activeLow ? "LOW" : "HIGH"});   // ${b.label} ON`);
    }
    for (const b of actuators.filter((x) => x.node.type === "servo"))
      loop.push(`    ${b.ident.toLowerCase()}.write(90);`);
    loop.push(`  } else {`);
    loop.push(`    Serial.println("OK: ${CHANNEL_META[ch].label} normal");`);
    for (const b of driveable) {
      const activeLow = String(b.node.props["active"] ?? "") === "Active LOW";
      loop.push(`    digitalWrite(${b.ident}_PIN, ${activeLow ? "HIGH" : "LOW"});   // ${b.label} OFF`);
    }
    for (const b of actuators.filter((x) => x.node.type === "servo"))
      loop.push(`    ${b.ident.toLowerCase()}.write(0);`);
    loop.push(`  }`);
  } else {
    notes.push("No sensor reading found, so the sketch only initialises the board and outputs.");
  }

  if (hasCamera) {
    setup.push("  esp_camera_init();");
    loop.push("  int frameBytes = esp_camera_capture();");
    loop.push('  Serial.print("Camera frame bytes = "); Serial.println(frameBytes);');
  }

  const period = Math.max(100, Math.round(1000 / Math.max(0.5, scenario.speed || 1)));
  loop.push("");
  loop.push(`  delay(${period});   // scenario speed: ${scenario.speed || 1} loops/second`);

  const code = [
    `/*`,
    ` * Auto-generated by IoT SimLab from the circuit + scenario.`,
    ` * Board: ${boardDef.label}`,
    ` * Pin numbers below match the real ${boardDef.label} pin map.`,
    ` */`,
    ...includes.filter((v, i, a) => a.indexOf(v) === i),
    "",
    ...consts,
    "",
    ...objects,
    objects.length ? "" : null,
    "void setup() {",
    `  Serial.begin(${esp ? 115200 : 9600});`,
    ...setup,
    `  Serial.println("${boardDef.label} ready");`,
    "}",
    "",
    "void loop() {",
    ...loop,
    "}",
    "",
  ]
    .filter((l): l is string => l !== null)
    .join("\n");

  notes.unshift(`${bound.length} component${bound.length === 1 ? "" : "s"} wired into the sketch.`);
  return { code, notes, boardLabel: boardDef.label };
}

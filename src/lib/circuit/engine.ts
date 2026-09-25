import { compileSketch, RuntimeError, Sketch, type Hardware, type SourceError, type Value } from "@/lib/arduino/interpreter";
import { nodeDef, type Circuit, type CircuitNode } from "./model";
import type { SensorChannel } from "./parts";
import { resolveBoardPin, validateCircuit, type Issue } from "./validate";
import { boardPinNumbers, type BoardPinNumbers } from "./pin-numbers";

/* ------------------------------- scenario -------------------------------- */

export type ChannelValues = Record<SensorChannel, number>;

/** Per-sensor calibration: clamps the value range, adds noise, smooths and rate-limits it. */
export type Calibration = {
  /** clamp floor for the simulated value */
  min: number;
  /** clamp ceiling for the simulated value */
  max: number;
  /** ± random noise applied on every sample */
  noise: number;
  /** 0 = raw, 0.9 = heavily smoothed (exponential moving average) */
  smoothing: number;
  /** samples per second; 0 means resample on every read */
  rate: number;
};

export type Scenario = {
  /** live environment values the organizer can change while running */
  channels: ChannelValues;
  /** per-node manual inputs: buttons (0/1) and potentiometer knobs (0-100) */
  nodes: Record<string, number>;
  /** loop iterations per second */
  speed: number;
  noise: number;
  /** per-channel calibration overrides */
  calibration: Partial<Record<SensorChannel, Calibration>>;
};


export const CHANNEL_META: Record<SensorChannel, { label: string; unit: string; min: number; max: number; step: number }> = {
  waterLevel: { label: "Water level", unit: "%", min: 0, max: 100, step: 1 },
  temperature: { label: "Temperature", unit: "°C", min: -10, max: 80, step: 0.5 },
  humidity: { label: "Humidity", unit: "%", min: 0, max: 100, step: 1 },
  soilMoisture: { label: "Soil moisture", unit: "%", min: 0, max: 100, step: 1 },
  light: { label: "Light", unit: "%", min: 0, max: 100, step: 1 },
  gas: { label: "Gas", unit: "ppm", min: 0, max: 1000, step: 5 },
  flame: { label: "Flame intensity", unit: "%", min: 0, max: 100, step: 1 },
  smoke: { label: "Smoke", unit: "%", min: 0, max: 100, step: 1 },
  weight: { label: "Weight", unit: "g", min: 0, max: 10000, step: 10 },
  wind: { label: "Wind speed", unit: "m/s", min: 0, max: 40, step: 0.5 },
  motion: { label: "Motion (PIR)", unit: "%", min: 0, max: 100, step: 1 },
  rain: { label: "Rainfall", unit: "%", min: 0, max: 100, step: 1 },
  sound: { label: "Sound level", unit: "dB", min: 0, max: 120, step: 1 },
  pressure: { label: "Air pressure", unit: "hPa", min: 300, max: 1200, step: 1 },
  co2: { label: "CO₂", unit: "ppm", min: 300, max: 5000, step: 10 },
  ph: { label: "Water pH", unit: "pH", min: 0, max: 14, step: 0.1 },
  tds: { label: "TDS", unit: "ppm", min: 0, max: 1000, step: 5 },
  current: { label: "Current", unit: "A", min: 0, max: 30, step: 0.1 },
  vibration: { label: "Vibration", unit: "%", min: 0, max: 100, step: 1 },
  uv: { label: "UV index", unit: "UVI", min: 0, max: 12, step: 0.1 },
  distance: { label: "Obstacle distance", unit: "cm", min: 0, max: 400, step: 1 },
};

/** Factory calibration for a channel — full range, no noise, no smoothing, resample every read. */
export const defaultCalibration = (ch: SensorChannel): Calibration => ({
  min: CHANNEL_META[ch].min,
  max: CHANNEL_META[ch].max,
  noise: 0,
  smoothing: 0,
  rate: 0,
});

export const calibrationOf = (s: Scenario, ch: SensorChannel): Calibration => ({
  ...defaultCalibration(ch),
  ...(s.calibration?.[ch] ?? {}),
  ...(s.calibration?.[ch]?.noise === undefined ? { noise: s.noise } : {}),
});

export const defaultScenario = (): Scenario => ({

  channels: {
    waterLevel: 45,
    temperature: 28,
    humidity: 62,
    soilMoisture: 34,
    light: 55,
    gas: 120,
    flame: 0,
    smoke: 5,
    weight: 1200,
    wind: 6,
    motion: 0,
    rain: 10,
    sound: 42,
    pressure: 1013,
    co2: 600,
    ph: 7,
    tds: 180,
    current: 1.2,
    vibration: 5,
    uv: 3,
    distance: 120,
  },
  nodes: {},
  speed: 2,
  noise: 0,
  calibration: {},
});


/* -------------------------------- outputs -------------------------------- */

export type ComponentOutput = {
  nodeId: string;
  label: string;
  active: boolean;
  /** 0..1 intensity for LEDs, motors, etc. */
  level: number;
  detail: string;
};

export type LogLine = { t: number; kind: "serial" | "info" | "warn" | "error" | "io"; text: string };

/** Camera peripheral state reported back to the camera panel. */
export type CameraState = {
  ready: boolean;
  captures: number;
  frameBytes: number;
  resolution: string;
  facing: string;
};

export type StepResult = {
  logs: LogLine[];
  outputs: ComponentOutput[];
  pins: Record<string, number>;
  sensors: { nodeId: string; label: string; reading: string }[];
  millis: number;
  camera?: CameraState;
  error?: SourceError;
};

/** Rough JPEG payload size for a frame, used for realistic serial output. */
export const frameBytesFor = (resolution: string): number => {
  const m = /(\d+)\s*x\s*(\d+)/.exec(resolution);
  const w = Number(m?.[1] ?? 640);
  const h = Number(m?.[2] ?? 480);
  return Math.round(w * h * 0.12);
};

export type StartResult =
  | { ok: true; logs: LogLine[] }
  | { ok: false; issues: Issue[]; errors: SourceError[]; logs: LogLine[] };

/* ------------------------------- pin naming ------------------------------- */

export function pinNumber(name: string): number {
  if (/^D\d+$/.test(name)) return Number(name.slice(1));
  if (/^A\d$/.test(name)) return 14 + Number(name.slice(1));
  if (name === "SDA") return 18;
  if (name === "SCL") return 19;
  return -1;
}
export function pinName(num: number): string {
  return num >= 14 && num <= 19 ? `A${num - 14}` : `D${num}`;
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const adc = (fraction: number) => Math.round(clamp(fraction, 0, 1) * 1023);

type Binding = { node: CircuitNode; pin: string; boardPin: number };

/* -------------------------------- engine ---------------------------------- */

export class SimulationEngine {
  private sketch?: Sketch;
  private bindings: Binding[] = [];
  private clock = 0;
  private loops = 0;
  private logs: LogLine[] = [];
  private serialBuf = "";
  private pinModes = new Map<number, number>();
  private pinValues = new Map<number, number>();
  private servos = new Map<string, { pin: number; angle: number }>();
  private toneOn = new Map<number, number>();
  private lcd: string[] = [];
  private lcdOpen = false;
  private scenario: Scenario;
  private calState = new Map<SensorChannel, { v: number; t: number }>();
  private cameraReady = false;
  private captures = 0;
  private frameBytes = 0;
  private pinMap: BoardPinNumbers = boardPinNumbers(undefined);


  constructor(private circuit: Circuit, private code: string, scenario: Scenario) {
    this.scenario = scenario;
  }

  /** replace scenario mid-run — next loop uses the new values immediately */
  setScenario(s: Scenario) {
    this.scenario = s;
  }

  get millis() {
    return Math.round(this.clock);
  }

  start(): StartResult {
    this.logs = [];
    const issues = validateCircuit(this.circuit, this.code);
    const errors = issues.filter((i) => i.level === "error");
    const compiled = compileSketch(this.code);
    if (errors.length || compiled.errors.length || !compiled.program) {
      for (const i of errors) this.log("error", `${i.message}${i.hint ? ` — ${i.hint}` : ""}`);
      for (const e of compiled.errors) this.log("error", `sketch.ino:${e.line}: ${e.message}`);
      return { ok: false, issues: errors, errors: compiled.errors, logs: this.logs };
    }
    for (const i of issues) this.log("warn", i.message);

    const boardNode = this.circuit.nodes.find((n) => nodeDef(n)?.isBoard);
    this.pinMap = boardPinNumbers(boardNode?.type);
    this.bindings = [];
    for (const n of this.circuit.nodes) {
      const def = nodeDef(n);
      if (!def || def.isBoard || def.type === "breadboard") continue;
      for (const p of def.pins) {
        const bp = resolveBoardPin(this.circuit, { node: n.id, pin: p.id });
        const num = bp ? (this.pinMap.byId.get(bp) ?? pinNumber(bp)) : -1;
        if (num >= 0) this.bindings.push({ node: n, pin: p.id, boardPin: num });
      }
    }

    this.clock = 0;
    this.loops = 0;
    this.pinModes.clear();
    this.pinValues.clear();
    this.servos.clear();
    this.toneOn.clear();
    this.lcd = [];
    this.lcdOpen = false;
    this.calState.clear();
    this.cameraReady = false;
    this.captures = 0;
    this.frameBytes = 0;


    this.sketch = new Sketch(compiled.program, this.hardware(), this.pinMap.consts);
    this.log("info", `Compiled sketch.ino — ${this.bindings.length} pin connection(s) resolved`);
    try {
      this.sketch.init();
      this.sketch.runSetup();
    } catch (e) {
      const err = this.toError(e);
      this.log("error", `setup() failed at line ${err.line}: ${err.message}`);
      return { ok: false, issues: [], errors: [err], logs: this.logs };
    }
    this.log("info", "setup() completed — entering loop()");
    return { ok: true, logs: this.drain() };
  }

  step(): StepResult {
    if (!this.sketch)
      return { logs: [{ t: 0, kind: "error", text: "Engine not started." }], outputs: [], pins: {}, sensors: [], millis: 0 };
    this.loops++;
    let error: SourceError | undefined;
    try {
      this.sketch.runLoop();
    } catch (e) {
      error = this.toError(e);
      this.log("error", `loop() failed at line ${error.line}: ${error.message}`);
    }
    this.clock += 20;
    this.flushSerial();
    return {
      logs: this.drain(),
      outputs: this.outputs(),
      pins: Object.fromEntries([...this.pinValues].map(([k, v]) => [this.pinLabel(k), v])),
      sensors: this.sensorReadings(),
      millis: this.millis,
      ...(this.cameraState() ? { camera: this.cameraState()! } : {}),
      ...(error ? { error } : {}),
    };
  }

  /* ------------------------------ sensor model ---------------------------- */

  /**
   * Per-channel sample: clamped to the calibration range, jittered by the
   * channel noise, smoothed with an EMA and held for 1/rate seconds.
   */
  private channelValue(ch: SensorChannel) {
    const cal = calibrationOf(this.scenario, ch);
    const min = Math.min(cal.min, cal.max);
    const max = Math.max(cal.min, cal.max);
    const target = clamp(this.scenario.channels[ch] ?? 0, min, max);
    const prev = this.calState.get(ch);
    const interval = cal.rate > 0 ? 1000 / cal.rate : 0;
    if (prev && interval > 0 && this.clock - prev.t < interval) return prev.v;
    const sampled = cal.noise > 0 ? target + (Math.random() * 2 - 1) * cal.noise : target;
    const a = clamp(cal.smoothing, 0, 0.95);
    const v = clamp(prev ? prev.v * a + sampled * (1 - a) : sampled, min, max);
    this.calState.set(ch, { v, t: this.clock });
    return v;
  }


  /** analog counts (0-1023) produced by a sensor node */
  private analogOf(node: CircuitNode): number {
    const def = nodeDef(node);
    if (!def) return 0;
    if (def.type === "potentiometer") {
      const knob = this.scenario.nodes[node.id] ?? Number(node.props["value"] ?? 50);
      return adc(knob / 100);
    }
    if (def.type === "push-button") return this.buttonDown(node) ? 1023 : 0;
    const ch = def.channel;
    if (!ch) return 0;
    const v = this.channelValue(ch);
    switch (ch) {
      case "temperature":
        return adc(v / 80);
      case "gas":
        return adc(v / 1000);
      case "weight":
        return adc(v / Number(node.props["capacity"] ?? 10000));
      case "wind":
        return adc(v / 40);
      case "co2":
        return adc(v / 5000);
      case "pressure":
        return adc((v - 300) / 900);
      case "ph":
        return adc(v / 14);
      case "tds":
        return adc(v / 1000);
      case "current":
        return adc(v / 30);
      case "sound":
        return adc(v / 120);
      case "uv":
        return adc(v / 12);
      case "distance":
        return adc(v / 400);
      default:
        return adc(v / 100);
    }
  }

  private buttonDown(node: CircuitNode) {
    const pressed = (this.scenario.nodes[node.id] ?? 0) > 0;
    return node.props["mode"] === "Pull-up" ? !pressed : pressed;
  }

  private sourceOn(boardPin: number): Binding | undefined {
    return this.bindings.find((b) => {
      const def = nodeDef(b.node);
      if (!def) return false;
      const isInput = def.category === "Sensor" || def.category === "Input";
      return isInput && b.boardPin === boardPin && !["VCC", "GND"].includes(b.pin);
    });
  }

  private sinkOn(boardPin: number): Binding | undefined {
    return this.bindings.find((b) => {
      const def = nodeDef(b.node);
      if (!def) return false;
      const isOut = def.category === "Output" || def.category === "Actuator";
      return isOut && b.boardPin === boardPin && !["VCC", "GND", "COM", "NO", "NC"].includes(b.pin);
    });
  }

  /** silkscreen name of a sketch pin number on the placed board */
  private pinLabel(num: number): string {
    return this.pinMap.labels.get(num) ?? pinName(num);
  }

  /* -------------------------------- hardware ------------------------------- */

  private hardware(): Hardware {
    const self = this;
    return {
      pinMode(pin, mode) {
        self.pinModes.set(pin, mode);
      },
      digitalWrite(pin, value) {
        const prev = self.pinValues.get(pin);
        self.pinValues.set(pin, value ? 1 : 0);
        const sink = self.sinkOn(pin);
        if (prev !== (value ? 1 : 0))
          self.log("io", `digitalWrite(${self.pinLabel(pin)}, ${value ? "HIGH" : "LOW"})${sink ? ` → ${nodeDef(sink.node)?.label}` : ""}`);
      },
      digitalRead(pin) {
        const src = self.sourceOn(pin);
        if (!src) return self.pinModes.get(pin) === 2 ? 1 : 0;
        const def = nodeDef(src.node)!;
        if (def.type === "push-button") return self.buttonDown(src.node) ? 1 : 0;
        const raw = self.analogOf(src.node);
        // DOUT style comparator output; flame/gas boards are active LOW
        const high = raw >= 512;
        return def.type === "flame" || def.type === "gas" ? (high ? 0 : 1) : high ? 1 : 0;
      },
      analogRead(pin) {
        const src = self.sourceOn(pin);
        if (!src) return 0;
        // analogOf() models a 10-bit reading; scale to the board's ADC width
        return Math.round((self.analogOf(src.node) * self.pinMap.adcMax) / 1023);
      },
      analogWrite(pin, value) {
        self.pinValues.set(pin, clamp(value, 0, 255));
        const sink = self.sinkOn(pin);
        self.log("io", `analogWrite(${self.pinLabel(pin)}, ${Math.round(value)})${sink ? ` → ${nodeDef(sink.node)?.label}` : ""}`);
      },
      delay(ms) {
        self.clock += ms;
      },
      micros() {
        return Math.round(self.clock * 1000);
      },
      millis() {
        return Math.round(self.clock);
      },
      serialBegin(baud) {
        self.log("info", `Serial started at ${baud} baud`);
      },
      serialPrint(text, newline) {
        self.serialBuf += text;
        if (newline) self.flushSerial();
      },
      pulseIn(pin) {
        const echo = self.bindings.find((b) => b.boardPin === pin && b.pin === "ECHO");
        if (!echo) return 0;
        const tank = Number(echo.node.props["tankHeight"] ?? 100);
        const level = clamp(self.channelValue("waterLevel"), 0, 100);
        const distanceCm = tank * (1 - level / 100);
        return Math.round(distanceCm * 58);
      },
      display(cls, method, args) {
        const text = args.map((a) => String(a)).join(", ");
        if (/print/i.test(method) && text) {
          // print() continues the current line, println() ends it
          const open = self.lcdOpen && self.lcd.length > 0;
          if (open) self.lcd[self.lcd.length - 1] += text;
          else self.lcd.push(text);
          self.lcdOpen = !/println/i.test(method);
          if (self.lcd.length > 4) self.lcd.shift();
          self.log("io", `${cls}.${method}("${text}")`);
        } else if (/clear/i.test(method)) {
          self.lcd = [];
          self.lcdOpen = false;
        }
      },
      servo(name, method, args) {
        const cur = self.servos.get(name) ?? { pin: -1, angle: 0 };
        if (method === "attach") self.servos.set(name, { ...cur, pin: Number(args[0] ?? -1) });
        else if (method === "write") {
          const angle = clamp(Number(args[0] ?? 0), 0, 360);
          self.servos.set(name, { ...cur, angle });
          self.log("io", `${name}.write(${Math.round(angle)}°)`);
        }
      },
      sensorRead(cls, method): number {
        const wanted = /Humidity/i.test(method) ? "humidity" : "temperature";
        if (/HX711/i.test(cls)) return self.channelValue("weight");
        const v = self.channelValue(wanted === "humidity" ? "humidity" : "temperature");
        return Math.round(v * 10) / 10;
      },
      tone(pin, freq) {
        self.toneOn.set(pin, freq);
        self.log("io", `tone(${self.pinLabel(pin)}, ${Math.round(freq)} Hz)`);
      },
      noTone(pin) {
        self.toneOn.delete(pin);
      },
      camera(op) {
        const node = self.circuit.nodes.find((n) => nodeDef(n)?.hasCamera);
        if (!node) {
          self.log("warn", `${op}() called but no camera board is placed`);
          return 0;
        }
        const resolution = String(node.props["resolution"] ?? "VGA 640x480");
        if (op === "esp_camera_init") {
          self.cameraReady = true;
          self.log("info", `camera initialised — ${resolution}`);
          return 0;
        }
        if (op === "esp_camera_fb_return") return 0;
        if (!self.cameraReady) {
          self.log("warn", "camera capture requested before esp_camera_init()");
          return 0;
        }
        self.captures++;
        self.frameBytes = frameBytesFor(resolution);
        self.log("io", `frame #${self.captures} captured — ${resolution}, ${self.frameBytes} bytes`);
        return self.frameBytes;
      },
    };
  }

  /** camera peripheral snapshot, or undefined when no camera board is placed */
  private cameraState(): CameraState | undefined {
    const node = this.circuit.nodes.find((n) => nodeDef(n)?.hasCamera);
    if (!node) return undefined;
    return {
      ready: this.cameraReady,
      captures: this.captures,
      frameBytes: this.frameBytes,
      resolution: String(node.props["resolution"] ?? "VGA 640x480"),
      facing: String(node.props["facing"] ?? "Front"),
    };
  }

  /* -------------------------------- results -------------------------------- */

  private outputs(): ComponentOutput[] {
    const out: ComponentOutput[] = [];
    for (const n of this.circuit.nodes) {
      const def = nodeDef(n);
      if (!def || (def.category !== "Output" && def.category !== "Actuator")) continue;
      const pinsOf = this.bindings.filter((b) => b.node.id === n.id);
      const valueOf = (pin: string) => {
        const b = pinsOf.find((x) => x.pin === pin);
        return b ? (this.pinValues.get(b.boardPin) ?? 0) : 0;
      };
      if (def.type === "led") {
        const v = valueOf("A");
        out.push({ nodeId: n.id, label: `${String(n.props["color"] ?? "Red")} LED`, active: v > 0, level: v > 1 ? v / 255 : v, detail: v > 1 ? `PWM ${v}/255` : v ? "ON" : "OFF" });
      } else if (def.type === "rgb-led") {
        const r = valueOf("R"), g = valueOf("G"), b = valueOf("B");
        const norm = (x: number) => (x > 1 ? x : x * 255);
        out.push({ nodeId: n.id, label: "RGB LED", active: r + g + b > 0, level: (norm(r) + norm(g) + norm(b)) / 765, detail: `R${Math.round(norm(r))} G${Math.round(norm(g))} B${Math.round(norm(b))}` });
      } else if (def.type === "buzzer") {
        const b = pinsOf.find((x) => x.pin === "SIG");
        const freq = b ? this.toneOn.get(b.boardPin) : undefined;
        const on = !!freq || valueOf("SIG") > 0;
        out.push({ nodeId: n.id, label: "Buzzer", active: on, level: on ? 1 : 0, detail: freq ? `${Math.round(freq)} Hz` : on ? "Beeping" : "Silent" });
      } else if (def.type === "relay") {
        const raw = valueOf("IN") > 0;
        const on = n.props["active"] === "Active LOW" ? !raw : raw;
        out.push({ nodeId: n.id, label: "Relay", active: on, level: on ? 1 : 0, detail: on ? "CLOSED (load powered)" : "OPEN" });
      } else if (def.type === "dc-motor") {
        const relay = this.circuit.nodes.find((x) => nodeDef(x)?.type === "relay");
        const relayOut = relay ? out.find((o) => o.nodeId === relay.id) : undefined;
        const direct = valueOf("V+");
        const on = relayOut ? relayOut.active : direct > 0;
        out.push({ nodeId: n.id, label: String(n.props["role"] ?? "DC Motor"), active: on, level: on ? 1 : 0, detail: on ? "RUNNING" : "STOPPED" });
      } else if (def.type === "servo") {
        const b = pinsOf.find((x) => x.pin === "SIG");
        const entry = [...this.servos.values()].find((s) => (b ? s.pin === b.boardPin : true));
        const angle = entry?.angle ?? 0;
        out.push({ nodeId: n.id, label: "Servo", active: angle > 0, level: angle / Number(n.props["range"] ?? 180), detail: `${Math.round(angle)}°` });
      } else if (def.type === "lcd-i2c" || def.type === "oled") {
        const text = this.lcd.join(" | ") || "(blank)";
        out.push({ nodeId: n.id, label: def.label, active: this.lcd.length > 0, level: 1, detail: text });
      }
    }
    return out;
  }

  private sensorReadings() {
    const seen = new Set<string>();
    const list: { nodeId: string; label: string; reading: string }[] = [];
    for (const b of this.bindings) {
      const def = nodeDef(b.node);
      if (!def || (def.category !== "Sensor" && def.category !== "Input") || seen.has(b.node.id)) continue;
      seen.add(b.node.id);
      const ch = def.channel;
      let reading: string;
      if (def.type === "push-button") reading = this.buttonDown(b.node) ? "PRESSED" : "RELEASED";
      else if (def.type === "potentiometer") reading = `${Math.round(this.scenario.nodes[b.node.id] ?? Number(b.node.props["value"] ?? 50))} %`;
      else if (ch) {
        const meta = CHANNEL_META[ch];
        reading = `${Math.round(this.channelValue(ch) * 10) / 10} ${meta.unit} (${this.analogOf(b.node)} counts)`;
      } else reading = `${this.analogOf(b.node)} counts`;
      list.push({ nodeId: b.node.id, label: def.label, reading });
    }
    return list;
  }

  /* --------------------------------- logs ---------------------------------- */

  private flushSerial() {
    if (!this.serialBuf) return;
    for (const line of this.serialBuf.split("\n")) if (line.length) this.log("serial", line);
    this.serialBuf = "";
  }

  private log(kind: LogLine["kind"], text: string) {
    this.logs.push({ t: this.millis, kind, text });
  }

  private drain() {
    const l = this.logs;
    this.logs = [];
    return l;
  }

  private toError(e: unknown): SourceError {
    if (e instanceof RuntimeError) return { line: e.line, message: e.message };
    return { line: 1, message: (e as Error)?.message ?? "unknown runtime error" };
  }
}

export type { Value };
import {
  RuntimeError,
  Sketch,
  compileSketch,
  type Hardware,
  type SourceError,
  type Value,
} from "@/lib/arduino/interpreter";
import type { Problem } from "@/lib/store";

/* ------------------------------- environment ------------------------------ */

export type TestEnv = {
  /** primary analog reading, 0-100 % */
  percent: number;
  temp: number;
  humidity: number;
  /** value returned by digitalRead() on sensor pins */
  digital: number;
};

export const defaultEnv = (): TestEnv => ({ percent: 50, temp: 28, humidity: 60, digital: 0 });

export type RunLog = {
  t: number;
  kind: "serial" | "info" | "success" | "warning" | "error";
  text: string;
};

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/* --------------------------------- runner --------------------------------- */

/** Compiles an Arduino sketch and executes it against a virtual environment. */
export class SketchRunner {
  private sketch?: Sketch;
  private clock = 0;
  private buf = "";
  private logs: RunLog[] = [];
  private pins = new Map<number, number>();
  private modes = new Map<number, number>();
  private tones = new Map<number, number>();
  private lcd: string[] = [];
  private servos = new Map<string, number>();

  constructor(
    private code: string,
    private env: TestEnv,
  ) {}

  setEnv(env: TestEnv) {
    this.env = env;
  }

  get millis() {
    return Math.round(this.clock);
  }

  get pinStates(): Record<string, number> {
    return Object.fromEntries(
      [...this.pins].map(([k, v]) => [k >= 14 ? `A${k - 14}` : `D${k}`, v]),
    );
  }

  get lcdText() {
    return this.lcd.join(" | ");
  }

  /** true when any output pin is driven HIGH (or PWM > 0) */
  get anyOutputHigh() {
    for (const [, v] of this.pins) if (v > 0) return true;
    return this.tones.size > 0;
  }

  get serialText() {
    return this.logs
      .filter((l) => l.kind === "serial")
      .map((l) => l.text)
      .join("\n");
  }

  compile(): SourceError[] {
    const compiled = compileSketch(this.code);
    if (!compiled.program) return compiled.errors;
    this.sketch = new Sketch(compiled.program, this.hardware());
    return [];
  }

  setup(): { ok: boolean; error?: SourceError } {
    if (!this.sketch) return { ok: false, error: { line: 1, message: "sketch not compiled" } };
    try {
      this.sketch.init();
      this.sketch.runSetup();
      this.flush();
      return { ok: true };
    } catch (e) {
      const error = this.toError(e);
      this.log("error", `setup() failed at line ${error.line}: ${error.message}`);
      return { ok: false, error };
    }
  }

  loop(): { ok: boolean; error?: SourceError } {
    if (!this.sketch) return { ok: false, error: { line: 1, message: "sketch not compiled" } };
    try {
      this.sketch.runLoop();
      this.clock += 20;
      this.flush();
      return { ok: true };
    } catch (e) {
      const error = this.toError(e);
      this.log("error", `loop() failed at line ${error.line}: ${error.message}`);
      return { ok: false, error };
    }
  }

  /** returns and clears buffered log lines */
  drain(): RunLog[] {
    const l = this.logs;
    this.logs = [];
    return l;
  }

  /** all lines produced so far, without clearing */
  peek(): RunLog[] {
    return [...this.logs];
  }

  log(kind: RunLog["kind"], text: string) {
    this.logs.push({ t: this.millis, kind, text });
  }

  private flush() {
    if (!this.buf) return;
    for (const line of this.buf.split("\n")) if (line.length) this.log("serial", line);
    this.buf = "";
  }

  private toError(e: unknown): SourceError {
    if (e instanceof RuntimeError) return { line: e.line, message: e.message };
    return { line: 1, message: (e as Error)?.message ?? "unknown runtime error" };
  }

  private hardware(): Hardware {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    return {
      pinMode(pin, mode) {
        self.modes.set(pin, mode);
      },
      digitalWrite(pin, value) {
        self.pins.set(pin, value ? 1 : 0);
      },
      digitalRead() {
        return self.env.digital ? 1 : 0;
      },
      analogRead() {
        return Math.round(clamp(self.env.percent, 0, 100) * 10.23);
      },
      analogWrite(pin, value) {
        self.pins.set(pin, clamp(value, 0, 255));
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
        self.buf += text;
        if (newline) self.buf += "\n";
        if (newline) self.flush();
      },
      pulseIn() {
        const distance = 100 * (1 - clamp(self.env.percent, 0, 100) / 100);
        return Math.round(distance * 58);
      },
      display(cls, method, args: Value[]) {
        const text = args.map((a) => String(a)).join(", ");
        if (/print/i.test(method) && text) {
          self.lcd.push(text);
          if (self.lcd.length > 4) self.lcd.shift();
          self.log("info", `${cls}.${method}("${text}")`);
        } else if (/clear/i.test(method)) self.lcd = [];
      },
      servo(name, method, args: Value[]) {
        if (method === "write") self.servos.set(name, Number(args[0] ?? 0));
      },
      sensorRead(cls, method) {
        if (/Humidity/i.test(method)) return self.env.humidity;
        if (/HX711/i.test(cls)) return Math.round(self.env.percent * 100);
        return self.env.temp;
      },
      tone(pin, freq) {
        self.tones.set(pin, freq);
      },
      noTone(pin) {
        self.tones.delete(pin);
      },
    };
  }
}

/* ------------------------------- test cases ------------------------------- */

export type TestCase = {
  id: string;
  name: string;
  hidden: boolean;
  points: number;
  env: TestEnv;
  /** keyword the sketch must print on the serial monitor */
  expectKeyword: string;
  /** expected actuator state, or null when the band does not drive an output */
  expectOutput: "HIGH" | "LOW" | null;
  inputLabel: string;
  expectedLabel: string;
};

function parseRange(range: string): [number, number] | null {
  const nums = range.match(/-?\d+(?:\.\d+)?/g);
  if (!nums || nums.length < 2) return null;
  const a = Number(nums[0]);
  const b = Number(nums[1]);
  return Number.isFinite(a) && Number.isFinite(b) && b > a ? [a, b] : null;
}

function keywordOf(result: string) {
  const head = result.split("(")[0]!.trim();
  const word = head.split(/[\s,/]+/)[0] ?? head;
  return word.toUpperCase();
}

function outputOf(result: string): "HIGH" | "LOW" | null {
  if (/\bON\b/i.test(result)) return "HIGH";
  if (/\bOFF\b/i.test(result)) return "LOW";
  return null;
}

/** Builds a deterministic public + hidden suite from the problem's logic table. */
export function buildSuite(problem: Problem): TestCase[] {
  const bands = problem.logic.length ? problem.logic : [{ range: "0 – 100", result: "OK" }];
  const total = problem.publicTests + problem.hiddenTests;
  const cases: TestCase[] = [];
  for (let i = 0; i < total; i++) {
    const band = bands[i % bands.length]!;
    const idx = bands.indexOf(band);
    const span = parseRange(band.range) ?? [
      (idx * 100) / bands.length,
      ((idx + 1) * 100) / bands.length,
    ];
    const lo = clamp(span[0], 0, 100);
    const hi = clamp(span[1], 0, 100);
    const t = ((Math.floor(i / bands.length) * 37) % 100) / 100;
    const percent = Math.round(lo + (hi - lo) * (0.15 + 0.7 * t));
    const hidden = i >= problem.publicTests;
    cases.push({
      id: `tc-${i + 1}`,
      name: hidden ? `Hidden test ${i + 1 - problem.publicTests}` : `Public test ${i + 1}`,
      hidden,
      points: 1,
      env: {
        percent,
        temp: 20 + ((i * 7) % 45),
        humidity: 35 + ((i * 11) % 55),
        digital: keywordOf(band.result) === "FIRE" || percent > 66 ? 1 : 0,
      },
      expectKeyword: keywordOf(band.result),
      expectOutput: outputOf(band.result),
      inputLabel: `reading ${percent} % · ${20 + ((i * 7) % 45)} °C`,
      expectedLabel: band.result,
    });
  }
  return cases;
}

export type TestResult = {
  id: string;
  name: string;
  hidden: boolean;
  passed: boolean;
  points: number;
  earned: number;
  /** only populated for public cases */
  input?: string;
  expected?: string;
  actual?: string;
  message: string;
};

export type SuiteResult = {
  compiled: boolean;
  errors: SourceError[];
  results: TestResult[];
  passed: number;
  total: number;
  score: number;
  ranAt: string;
};

/** Runs every case in isolation: fresh sketch, 3 loop iterations, then assertions. */
export function runSuite(code: string, problem: Problem, cases = buildSuite(problem)): SuiteResult {
  const compiled = compileSketch(code);
  if (!compiled.program) {
    return {
      compiled: false,
      errors: compiled.errors,
      results: [],
      passed: 0,
      total: cases.length,
      score: 0,
      ranAt: new Date().toISOString(),
    };
  }

  const results: TestResult[] = [];
  for (const tc of cases) {
    const runner = new SketchRunner(code, tc.env);
    const errs = runner.compile();
    let passed = false;
    let message = "";
    let actual = "";
    if (errs.length) {
      message = `compile error: ${errs[0]!.message}`;
    } else {
      const setup = runner.setup();
      if (!setup.ok) message = `setup() error line ${setup.error?.line}: ${setup.error?.message}`;
      else {
        let runtime: string | null = null;
        for (let i = 0; i < 3; i++) {
          const r = runner.loop();
          if (!r.ok) {
            runtime = `loop() error line ${r.error?.line}: ${r.error?.message}`;
            break;
          }
        }
        actual = runner.serialText.split("\n").slice(-4).join(" ⏎ ");
        if (runtime) message = runtime;
        else {
          const printed = `${runner.serialText} ${runner.lcdText}`.toUpperCase();
          const keywordOk = printed.includes(tc.expectKeyword);
          const outputOk =
            tc.expectOutput === null
              ? true
              : tc.expectOutput === "HIGH"
                ? runner.anyOutputHigh
                : !runner.anyOutputHigh;
          passed = keywordOk && outputOk;
          message = passed
            ? "Output matched the expected state"
            : !keywordOk
              ? `Expected "${tc.expectKeyword}" on the serial monitor`
              : `Expected actuator ${tc.expectOutput}`;
        }
      }
    }
    results.push({
      id: tc.id,
      name: tc.name,
      hidden: tc.hidden,
      passed,
      points: tc.points,
      earned: passed ? tc.points : 0,
      message: tc.hidden ? (passed ? "Passed" : "Failed") : message,
      ...(tc.hidden
        ? {}
        : {
            input: tc.inputLabel,
            expected: tc.expectedLabel,
            actual: actual || "(no serial output)",
          }),
    });
  }

  const passed = results.filter((r) => r.passed).length;
  const score = Math.round((passed / Math.max(1, results.length)) * problem.points * 10) / 10;
  return {
    compiled: true,
    errors: [],
    results,
    passed,
    total: results.length,
    score,
    ranAt: new Date().toISOString(),
  };
}

/* A small but real interpreter for the Arduino C/C++ subset used in the lab. */

export type SourceError = { line: number; message: string };

export interface Hardware {
  pinMode(pin: number, mode: number): void;
  digitalWrite(pin: number, value: number): void;
  digitalRead(pin: number): number;
  analogRead(pin: number): number;
  analogWrite(pin: number, value: number): void;
  delay(ms: number): void;
  micros(): number;
  millis(): number;
  serialBegin(baud: number): void;
  serialPrint(text: string, newline: boolean): void;
  pulseIn(pin: number, level: number): number;
  display(objectClass: string, method: string, args: Value[]): void;
  servo(objectName: string, method: string, args: Value[]): void;
  sensorRead(objectClass: string, method: string, args: Value[]): number;
  tone(pin: number, freq: number): void;
  noTone(pin: number): void;
}

export type Value = number | string | boolean;

/* --------------------------------- lexer ---------------------------------- */

type Tok = { t: "num" | "str" | "id" | "op" | "eof"; v: string; line: number };

const KEYWORD_TYPES = new Set([
  "void", "int", "long", "float", "double", "char", "bool", "boolean", "byte",
  "unsigned", "short", "String", "const", "static", "uint8_t", "uint16_t",
  "uint32_t", "int8_t", "int16_t", "int32_t", "size_t", "volatile",
]);

const OPS = [
  ">>=", "<<=", "...", "&&", "||", "==", "!=", "<=", ">=", "++", "--", "+=", "-=",
  "*=", "/=", "%=", "&=", "|=", "^=", "<<", ">>", "->", "::",
  "+", "-", "*", "/", "%", "=", "<", ">", "!", "&", "|", "^", "~", "?", ":",
  "(", ")", "{", "}", "[", "]", ";", ",", ".",
];

function stripComments(src: string) {
  let out = "";
  for (let i = 0; i < src.length; i++) {
    if (src[i] === "/" && src[i + 1] === "/") {
      while (i < src.length && src[i] !== "\n") i++;
      out += "\n";
    } else if (src[i] === "/" && src[i + 1] === "*") {
      i += 2;
      while (i < src.length && !(src[i] === "*" && src[i + 1] === "/")) {
        if (src[i] === "\n") out += "\n";
        i++;
      }
      i++;
    } else if (src[i] === '"') {
      out += src[i++];
      while (i < src.length && src[i] !== '"') {
        if (src[i] === "\\") out += src[i++];
        out += src[i++];
      }
      out += src[i] ?? "";
    } else out += src[i];
  }
  return out;
}

function preprocess(src: string): { code: string; defines: Record<string, string> } {
  const defines: Record<string, string> = {};
  const lines = src.split("\n").map((line) => {
    const t = line.trim();
    if (t.startsWith("#define")) {
      const m = t.match(/^#define\s+([A-Za-z_]\w*)\s*(.*)$/);
      if (m && m[2]) defines[m[1]!] = m[2].trim();
      return "";
    }
    if (t.startsWith("#")) return "";
    return line;
  });
  let code = lines.join("\n");
  for (const [k, v] of Object.entries(defines))
    code = code.replace(new RegExp(`\\b${k}\\b`, "g"), `(${v})`);
  return { code, defines };
}

function lex(src: string): Tok[] {
  const toks: Tok[] = [];
  let i = 0;
  let line = 1;
  while (i < src.length) {
    const ch = src[i]!;
    if (ch === "\n") { line++; i++; continue; }
    if (/\s/.test(ch)) { i++; continue; }
    if (ch === '"') {
      let s = "";
      i++;
      while (i < src.length && src[i] !== '"') {
        if (src[i] === "\\") {
          i++;
          const e = src[i]!;
          s += e === "n" ? "\n" : e === "t" ? "\t" : e;
        } else s += src[i];
        i++;
      }
      i++;
      toks.push({ t: "str", v: s, line });
      continue;
    }
    if (ch === "'") {
      i++;
      let s = src[i] ?? "";
      if (s === "\\") { i++; s = src[i] === "n" ? "\n" : src[i]!; }
      i += 2;
      toks.push({ t: "num", v: String(s.charCodeAt(0)), line });
      continue;
    }
    if (/[0-9]/.test(ch) || (ch === "." && /[0-9]/.test(src[i + 1] ?? ""))) {
      let s = "";
      if (ch === "0" && (src[i + 1] === "x" || src[i + 1] === "X")) {
        s = "0x"; i += 2;
        while (i < src.length && /[0-9a-fA-F]/.test(src[i]!)) s += src[i++];
        toks.push({ t: "num", v: String(parseInt(s, 16)), line });
        continue;
      }
      while (i < src.length && /[0-9._]/.test(src[i]!)) s += src[i++];
      while (i < src.length && /[fFuUlL]/.test(src[i]!)) i++;
      toks.push({ t: "num", v: s.replace(/_/g, ""), line });
      continue;
    }
    if (/[A-Za-z_]/.test(ch)) {
      let s = "";
      while (i < src.length && /[A-Za-z0-9_]/.test(src[i]!)) s += src[i++];
      toks.push({ t: "id", v: s, line });
      continue;
    }
    const op = OPS.find((o) => src.startsWith(o, i));
    if (op) { toks.push({ t: "op", v: op, line }); i += op.length; continue; }
    i++;
  }
  toks.push({ t: "eof", v: "", line });
  return toks;
}

/* --------------------------------- parser --------------------------------- */

type Expr =
  | { k: "num"; v: number }
  | { k: "str"; v: string }
  | { k: "id"; name: string; line: number }
  | { k: "bin"; op: string; a: Expr; b: Expr }
  | { k: "un"; op: string; e: Expr }
  | { k: "post"; op: string; e: Expr }
  | { k: "assign"; op: string; target: Expr; value: Expr }
  | { k: "cond"; c: Expr; a: Expr; b: Expr }
  | { k: "call"; callee: string; obj?: string | undefined; args: Expr[]; line: number }
  | { k: "index"; e: Expr; i: Expr };

type Stmt =
  | { k: "expr"; e: Expr; line: number }
  | { k: "decl"; name: string; init?: Expr | undefined; line: number; ctype: string }
  | { k: "objdecl"; cls: string; name: string; args: Expr[]; line: number }
  | { k: "block"; body: Stmt[] }
  | { k: "if"; c: Expr; then: Stmt; else?: Stmt | undefined; line: number }
  | { k: "while"; c: Expr; body: Stmt; line: number }
  | { k: "do"; c: Expr; body: Stmt; line: number }
  | { k: "for"; init?: Stmt | undefined; c?: Expr | undefined; step?: Expr | undefined; body: Stmt; line: number }
  | { k: "return"; e?: Expr | undefined; line: number }
  | { k: "break" }
  | { k: "continue" }
  | { k: "switch"; d: Expr; cases: { test?: Expr | undefined; body: Stmt[] }[]; line: number }
  | { k: "empty" };

type FuncDecl = { name: string; params: string[]; body: Stmt; line: number };
export type Program = { funcs: Map<string, FuncDecl>; globals: Stmt[]; objects: Map<string, string> };

class ParseError extends Error {
  constructor(message: string, public line: number) { super(message); }
}

class Parser {
  i = 0;
  objects = new Map<string, string>();
  constructor(private toks: Tok[]) {}
  peek(o = 0) { return this.toks[Math.min(this.i + o, this.toks.length - 1)]!; }
  next() { return this.toks[this.i++]!; }
  is(v: string, o = 0) { const t = this.peek(o); return t.v === v && (t.t === "op" || t.t === "id"); }
  eat(v: string) { if (this.is(v)) { this.i++; return true; } return false; }
  expect(v: string) {
    if (!this.eat(v)) throw new ParseError(`expected '${v}' but found '${this.peek().v || "end of file"}'`, this.peek().line);
    return true;
  }

  parseProgram(): Program {
    const funcs = new Map<string, FuncDecl>();
    const globals: Stmt[] = [];
    while (this.peek().t !== "eof") {
      const start = this.i;
      const fn = this.tryFunction();
      if (fn) { funcs.set(fn.name, fn); continue; }
      this.i = start;
      const st = this.parseStatement();
      globals.push(st);
    }
    return { funcs, globals, objects: this.objects };
  }

  skipTypeTokens() {
    let saw = false;
    while (this.peek().t === "id" && KEYWORD_TYPES.has(this.peek().v)) { this.i++; saw = true; }
    while (this.is("*") || this.is("&")) this.i++;
    return saw;
  }

  tryFunction(): FuncDecl | null {
    const start = this.i;
    this.skipTypeTokens();
    // a user class return type / plain identifier type
    if (this.peek().t === "id" && this.peek(1).t === "id" && this.peek(2).v === "(") this.i++;
    if (this.peek().t !== "id" || this.peek(1).v !== "(") { this.i = start; return null; }
    const nameTok = this.next();
    const line = nameTok.line;
    this.expect("(");
    const params: string[] = [];
    while (!this.is(")") && this.peek().t !== "eof") {
      this.skipTypeTokens();
      if (this.peek().t === "id" && !this.is(",") ) params.push(this.next().v);
      while (this.is("[")) { this.i++; while (!this.is("]") && this.peek().t !== "eof") this.i++; this.expect("]"); }
      if (!this.eat(",")) break;
    }
    this.expect(")");
    if (!this.is("{")) { this.i = start; return null; }
    const body = this.parseBlock();
    return { name: nameTok.v, params, body, line };
  }

  parseBlock(): Stmt {
    this.expect("{");
    const body: Stmt[] = [];
    while (!this.is("}")) {
      if (this.peek().t === "eof") throw new ParseError("missing closing '}'", this.peek().line);
      body.push(this.parseStatement());
    }
    this.expect("}");
    return { k: "block", body };
  }

  parseStatement(): Stmt {
    const tok = this.peek();
    const line = tok.line;
    if (this.is("{")) return this.parseBlock();
    if (this.eat(";")) return { k: "empty" };
    if (this.is("if")) {
      this.i++; this.expect("(");
      const c = this.parseExpr(); this.expect(")");
      const then = this.parseStatement();
      let els: Stmt | undefined;
      if (this.is("else")) { this.i++; els = this.parseStatement(); }
      return { k: "if", c, then, else: els, line };
    }
    if (this.is("while")) {
      this.i++; this.expect("(");
      const c = this.parseExpr(); this.expect(")");
      return { k: "while", c, body: this.parseStatement(), line };
    }
    if (this.is("do")) {
      this.i++;
      const body = this.parseStatement();
      this.expect("while"); this.expect("(");
      const c = this.parseExpr(); this.expect(")"); this.eat(";");
      return { k: "do", c, body, line };
    }
    if (this.is("for")) {
      this.i++; this.expect("(");
      const init = this.is(";") ? (this.i++, undefined) : this.parseStatement();
      const c = this.is(";") ? undefined : this.parseExpr();
      this.expect(";");
      const step = this.is(")") ? undefined : this.parseExpr();
      this.expect(")");
      return { k: "for", init, c, step, body: this.parseStatement(), line };
    }
    if (this.is("switch")) {
      this.i++; this.expect("(");
      const d = this.parseExpr(); this.expect(")"); this.expect("{");
      const cases: { test?: Expr | undefined; body: Stmt[] }[] = [];
      while (!this.is("}") && this.peek().t !== "eof") {
        let test: Expr | undefined;
        if (this.eat("case")) { test = this.parseExpr(); this.expect(":"); }
        else if (this.eat("default")) this.expect(":");
        const body: Stmt[] = [];
        while (!this.is("case") && !this.is("default") && !this.is("}") && this.peek().t !== "eof")
          body.push(this.parseStatement());
        cases.push({ test, body });
      }
      this.expect("}");
      return { k: "switch", d, cases, line };
    }
    if (this.is("return")) {
      this.i++;
      if (this.eat(";")) return { k: "return", line };
      const e = this.parseExpr(); this.eat(";");
      return { k: "return", e, line };
    }
    if (this.is("break")) { this.i++; this.eat(";"); return { k: "break" }; }
    if (this.is("continue")) { this.i++; this.eat(";"); return { k: "continue" }; }

    // declarations
    const start = this.i;
    const hadType = this.skipTypeTokens();
    if (hadType && this.peek().t === "id") return this.parseDeclarators(line);
    // Class instance: Ident ident ( ... ) ;   or   Ident ident ;
    if (
      !hadType && tok.t === "id" && this.peek(1).t === "id" &&
      (this.peek(2).v === "(" || this.peek(2).v === ";" || this.peek(2).v === "=")
    ) {
      const cls = this.next().v;
      const name = this.next().v;
      const args: Expr[] = [];
      if (this.eat("(")) {
        while (!this.is(")") && this.peek().t !== "eof") { args.push(this.parseAssign()); if (!this.eat(",")) break; }
        this.expect(")");
      } else if (this.eat("=")) this.parseAssign();
      this.eat(";");
      this.objects.set(name, cls);
      return { k: "objdecl", cls, name, args, line };
    }
    this.i = start;
    const e = this.parseExpr();
    this.eat(";");
    return { k: "expr", e, line };
  }

  parseDeclarators(line: number): Stmt {
    const decls: Stmt[] = [];
    for (;;) {
      const name = this.next().v;
      if (this.is("[")) { this.i++; while (!this.is("]") && this.peek().t !== "eof") this.i++; this.expect("]"); }
      let init: Expr | undefined;
      if (this.eat("=")) {
        if (this.is("{")) { // array literal — skipped, initialised to 0
          let d = 0;
          do { if (this.is("{")) d++; if (this.is("}")) d--; this.i++; } while (d > 0 && this.peek().t !== "eof");
        } else init = this.parseAssign();
      }
      decls.push({ k: "decl", name, init, line, ctype: "var" });
      if (!this.eat(",")) break;
    }
    this.eat(";");
    return decls.length === 1 ? decls[0]! : { k: "block", body: decls };
  }

  parseExpr(): Expr {
    let e = this.parseAssign();
    while (this.is(",")) { this.i++; e = this.parseAssign(); }
    return e;
  }

  parseAssign(): Expr {
    const target = this.parseCond();
    const op = this.peek().v;
    if (this.peek().t === "op" && ["=", "+=", "-=", "*=", "/=", "%=", "&=", "|=", "^="].includes(op)) {
      this.i++;
      return { k: "assign", op, target, value: this.parseAssign() };
    }
    return target;
  }

  parseCond(): Expr {
    const c = this.parseBinary(0);
    if (this.eat("?")) {
      const a = this.parseAssign();
      this.expect(":");
      return { k: "cond", c, a, b: this.parseAssign() };
    }
    return c;
  }

  private static LEVELS = [["||"], ["&&"], ["|"], ["^"], ["&"], ["==", "!="], ["<", ">", "<=", ">="], ["<<", ">>"], ["+", "-"], ["*", "/", "%"]];

  parseBinary(level: number): Expr {
    if (level >= Parser.LEVELS.length) return this.parseUnary();
    let a = this.parseBinary(level + 1);
    for (;;) {
      const t = this.peek();
      if (t.t !== "op" || !Parser.LEVELS[level]!.includes(t.v)) return a;
      this.i++;
      a = { k: "bin", op: t.v, a, b: this.parseBinary(level + 1) };
    }
  }

  parseUnary(): Expr {
    const t = this.peek();
    if (t.t === "op" && ["!", "-", "+", "~", "++", "--"].includes(t.v)) {
      this.i++;
      return { k: "un", op: t.v, e: this.parseUnary() };
    }
    // cast: (int)x / (float)x
    if (this.is("(") && this.peek(1).t === "id" && KEYWORD_TYPES.has(this.peek(1).v) && this.peek(2).v === ")") {
      this.i += 3;
      return { k: "un", op: "cast", e: this.parseUnary() };
    }
    return this.parsePostfix();
  }

  parsePostfix(): Expr {
    let e = this.parsePrimary();
    for (;;) {
      if (this.is("++") || this.is("--")) { const op = this.next().v; e = { k: "post", op, e }; continue; }
      if (this.is("[")) { this.i++; const idx = this.parseExpr(); this.expect("]"); e = { k: "index", e, i: idx }; continue; }
      if (this.is(".") || this.is("->")) {
        this.i++;
        const m = this.next();
        const objName = e.k === "id" ? e.name : "";
        if (this.eat("(")) {
          const args: Expr[] = [];
          while (!this.is(")") && this.peek().t !== "eof") { args.push(this.parseAssign()); if (!this.eat(",")) break; }
          this.expect(")");
          e = { k: "call", callee: m.v, obj: objName, args, line: m.line };
        } else e = { k: "call", callee: m.v, obj: objName, args: [], line: m.line };
        continue;
      }
      return e;
    }
  }

  parsePrimary(): Expr {
    const t = this.next();
    if (t.t === "num") return { k: "num", v: Number(t.v) };
    if (t.t === "str") return { k: "str", v: t.v };
    if (t.t === "op" && t.v === "(") { const e = this.parseExpr(); this.expect(")"); return e; }
    if (t.t === "id") {
      if (this.is("(")) {
        this.i++;
        const args: Expr[] = [];
        while (!this.is(")") && this.peek().t !== "eof") { args.push(this.parseAssign()); if (!this.eat(",")) break; }
        this.expect(")");
        return { k: "call", callee: t.v, args, line: t.line };
      }
      return { k: "id", name: t.v, line: t.line };
    }
    throw new ParseError(`unexpected token '${t.v || "end of file"}'`, t.line);
  }
}

/* -------------------------------- runtime --------------------------------- */

const CONSTS: Record<string, Value> = {
  HIGH: 1, LOW: 0, INPUT: 0, OUTPUT: 1, INPUT_PULLUP: 2, true: 1, false: 0,
  LED_BUILTIN: 13, A0: 14, A1: 15, A2: 16, A3: 17, A4: 18, A5: 19,
  DEC: 10, HEX: 16, BIN: 2, PI: Math.PI, DHT11: 11, DHT22: 22, DHT21: 21,
};

class Signal { constructor(public kind: "return" | "break" | "continue", public value: Value = 0) {} }
export class RuntimeError extends Error {
  constructor(message: string, public line: number) { super(message); }
}

class Scope {
  vars = new Map<string, Value>();
  constructor(public parent?: Scope) {}
  get(n: string): Value | undefined {
    return this.vars.has(n) ? this.vars.get(n) : this.parent?.get(n);
  }
  has(n: string): boolean { return this.vars.has(n) || !!this.parent?.has(n); }
  set(n: string, v: Value) {
    let s: Scope | undefined = this;
    while (s) { if (s.vars.has(n)) { s.vars.set(n, v); return; } s = s.parent; }
    this.vars.set(n, v);
  }
  declare(n: string, v: Value) { this.vars.set(n, v); }
}

export function compileSketch(source: string): { program?: Program; errors: SourceError[] } {
  const errors: SourceError[] = [];
  try {
    const { code } = preprocess(stripComments(source));
    const program = new Parser(lex(code)).parseProgram();
    if (!program.funcs.has("setup")) errors.push({ line: 1, message: "missing required function 'void setup()'" });
    if (!program.funcs.has("loop")) errors.push({ line: 1, message: "missing required function 'void loop()'" });
    if (errors.length) return { errors };
    return { program, errors };
  } catch (e) {
    if (e instanceof ParseError) return { errors: [{ line: e.line, message: e.message }] };
    return { errors: [{ line: 1, message: (e as Error).message }] };
  }
}

const fmt = (v: Value, digits = 2): string => {
  if (typeof v === "string") return v;
  if (typeof v === "boolean") return v ? "1" : "0";
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(digits);
};

export class Sketch {
  private globals = new Scope();
  private steps = 0;
  private budget = 200000;
  constructor(private program: Program, private hw: Hardware) {}

  get objects() { return this.program.objects; }

  init() {
    for (const [k, v] of Object.entries(CONSTS)) this.globals.declare(k, v);
    for (const st of this.program.globals) this.exec(st, this.globals);
  }
  runSetup() { this.budget = 200000; this.steps = 0; this.callFunction("setup", [], 0); }
  runLoop() { this.budget = 60000; this.steps = 0; this.callFunction("loop", [], 0); }

  private tick(line: number) {
    if (++this.steps > this.budget)
      throw new RuntimeError("execution took too long — check for an infinite loop", line);
  }

  callFunction(name: string, args: Value[], line: number): Value {
    const fn = this.program.funcs.get(name);
    if (!fn) throw new RuntimeError(`function '${name}' is not defined`, line);
    const scope = new Scope(this.globals);
    fn.params.forEach((p, i) => scope.declare(p, args[i] ?? 0));
    try { this.exec(fn.body, scope); } catch (e) {
      if (e instanceof Signal && e.kind === "return") return e.value;
      throw e;
    }
    return 0;
  }

  exec(st: Stmt, scope: Scope): void {
    switch (st.k) {
      case "empty": return;
      case "block": {
        const inner = new Scope(scope);
        for (const s of st.body) this.exec(s, inner);
        return;
      }
      case "decl": {
        this.tick(st.line);
        scope.declare(st.name, st.init ? this.eval(st.init, scope) : 0);
        return;
      }
      case "objdecl": {
        const args = st.args.map((a) => this.eval(a, scope));
        scope.declare(st.name, 0);
        if (st.cls === "Servo") this.hw.servo(st.name, "create", args);
        return;
      }
      case "expr": this.tick(st.line); this.eval(st.e, scope); return;
      case "if":
        this.tick(st.line);
        if (truthy(this.eval(st.c, scope))) this.exec(st.then, scope);
        else if (st.else) this.exec(st.else, scope);
        return;
      case "while":
        while (truthy(this.eval(st.c, scope))) {
          this.tick(st.line);
          try { this.exec(st.body, scope); } catch (e) {
            if (e instanceof Signal && e.kind === "break") break;
            if (e instanceof Signal && e.kind === "continue") continue;
            throw e;
          }
        }
        return;
      case "do":
        for (;;) {
          this.tick(st.line);
          try { this.exec(st.body, scope); } catch (e) {
            if (e instanceof Signal && e.kind === "break") break;
            if (!(e instanceof Signal && e.kind === "continue")) throw e;
          }
          if (!truthy(this.eval(st.c, scope))) break;
        }
        return;
      case "for": {
        const inner = new Scope(scope);
        if (st.init) this.exec(st.init, inner);
        while (st.c === undefined || truthy(this.eval(st.c, inner))) {
          this.tick(st.line);
          try { this.exec(st.body, inner); } catch (e) {
            if (e instanceof Signal && e.kind === "break") break;
            if (!(e instanceof Signal && e.kind === "continue")) throw e;
          }
          if (st.step) this.eval(st.step, inner);
        }
        return;
      }
      case "switch": {
        const d = this.eval(st.d, scope);
        let matched = false;
        try {
          for (const c of st.cases) {
            if (!matched && c.test !== undefined && this.eval(c.test, scope) !== d) continue;
            matched = true;
            for (const s of c.body) this.exec(s, scope);
          }
          if (!matched) {
            const def = st.cases.find((c) => c.test === undefined);
            if (def) for (const s of def.body) this.exec(s, scope);
          }
        } catch (e) { if (!(e instanceof Signal && e.kind === "break")) throw e; }
        return;
      }
      case "return": throw new Signal("return", st.e ? this.eval(st.e, scope) : 0);
      case "break": throw new Signal("break");
      case "continue": throw new Signal("continue");
    }
  }

  eval(e: Expr, scope: Scope): Value {
    switch (e.k) {
      case "num": return e.v;
      case "str": return e.v;
      case "id": {
        if (scope.has(e.name)) return scope.get(e.name)!;
        if (e.name in CONSTS) return CONSTS[e.name]!;
        if (this.program.objects.has(e.name)) return 0;
        throw new RuntimeError(`'${e.name}' was not declared in this scope`, e.line);
      }
      case "index": return this.eval(e.e, scope);
      case "un": {
        if (e.op === "++" || e.op === "--") {
          const v = num(this.eval(e.e, scope)) + (e.op === "++" ? 1 : -1);
          this.assignTo(e.e, v, scope);
          return v;
        }
        const v = this.eval(e.e, scope);
        if (e.op === "!") return truthy(v) ? 0 : 1;
        if (e.op === "-") return -num(v);
        if (e.op === "~") return ~num(v);
        if (e.op === "cast") return typeof v === "string" ? v : Math.trunc(num(v));
        return v;
      }
      case "post": {
        const old = num(this.eval(e.e, scope));
        this.assignTo(e.e, old + (e.op === "++" ? 1 : -1), scope);
        return old;
      }
      case "assign": {
        const cur = e.op === "=" ? 0 : this.eval(e.target, scope);
        const rhs = this.eval(e.value, scope);
        const v =
          e.op === "=" ? rhs
          : e.op === "+=" ? (typeof cur === "string" || typeof rhs === "string" ? String(cur) + fmt(rhs) : num(cur) + num(rhs))
          : e.op === "-=" ? num(cur) - num(rhs)
          : e.op === "*=" ? num(cur) * num(rhs)
          : e.op === "/=" ? num(cur) / num(rhs)
          : e.op === "%=" ? num(cur) % num(rhs)
          : e.op === "&=" ? num(cur) & num(rhs)
          : e.op === "|=" ? num(cur) | num(rhs)
          : num(cur) ^ num(rhs);
        this.assignTo(e.target, v, scope);
        return v;
      }
      case "cond": return truthy(this.eval(e.c, scope)) ? this.eval(e.a, scope) : this.eval(e.b, scope);
      case "bin": {
        if (e.op === "&&") return truthy(this.eval(e.a, scope)) && truthy(this.eval(e.b, scope)) ? 1 : 0;
        if (e.op === "||") return truthy(this.eval(e.a, scope)) || truthy(this.eval(e.b, scope)) ? 1 : 0;
        const a = this.eval(e.a, scope);
        const b = this.eval(e.b, scope);
        if (e.op === "+" && (typeof a === "string" || typeof b === "string")) return fmt(a) + fmt(b);
        const x = num(a); const y = num(b);
        switch (e.op) {
          case "+": return x + y;
          case "-": return x - y;
          case "*": return x * y;
          case "/": return y === 0 ? 0 : x / y;
          case "%": return y === 0 ? 0 : x % y;
          case "<": return x < y ? 1 : 0;
          case ">": return x > y ? 1 : 0;
          case "<=": return x <= y ? 1 : 0;
          case ">=": return x >= y ? 1 : 0;
          case "==": return (typeof a === "string" || typeof b === "string" ? fmt(a) === fmt(b) : x === y) ? 1 : 0;
          case "!=": return (typeof a === "string" || typeof b === "string" ? fmt(a) !== fmt(b) : x !== y) ? 1 : 0;
          case "&": return x & y;
          case "|": return x | y;
          case "^": return x ^ y;
          case "<<": return x << y;
          case ">>": return x >> y;
        }
        return 0;
      }
      case "call": return this.call(e, scope);
    }
  }

  private assignTo(target: Expr, v: Value, scope: Scope) {
    if (target.k === "id") scope.set(target.name, v);
    else if (target.k === "index") this.assignTo(target.e, v, scope);
  }

  private call(e: Expr & { k: "call" }, scope: Scope): Value {
    const args = e.args.map((a) => this.eval(a, scope));
    const n = (i: number) => num(args[i] ?? 0);
    const name = e.callee;

    if (e.obj) {
      const cls = this.program.objects.get(e.obj) ?? e.obj;
      if (e.obj === "Serial") {
        switch (name) {
          case "begin": this.hw.serialBegin(n(0)); return 0;
          case "print": this.hw.serialPrint(fmt(args[0] ?? "", typeof args[1] === "number" ? num(args[1]) : 2), false); return 0;
          case "println": this.hw.serialPrint(fmt(args[0] ?? "", typeof args[1] === "number" ? num(args[1]) : 2), true); return 0;
          case "available": return 0;
          case "read": return -1;
          case "flush": return 0;
          default: return 0;
        }
      }
      if (cls === "Servo") { this.hw.servo(e.obj, name, args); return 0; }
      if (/DHT/i.test(cls)) return this.hw.sensorRead(cls, name, args);
      if (/HX711|Scale/i.test(cls)) return this.hw.sensorRead("HX711", name, args);
      this.hw.display(cls, name, args);
      return 0;
    }

    switch (name) {
      case "pinMode": this.hw.pinMode(n(0), n(1)); return 0;
      case "digitalWrite": this.hw.digitalWrite(n(0), n(1)); return 0;
      case "digitalRead": return this.hw.digitalRead(n(0));
      case "analogRead": return this.hw.analogRead(n(0));
      case "analogWrite": this.hw.analogWrite(n(0), n(1)); return 0;
      case "delay": this.hw.delay(n(0)); return 0;
      case "delayMicroseconds": this.hw.delay(n(0) / 1000); return 0;
      case "millis": return this.hw.millis();
      case "micros": return this.hw.micros();
      case "pulseIn": return this.hw.pulseIn(n(0), n(1));
      case "tone": this.hw.tone(n(0), n(1)); return 0;
      case "noTone": this.hw.noTone(n(0)); return 0;
      case "map": {
        const [x, il, ih, ol, oh] = [n(0), n(1), n(2), n(3), n(4)];
        if (ih === il) return ol;
        return Math.trunc(((x - il) * (oh - ol)) / (ih - il) + ol);
      }
      case "constrain": return Math.min(Math.max(n(0), n(1)), n(2));
      case "min": return Math.min(n(0), n(1));
      case "max": return Math.max(n(0), n(1));
      case "abs": return Math.abs(n(0));
      case "round": return Math.round(n(0));
      case "floor": return Math.floor(n(0));
      case "ceil": return Math.ceil(n(0));
      case "sqrt": return Math.sqrt(n(0));
      case "pow": return Math.pow(n(0), n(1));
      case "random": return args.length > 1
        ? Math.floor(n(0) + Math.random() * (n(1) - n(0)))
        : Math.floor(Math.random() * Math.max(1, n(0)));
      case "randomSeed": return 0;
      case "String": return fmt(args[0] ?? "");
      case "isnan": return Number.isNaN(n(0)) ? 1 : 0;
      default:
        if (this.program.funcs.has(name)) return this.callFunction(name, args, e.line);
        throw new RuntimeError(`'${name}' was not declared in this scope`, e.line);
    }
  }
}

const num = (v: Value) => (typeof v === "number" ? v : typeof v === "boolean" ? (v ? 1 : 0) : Number(v) || 0);
const truthy = (v: Value) => (typeof v === "string" ? v.length > 0 : !!num(v));

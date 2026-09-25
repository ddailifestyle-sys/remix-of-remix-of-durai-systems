import { useEffect, useMemo, useRef } from "react";

/* very small Arduino C/C++ tokenizer for highlighting */
const KEYWORDS =
  /\b(?:void|int|float|double|long|char|bool|boolean|byte|unsigned|const|static|if|else|for|while|do|switch|case|break|continue|return|true|false|HIGH|LOW|INPUT|OUTPUT|INPUT_PULLUP|struct|class|new|delete)\b/;
const BUILTINS =
  /\b(?:setup|loop|pinMode|digitalWrite|digitalRead|analogRead|analogWrite|delay|millis|micros|map|constrain|abs|min|max|random|tone|noTone|pulseIn|Serial|begin|print|println)\b/;

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const TOKEN = new RegExp(
  [
    "(\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/)", // comments
    "(\"(?:[^\"\\\\\\n]|\\\\.)*\"|'(?:[^'\\\\\\n]|\\\\.)*')", // strings
    "(#\\s*\\w+)", // preprocessor
    `(${KEYWORDS.source})`,
    `(${BUILTINS.source})`,
    "(\\b\\d+(?:\\.\\d+)?\\b)", // numbers
  ].join("|"),
  "g",
);

function highlight(code: string) {
  return `${escapeHtml(code).replace(TOKEN, (m, comment, str, pre, key, fn, num) => {
    const cls = comment
      ? "tok-comment"
      : str
        ? "tok-string"
        : pre
          ? "tok-pre"
          : key
            ? "tok-key"
            : fn
              ? "tok-fn"
              : num
                ? "tok-num"
                : "";
    return cls ? `<span class="${cls}">${m}</span>` : m;
  })}\n`;
}

type Props = {
  value: string;
  onChange: (v: string) => void;
  errorLine?: number | null;
  rows?: number;
};

export function CodeEditor({ value, onChange, errorLine = null, rows = 20 }: Props) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  const lines = useMemo(() => value.split("\n").length, [value]);

  const sync = () => {
    const ta = taRef.current;
    if (!ta) return;
    if (preRef.current) {
      preRef.current.scrollTop = ta.scrollTop;
      preRef.current.scrollLeft = ta.scrollLeft;
    }
    if (gutterRef.current) gutterRef.current.scrollTop = ta.scrollTop;
  };

  useEffect(sync, [value]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const ta = e.currentTarget;
    const { selectionStart: s, selectionEnd: en } = ta;
    const insert = (text: string, caret = text.length) => {
      e.preventDefault();
      const next = `${value.slice(0, s)}${text}${value.slice(en)}`;
      onChange(next);
      requestAnimationFrame(() => ta.setSelectionRange(s + caret, s + caret));
    };
    if (e.key === "Tab") return insert("  ");
    if (e.key === "Enter") {
      const lineStart = value.lastIndexOf("\n", s - 1) + 1;
      const current = value.slice(lineStart, s);
      const indent = current.match(/^[ \t]*/)?.[0] ?? "";
      const opens = /[{(]\s*$/.test(current);
      const closesNext = value.slice(en).trimStart().startsWith("}");
      if (opens && closesNext) return insert(`\n${indent}  \n${indent}`, indent.length + 3);
      return insert(`\n${indent}${opens ? "  " : ""}`, indent.length + (opens ? 3 : 1));
    }
    if (e.key === "}" && s === en) {
      const lineStart = value.lastIndexOf("\n", s - 1) + 1;
      const current = value.slice(lineStart, s);
      if (/^[ \t]{2,}$/.test(current)) {
        e.preventDefault();
        const next = `${value.slice(0, s - 2)}}${value.slice(en)}`;
        onChange(next);
        requestAnimationFrame(() => ta.setSelectionRange(s - 1, s - 1));
      }
    }
  };

  return (
    <div className="code-editor mt-3 flex overflow-hidden rounded-xl border border-input bg-background font-mono text-xs leading-relaxed">
      <div
        ref={gutterRef}
        aria-hidden
        className="select-none overflow-hidden border-r border-border bg-surface-2 px-3 py-3 text-right text-muted-foreground"
      >
        {Array.from({ length: lines }, (_, i) => (
          <div key={i} className={errorLine === i + 1 ? "text-danger" : undefined}>
            {i + 1}
          </div>
        ))}
      </div>
      <div className="relative flex-1">
        <pre
          ref={preRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-auto whitespace-pre p-3"
          dangerouslySetInnerHTML={{ __html: highlight(value) }}
        />
        <textarea
          ref={taRef}
          spellCheck={false}
          value={value}
          rows={rows}
          onScroll={sync}
          onKeyDown={onKeyDown}
          onChange={(e) => onChange(e.target.value)}
          className="relative h-full w-full resize-y overflow-auto whitespace-pre bg-transparent p-3 text-transparent caret-cyan outline-none"
          aria-label="Arduino sketch editor"
        />
      </div>
    </div>
  );
}

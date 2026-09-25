/* Standalone SVG / PNG export of a circuit layout, for sharing outside the app. */
import { nodeDef, type Circuit } from "./model";
import { circuitBounds, nodeSize, pinLocal, pinPosition, wirePath } from "./geometry";
import { pinDef } from "./parts";

/** Design tokens resolved to fixed hex so the exported file renders anywhere. */
const TOKEN: Record<string, string> = {
  "var(--danger)": "#ef4444",
  "var(--success)": "#22c55e",
  "var(--warning)": "#eab308",
  "var(--cyan)": "#22d3ee",
  "var(--violet)": "#a855f7",
  "var(--blue)": "#3b82f6",
  "var(--muted-foreground)": "#94a3b8",
  "var(--border)": "#334155",
};

const PIN_COLOR: Record<string, string> = {
  power: "#ef4444",
  ground: "#94a3b8",
  digital: "#22d3ee",
  pwm: "#a855f7",
  analog: "#22c55e",
  i2c: "#eab308",
  passive: "#64748b",
};

const BG = "#0b1220";
const SURFACE = "#111a2b";
const FG = "#e2e8f0";
const MUTED = "#94a3b8";
const GRID = "#1e293b";

const color = (c: string) => TOKEN[c] ?? c;
const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const r2 = (n: number) => Math.round(n * 100) / 100;

export type SvgOptions = { title?: string; padding?: number };

/** Render the circuit as a self-contained SVG document string. */
export function circuitToSvg(circuit: Circuit, options: SvgOptions = {}): string {
  const pad = options.padding ?? 60;
  const b = circuitBounds(circuit);
  const headroom = options.title ? 46 : 0;
  const legendRows = Math.min(circuit.wires.length, 14);
  const legendH = legendRows ? legendRows * 14 + 28 : 0;
  const minX = b.x - pad;
  const minY = b.y - pad - headroom;
  const width = Math.max(320, b.w + pad * 2);
  const height = Math.max(240, b.h + pad * 2 + headroom + legendH);

  const parts: string[] = [];

  parts.push(
    `<rect x="${r2(minX)}" y="${r2(minY)}" width="${r2(width)}" height="${r2(height)}" fill="${BG}"/>`,
    `<rect x="${r2(minX)}" y="${r2(minY)}" width="${r2(width)}" height="${r2(height)}" fill="url(#grid)"/>`,
  );

  if (options.title) {
    parts.push(
      `<text x="${r2(minX + 24)}" y="${r2(minY + 34)}" fill="${FG}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="20" font-weight="700">${esc(options.title)}</text>`,
    );
  }

  // wires first so components sit on top
  for (const w of circuit.wires) {
    const na = circuit.nodes.find((n) => n.id === w.from.node);
    const nb = circuit.nodes.find((n) => n.id === w.to.node);
    if (!na || !nb) continue;
    const a = pinPosition(na, w.from.pin);
    const c = pinPosition(nb, w.to.pin);
    parts.push(
      `<path d="${wirePath(a, c)}" fill="none" stroke="${color(w.color)}" stroke-width="3" stroke-linecap="round" opacity="0.9"/>`,
    );
  }

  for (const n of circuit.nodes) {
    const def = nodeDef(n);
    if (!def) continue;
    const { w, h } = nodeSize(n);
    const cx = n.x + w / 2;
    const cy = n.y + h / 2;
    const accent = color(def.color);
    const body: string[] = [
      `<rect x="${r2(n.x)}" y="${r2(n.y)}" width="${w}" height="${h}" rx="12" fill="${SURFACE}" stroke="${accent}" stroke-width="1.5"/>`,
      `<rect x="${r2(n.x)}" y="${r2(n.y)}" width="${w}" height="22" rx="10" fill="${accent}" opacity="0.2"/>`,
      `<text x="${r2(cx)}" y="${r2(n.y + 16)}" text-anchor="middle" fill="${FG}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="11" font-weight="600">${esc(def.label)}</text>`,
    ];
    if (n.flipped) {
      body.push(
        `<text x="${r2(cx)}" y="${r2(cy + 4)}" text-anchor="middle" fill="${MUTED}" font-family="ui-monospace, monospace" font-size="9">solder side</text>`,
      );
    }
    for (const pin of def.pins) {
      const l = pinLocal(n, pin);
      const px = n.x + l.x;
      const py = n.y + l.y;
      const wired = circuit.wires.some(
        (x) =>
          (x.from.node === n.id && x.from.pin === pin.id) || (x.to.node === n.id && x.to.pin === pin.id),
      );
      const fill = PIN_COLOR[pin.kind] ?? MUTED;
      body.push(
        `<circle cx="${r2(px)}" cy="${r2(py)}" r="4.5" fill="${wired ? fill : BG}" stroke="${fill}" stroke-width="2"/>`,
        `<text x="${r2(px)}" y="${r2(pin.side === "bottom" ? py + 16 : py - 8)}" text-anchor="middle" fill="${MUTED}" font-family="ui-monospace, monospace" font-size="9">${esc(pin.label)}</text>`,
      );
    }
    parts.push(`<g transform="rotate(${n.rotation} ${r2(cx)} ${r2(cy)})">${body.join("")}</g>`);
  }

  // legend of nets, laid out in a band under the diagram so nothing overlaps
  const legendTop = minY + height - legendH;
  const legend = legendH
    ? `<rect x="${r2(minX)}" y="${r2(legendTop)}" width="${r2(width)}" height="${r2(legendH)}" fill="${SURFACE}" opacity="0.85"/>` +
      `<text x="${r2(minX + 22)}" y="${r2(legendTop + 18)}" fill="${FG}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="11" font-weight="700">Connections</text>` +
      circuit.wires
        .slice(0, legendRows)
        .map((wire, i) => {
          const na = circuit.nodes.find((n) => n.id === wire.from.node);
          const nb = circuit.nodes.find((n) => n.id === wire.to.node);
          if (!na || !nb) return "";
          const la = `${nodeDef(na)?.label ?? na.type} ${pinDef(na.type, wire.from.pin)?.label ?? wire.from.pin}`;
          const lb = `${nodeDef(nb)?.label ?? nb.type} ${pinDef(nb.type, wire.to.pin)?.label ?? wire.to.pin}`;
          const y = legendTop + 34 + i * 14;
          return `<circle cx="${r2(minX + 26)}" cy="${r2(y - 3)}" r="4" fill="${color(wire.color)}"/><text x="${r2(minX + 38)}" y="${r2(y)}" fill="${MUTED}" font-family="ui-monospace, monospace" font-size="10">${esc(`${la} \u2192 ${lb}`)}</text>`;
        })
        .join("")
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${r2(width)}" height="${r2(height)}" viewBox="${r2(minX)} ${r2(minY)} ${r2(width)} ${r2(height)}">
<defs><pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M 24 0 L 0 0 0 24" fill="none" stroke="${GRID}" stroke-width="1"/></pattern></defs>
${parts.join("\n")}
${legend}
</svg>`;
}

const triggerDownload = (url: string, filename: string) => {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
};

export function downloadCircuitSvg(circuit: Circuit, filename: string, title?: string) {
  const svg = circuitToSvg(circuit, title ? { title } : {});
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  triggerDownload(url, filename);
  URL.revokeObjectURL(url);
}

/** Rasterise the SVG through an offscreen canvas (2x for crisp sharing). */
export async function downloadCircuitPng(
  circuit: Circuit,
  filename: string,
  title?: string,
  scale = 2,
): Promise<void> {
  const svg = circuitToSvg(circuit, title ? { title } : {});
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Could not rasterise the diagram."));
      el.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = Math.round((img.width || 800) * scale);
    canvas.height = Math.round((img.height || 600) * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is unavailable in this browser.");
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) throw new Error("PNG encoding failed.");
    const pngUrl = URL.createObjectURL(blob);
    triggerDownload(pngUrl, filename);
    URL.revokeObjectURL(pngUrl);
  } finally {
    URL.revokeObjectURL(url);
  }
}

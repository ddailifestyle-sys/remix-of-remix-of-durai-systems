import type { PartDef } from "@/lib/circuit/parts";

/**
 * Photo-like thumbnail for each component.
 *
 * Parts are grouped by physical build so the artwork matches the real object:
 * PCB modules get a soldermask substrate, copper traces and a gold header;
 * discrete parts (LED, buzzer, motors, probes) are drawn as bare bodies with
 * tinned legs on a neutral background.
 */
export function PartIcon({ def, className = "h-10 w-14" }: { def: PartDef; className?: string }) {
  const c = def.color;
  const uid = `pi-${def.type}`;
  const style = bodyStyle(def);
  const mask = def.isBoard
    ? boardMask(def.type)
    : def.type === "breadboard"
      ? "#efece2"
      : style === "module"
        ? "#0d4b6b"
        : "#0b1220";

  return (
    <svg viewBox="0 0 64 44" className={className} role="img" aria-label={def.label}>
      <defs>
        <linearGradient id={`${uid}-pcb`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.16" />
          <stop offset="18%" stopColor={mask} />
          <stop offset="82%" stopColor={mask} />
          <stop offset="100%" stopColor="#000" stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id={`${uid}-gold`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffe9a8" />
          <stop offset="45%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="#7d5f10" />
        </linearGradient>
        <linearGradient id={`${uid}-metal`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f4f6f8" />
          <stop offset="45%" stopColor="#aab4bd" />
          <stop offset="100%" stopColor="#5d666e" />
        </linearGradient>
        <linearGradient id={`${uid}-black`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a3f46" />
          <stop offset="60%" stopColor="#15181c" />
          <stop offset="100%" stopColor="#05070a" />
        </linearGradient>
        <linearGradient id={`${uid}-gloss`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.3" />
          <stop offset="40%" stopColor="#fff" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`${uid}-lens`} cx="0.35" cy="0.3" r="0.75">
          <stop offset="0%" stopColor="#dff3ff" stopOpacity="0.95" />
          <stop offset="45%" stopColor="#12466b" />
          <stop offset="100%" stopColor="#04101c" />
        </radialGradient>
        <radialGradient id={`${uid}-bulb`} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.95" />
          <stop offset="40%" stopColor={c} stopOpacity="0.9" />
          <stop offset="100%" stopColor={c} stopOpacity="0.35" />
        </radialGradient>
      </defs>

      {style === "discrete" ? (
        <rect x="1" y="2" width="62" height="40" rx="4" fill="#080c12" stroke="#1d242e" />
      ) : (
        <>
          {/* PCB substrate: soldermask, copper traces, silkscreen, plated holes */}
          <rect x="2" y="4" width="60" height="36" rx="2.5" fill={`url(#${uid}-pcb)`} stroke="#000" strokeOpacity="0.55" />
          <g stroke="#e3c463" strokeOpacity="0.28" strokeWidth="0.6" fill="none">
            <path d="M6 37h18l4-4h14" />
            <path d="M6 9h13l5 4h20" />
            <path d="M57 12v20" />
            <path d="M9 14v18" />
          </g>
          <g fill="#fff" fillOpacity="0.1">
            <rect x="8" y="35.2" width="8" height="1" rx="0.5" />
            <rect x="46" y="6.6" width="10" height="1" rx="0.5" />
          </g>
          {[
            [5.6, 7.6],
            [58.4, 7.6],
            [5.6, 36.4],
            [58.4, 36.4],
          ].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="1.5" fill="#070a0e" stroke="#d4af37" strokeWidth="0.6" />
          ))}
        </>
      )}

      <g>{art(def, c, uid)}</g>

      {style === "module" || def.isBoard ? (
        <>
          {/* gold 0.1" header along the bottom edge */}
          <rect x="9" y="38.6" width="46" height="2.8" rx="0.8" fill={`url(#${uid}-gold)`} />
          {Array.from({ length: 11 }, (_, i) => (
            <rect key={i} x={10.4 + i * 4.1} y="37.6" width="1.5" height="4.6" rx="0.5" fill="#f0d47f" />
          ))}
        </>
      ) : null}

      {style !== "discrete" && (
        <rect x="2" y="4" width="60" height="36" rx="2.5" fill={`url(#${uid}-gloss)`} className="pointer-events-none" />
      )}
    </svg>
  );
}

/** Physical build of the part, which decides the background treatment. */
function bodyStyle(def: PartDef): "board" | "module" | "discrete" {
  if (def.isBoard) return "board";
  if (
    [
      "led",
      "rgb-led",
      "buzzer",
      "push-button",
      "potentiometer",
      "servo",
      "dc-motor",
      "stepper",
      "solenoid",
      "led-strip",
      "load-cell",
      "anemometer",
      "ph-sensor",
      "breadboard",
    ].includes(def.type)
  )
    return "discrete";
  return "module";
}

/** Real soldermask colour per board family. */
function boardMask(type: string) {
  switch (type) {
    case "arduino-uno":
    case "arduino-mega":
      return "#0f6fa8"; // Arduino teal-blue
    case "arduino-nano":
      return "#12607f";
    case "esp32-devkit":
    case "esp32-s3-cam":
      return "#121417"; // matte black ESP boards
    case "esp8266":
      return "#141b22";
    case "rpi-pico":
      return "#123c2b";
    default:
      return "#0f5d63";
  }
}

const legs = (xs: number[], y0: number, y1: number, w = 1.6) =>
  xs.map((x) => <path key={x} d={`M${x} ${y0}V${y1}`} stroke="#c8ced6" strokeWidth={w} strokeLinecap="round" />);

const header = (x: number, y: number, n: number, gap = 3.6) =>
  Array.from({ length: n }, (_, i) => (
    <rect key={i} x={x + i * gap} y={y} width="1.7" height="2.6" rx="0.4" fill="#e8c86a" stroke="#8a6b12" strokeWidth="0.3" />
  ));

function art(def: PartDef, c: string, uid: string) {
  const t = def.type;
  const metal = `url(#${uid}-metal)`;
  const black = `url(#${uid}-black)`;

  /* ------------------------------- boards -------------------------------- */
  if (t === "esp32-s3-cam")
    return (
      <>
        <rect x="6" y="8" width="52" height="26" rx="1.5" fill="#0b0d10" opacity="0.6" />
        <rect x="8" y="10" width="20" height="14" rx="1" fill={metal} opacity="0.9" />
        <rect x="10" y="12" width="16" height="10" rx="0.6" fill="#0c1116" />
        {/* OV2640 lens barrel */}
        <rect x="32" y="9" width="22" height="22" rx="2" fill={black} />
        <circle cx="43" cy="20" r="8.6" fill="#191d22" stroke="#30363d" strokeWidth="0.8" />
        <circle cx="43" cy="20" r="6" fill={`url(#${uid}-lens)`} />
        <circle cx="40.6" cy="17.6" r="1.6" fill="#fff" opacity="0.6" />
        {header(9, 30, 5)}
      </>
    );

  if (t === "esp32-devkit")
    return (
      <>
        {/* shielded WROOM module + PCB antenna */}
        <rect x="18" y="8" width="28" height="17" rx="1.2" fill={metal} />
        <rect x="19" y="9" width="26" height="15" rx="1" fill="#9aa4ad" opacity="0.5" />
        <text x="21.5" y="18.6" fontSize="4.4" fill="#2b3238" fontFamily="monospace">
          WROOM
        </text>
        <g fill="#d4af37" opacity="0.85">
          <rect x="18" y="4.6" width="12" height="2.6" rx="0.4" />
          <rect x="20" y="5.2" width="8" height="1.4" rx="0.3" fill="#0f1114" />
        </g>
        <rect x="6" y="14" width="9" height="7" rx="0.8" fill="#20262c" />
        <rect x="49" y="13" width="9" height="9" rx="1" fill={metal} opacity="0.85" />
        <circle cx="12" cy="29" r="1.3" fill="var(--danger)" />
        <circle cx="17" cy="29" r="1.3" fill="var(--cyan)" />
        {header(24, 28, 6)}
      </>
    );

  if (t === "esp8266")
    return (
      <>
        <rect x="16" y="9" width="26" height="16" rx="1.2" fill={metal} />
        <text x="18.6" y="19" fontSize="4.2" fill="#2b3238" fontFamily="monospace">
          ESP-12
        </text>
        <rect x="45" y="12" width="12" height="9" rx="1" fill="#20262c" />
        <rect x="4" y="15" width="9" height="7" rx="1" fill={metal} opacity="0.8" />
        <circle cx="46" cy="27" r="1.2" fill="var(--cyan)" />
        {header(20, 28, 6)}
      </>
    );

  if (t === "arduino-uno" || t === "arduino-mega")
    return (
      <>
        {/* USB-B socket, barrel jack, DIP MCU, crystal */}
        <rect x="3.4" y="10" width="12" height="11" rx="1" fill={metal} />
        <rect x="5" y="12" width="8.8" height="7" rx="0.6" fill="#3a4249" />
        <rect x="3.4" y="26" width="11" height="9" rx="1.6" fill={black} />
        <circle cx="8.9" cy="30.5" r="1.6" fill="#2a3037" />
        <rect x="22" y="16" width="24" height="10" rx="1" fill="#101418" />
        <g fill="#c8ced6" opacity="0.8">
          {Array.from({ length: 7 }, (_, i) => (
            <rect key={i} x={23.4 + i * 3.2} y="14.6" width="1.4" height="1.6" rx="0.3" />
          ))}
          {Array.from({ length: 7 }, (_, i) => (
            <rect key={`b${i}`} x={23.4 + i * 3.2} y="25.8" width="1.4" height="1.6" rx="0.3" />
          ))}
        </g>
        <rect x="49" y="18" width="8" height="5" rx="2.4" fill={metal} />
        <circle cx="52" cy="30" r="1.3" fill="var(--warning)" />
        <circle cx="56" cy="30" r="1.3" fill="var(--success)" />
        {header(20, 6.4, 8)}
      </>
    );

  if (t === "arduino-nano")
    return (
      <>
        <rect x="4" y="14" width="11" height="9" rx="1" fill={metal} />
        <rect x="20" y="15" width="22" height="12" rx="1" fill="#101418" />
        <text x="23" y="23" fontSize="4" fill="#8d99a4" fontFamily="monospace">
          328P
        </text>
        <rect x="46" y="17" width="7" height="5" rx="2.4" fill={metal} />
        {header(20, 6.4, 8)}
      </>
    );

  if (t === "rpi-pico")
    return (
      <>
        <rect x="6" y="12" width="12" height="8" rx="1" fill={metal} />
        <rect x="22" y="14" width="14" height="14" rx="1.4" fill={black} />
        <text x="23.4" y="22.8" fontSize="4" fill="#8d99a4" fontFamily="monospace">
          2040
        </text>
        <rect x="40" y="13" width="16" height="10" rx="1" fill={metal} opacity="0.85" />
        <rect x="42" y="8" width="12" height="3" rx="0.5" fill="#d4af37" opacity="0.8" />
        {header(22, 6.4, 7)}
      </>
    );

  if (def.isBoard)
    return (
      <>
        <rect x="18" y="10" width="28" height="17" rx="1.2" fill={metal} />
        <rect x="6" y="14" width="9" height="7" rx="1" fill="#20262c" />
        {header(22, 29, 6)}
      </>
    );

  /* ------------------------- discrete + modules --------------------------- */
  switch (t) {
    case "breadboard":
      return (
        <>
          <rect x="2" y="4" width="60" height="36" rx="2" fill="#efece2" stroke="#c9c5b8" />
          <path d="M4 10h56M4 34h56" stroke="var(--danger)" strokeWidth="0.6" opacity="0.7" />
          <path d="M4 12h56M4 36h56" stroke="#3b82f6" strokeWidth="0.6" opacity="0.7" />
          <rect x="30.4" y="16" width="3.2" height="12" fill="#dcd8cc" />
          {[0, 1, 2, 3, 4, 5].map((r) =>
            Array.from({ length: 14 }, (_, i) => (
              <rect key={`${r}-${i}`} x={5 + i * 4} y={15.4 + r * 2.6} width="1.5" height="1.5" rx="0.2" fill="#8d8879" />
            )),
          )}
        </>
      );
    case "led":
    case "rgb-led":
      return (
        <>
          <path d="M23 22a9 9 0 0118 0v6H23z" fill={`url(#${uid}-bulb)`} stroke={c} strokeOpacity="0.6" />
          <rect x="22" y="27.4" width="20" height="2.6" rx="1" fill={c} opacity="0.55" />
          <ellipse cx="28" cy="18" rx="2" ry="3" fill="#fff" opacity="0.45" />
          {legs([28, 34], 30, 39, 1.8)}
          {t === "rgb-led" && legs([31], 30, 37, 1.4)}
        </>
      );
    case "led-strip":
      return (
        <>
          <rect x="3" y="17" width="58" height="11" rx="1.4" fill="#f5f6f7" stroke="#c8ced6" />
          <rect x="3" y="17" width="58" height="3" fill="#e3e6e9" />
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={7 + i * 11} y="19.4" width="7" height="6.6" rx="0.8" fill="#e8eaec" stroke="#b9c0c7" strokeWidth="0.4" />
          ))}
          {[0, 1, 2, 3, 4].map((i) => (
            <circle key={`d${i}`} cx={10.5 + i * 11} cy={22.7} r="2" fill={i % 2 ? "var(--cyan)" : c} />
          ))}
        </>
      );
    case "buzzer":
      return (
        <>
          <circle cx="32" cy="20" r="12" fill={black} />
          <circle cx="32" cy="20" r="12" fill="none" stroke="#3a4249" strokeWidth="0.8" />
          <circle cx="32" cy="20" r="2" fill="#2b3238" stroke="#666" strokeWidth="0.4" />
          <path d="M24 12a11 11 0 0116 0" stroke="#4a5259" strokeWidth="0.6" fill="none" />
          {legs([29, 35], 31, 39, 1.7)}
        </>
      );
    case "push-button":
      return (
        <>
          <rect x="20" y="11" width="24" height="21" rx="2" fill="#1a1f25" stroke="#39414a" />
          <rect x="22.5" y="13.5" width="19" height="16" rx="1.4" fill="#22282f" />
          <circle cx="32" cy="21.5" r="5.6" fill={c} opacity="0.85" stroke="#000" strokeOpacity="0.35" />
          <circle cx="30.2" cy="19.6" r="1.8" fill="#fff" opacity="0.35" />
          <g stroke={metal} strokeWidth="1.6" strokeLinecap="round">
            <path d="M20 15h-6M44 15h6M20 28h-6M44 28h6" />
          </g>
        </>
      );
    case "potentiometer":
      return (
        <>
          <rect x="18" y="16" width="28" height="15" rx="1.2" fill="#1c5fa8" />
          <circle cx="32" cy="17" r="9" fill={metal} />
          <circle cx="32" cy="17" r="6.4" fill="#8e979f" />
          <path d="M32 17l4.4-4" stroke="#20262c" strokeWidth="1.6" strokeLinecap="round" />
          {legs([25, 32, 39], 31, 39, 1.6)}
        </>
      );
    case "servo":
      return (
        <>
          <rect x="12" y="14" width="26" height="20" rx="1.4" fill="#1a2a5e" />
          <rect x="12" y="14" width="26" height="4" rx="1" fill="#243a80" />
          <circle cx="40" cy="20" r="7" fill="#1a2a5e" />
          <circle cx="40" cy="20" r="3.4" fill={metal} />
          <rect x="39" y="18.4" width="16" height="3.2" rx="1.6" fill="#e6e8ea" />
          <g strokeWidth="1.4" strokeLinecap="round">
            <path d="M12 26H4" stroke="#e06666" />
            <path d="M12 29H4" stroke="#f0c040" />
            <path d="M12 32H4" stroke="#8d99a4" />
          </g>
        </>
      );
    case "dc-motor":
    case "stepper":
      return (
        <>
          <rect x="10" y="10" width="30" height="24" rx="4" fill={metal} />
          <rect x="10" y="10" width="30" height="24" rx="4" fill="none" stroke="#5d666e" strokeWidth="0.7" />
          <path d="M16 10v24M34 10v24" stroke="#7d868e" strokeWidth="0.6" />
          <rect x="40" y="20" width="12" height="4" rx="2" fill="#c8ced6" />
          <circle cx="52" cy="22" r="2.4" fill="#8d99a4" />
          <g strokeWidth="1.4">
            <path d="M10 15H3" stroke="#e06666" />
            <path d="M10 29H3" stroke="#8d99a4" />
          </g>
        </>
      );
    case "solenoid":
      return (
        <>
          <rect x="14" y="9" width="22" height="17" rx="1.4" fill="#2b2f36" stroke="#4a5259" />
          <g stroke="#b08d57" strokeWidth="1.1">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <path key={i} d={`M16 ${11.5 + i * 2.6}h18`} />
            ))}
          </g>
          <rect x="22" y="26" width="6" height="12" rx="1" fill={metal} />
          <path d="M36 17h16" stroke="#8d99a4" strokeWidth="3" strokeLinecap="round" />
        </>
      );
    case "relay":
      return (
        <>
          <rect x="6" y="10" width="26" height="20" rx="1" fill="#2f6ad0" />
          <rect x="6" y="10" width="26" height="20" rx="1" fill="none" stroke="#1c4a97" />
          <text x="9" y="22.4" fontSize="4.4" fill="#dce6f7" fontFamily="monospace">
            SRD
          </text>
          <rect x="35" y="12" width="22" height="16" rx="1" fill="#1b6f4a" />
          {[0, 1, 2].map((i) => (
            <rect key={i} x={37 + i * 6.6} y="14" width="5" height="12" rx="0.6" fill="#d4af37" />
          ))}
          <circle cx="12" cy="34" r="1.3" fill="var(--danger)" />
          {header(20, 33, 3)}
        </>
      );
    case "lcd-i2c":
    case "oled":
      return (
        <>
          <rect x="4" y="7" width="56" height="26" rx="1.4" fill="#0e2f24" />
          <rect x="8" y="10" width="48" height="19" rx="1" fill={t === "oled" ? "#05070a" : "#1f7a4d"} />
          {t === "oled" ? (
            <>
              <path d="M12 16h16M12 20h24M12 24h12" stroke="var(--cyan)" strokeWidth="1.4" />
              <circle cx="48" cy="20" r="3.4" fill="none" stroke="var(--cyan)" strokeWidth="1.2" />
            </>
          ) : (
            <g fill="#0b2f1e" opacity="0.75">
              {Array.from({ length: 16 }, (_, i) => (
                <rect key={i} x={10 + i * 2.9} y="12" width="2" height="6" rx="0.3" />
              ))}
              {Array.from({ length: 16 }, (_, i) => (
                <rect key={`r${i}`} x={10 + i * 2.9} y="20.5" width="2" height="6" rx="0.3" />
              ))}
            </g>
          )}
          {header(22, 33, 4)}
        </>
      );
    case "ultrasonic":
      return (
        <>
          <rect x="3" y="9" width="58" height="24" rx="1.4" fill="#12507a" />
          <circle cx="17" cy="20" r="9.4" fill={metal} />
          <circle cx="17" cy="20" r="7.4" fill="#3a4249" />
          <circle cx="17" cy="20" r="3" fill="#20262c" />
          <circle cx="47" cy="20" r="9.4" fill={metal} />
          <circle cx="47" cy="20" r="7.4" fill="#3a4249" />
          <circle cx="47" cy="20" r="3" fill="#20262c" />
          <rect x="28" y="14" width="8" height="12" rx="1" fill="#0d3f60" />
          <text x="28.6" y="21.6" fontSize="3.6" fill="#bcd4e6" fontFamily="monospace">
            HC
          </text>
          {header(24, 33, 4)}
        </>
      );
    case "soil-moisture":
      return (
        <>
          <rect x="24" y="5" width="16" height="16" rx="1" fill="#0f5d63" />
          <path d="M27 21l1.6 14M37 21l-1.6 14" stroke="#d4af37" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M4 33h56" stroke="#5b4632" strokeWidth="4" strokeLinecap="round" />
          <path d="M6 37h52" stroke="#4a382a" strokeWidth="2.6" strokeLinecap="round" opacity="0.8" />
          {header(46, 8, 3)}
        </>
      );
    case "water-level":
      return (
        <>
          <rect x="25" y="4" width="14" height="24" rx="1" fill="#0f5d63" />
          {Array.from({ length: 8 }, (_, i) => (
            <path key={i} d={`M27 ${7 + i * 2.6}h10`} stroke="#d4af37" strokeWidth="1" />
          ))}
          <path d="M3 30c6-3.4 10 3.4 16 0s10 3.4 16 0 10 3.4 16 0" stroke="var(--cyan)" strokeWidth="1.8" fill="none" />
          <path d="M3 35c6-3.4 10 3.4 16 0s10 3.4 16 0 10 3.4 16 0" stroke="var(--cyan)" strokeWidth="1.4" fill="none" opacity="0.55" />
        </>
      );
    case "ph-sensor":
      return (
        <>
          <rect x="27" y="3" width="10" height="9" rx="1" fill={metal} />
          <rect x="28.6" y="12" width="6.8" height="18" rx="2" fill="#cfd6dc" opacity="0.5" stroke="#9aa4ad" />
          <circle cx="32" cy="32.4" r="4.4" fill="#dff3ff" opacity="0.85" stroke="#9aa4ad" />
          <text x="8" y="24" fontSize="9" fill={c} fontFamily="monospace">
            pH
          </text>
        </>
      );
    case "tds":
      return (
        <>
          <rect x="25" y="4" width="14" height="10" rx="1" fill="#0f5d63" />
          <path d="M29 14v20M35 14v20" stroke={metal} strokeWidth="2.6" strokeLinecap="round" />
          {[0, 1, 2, 3, 4].map((i) => (
            <circle key={i} cx={8 + i * 12} cy={i % 2 ? 30 : 22} r="1.6" fill="var(--cyan)" opacity="0.75" />
          ))}
          {header(44, 7, 3)}
        </>
      );
    case "flame":
      return (
        <>
          <rect x="4" y="13" width="20" height="17" rx="1.2" fill="#0f5d63" />
          <circle cx="14" cy="21" r="4.4" fill="#0b1220" stroke="#1d3f5a" />
          <circle cx="14" cy="21" r="2" fill="#2b6fa8" />
          <path
            d="M45 9c4.4 6.4 7 7.6 7 12.6a7 7 0 11-14 0c0-3 2-4.4 3.6-7 .8 2 2 3 2 4.6 1.4-2 1.4-6.6 1.4-10.2z"
            fill="var(--warning)"
            opacity="0.85"
          />
          {header(6, 31, 3)}
        </>
      );
    case "gas":
      return (
        <>
          <rect x="6" y="25" width="52" height="10" rx="1.2" fill="#0f5d63" />
          <circle cx="32" cy="17" r="11.4" fill="none" stroke={metal} strokeWidth="1.4" />
          <circle cx="32" cy="17" r="11.4" fill="#5d666e" opacity="0.25" />
          <g stroke="#aab4bd" strokeWidth="0.7" opacity="0.9">
            {[-8, -4, 0, 4, 8].map((d) => (
              <path key={d} d={`M${32 + d} ${17 - Math.sqrt(Math.max(0, 130 - d * d))}V${17 + Math.sqrt(Math.max(0, 130 - d * d))}`} />
            ))}
            {[-8, -4, 0, 4, 8].map((d) => (
              <path key={`h${d}`} d={`M${32 - Math.sqrt(Math.max(0, 130 - d * d))} ${17 + d}H${32 + Math.sqrt(Math.max(0, 130 - d * d))}`} />
            ))}
          </g>
          <text x="24" y="32.4" fontSize="4.4" fill="#cfe6ea" fontFamily="monospace">
            MQ-2
          </text>
        </>
      );
    case "co2":
      return (
        <>
          <rect x="4" y="9" width="56" height="24" rx="1.4" fill="#0d3c66" />
          <rect x="7" y="12" width="26" height="18" rx="1" fill={metal} opacity="0.85" />
          <rect x="9" y="14" width="22" height="14" rx="0.6" fill="#20262c" opacity="0.6" />
          <text x="37" y="24" fontSize="8" fill="#e4f1ff" fontFamily="monospace">
            CO₂
          </text>
          {header(24, 33, 4)}
        </>
      );
    case "ldr":
      return (
        <>
          <circle cx="32" cy="20" r="11" fill="#e9e2c8" stroke="#9a9376" />
          <g stroke="#8a6b12" strokeWidth="1.9" fill="none">
            <path d="M23 15q4.5 5 9 0t9 0" />
            <path d="M23 20q4.5 5 9 0t9 0" />
            <path d="M23 25q4.5 5 9 0t9 0" />
          </g>
          {legs([29, 35], 30, 39, 1.7)}
        </>
      );
    case "uv-sensor":
      return (
        <>
          <rect x="8" y="12" width="48" height="19" rx="1.4" fill="#3b2b6b" />
          <rect x="26" y="16" width="12" height="11" rx="1" fill="#0b1220" stroke="#7a6bbf" />
          <circle cx="32" cy="21.5" r="3.2" fill="#b39ddb" />
          <path d="M32 3v6M20 6l3 5.4M44 6l-3 5.4" stroke="#b39ddb" strokeWidth="1.5" strokeLinecap="round" />
          {header(44, 32, 3)}
        </>
      );
    case "pir":
      return (
        <>
          <rect x="8" y="30" width="48" height="6" rx="1" fill="#0f5d63" />
          <path d="M32 5l20 13-20 12-20-12z" fill="#f4f6f8" opacity="0.92" />
          <path d="M32 5l20 13-20 12-20-12z" fill="none" stroke="#c8ced6" />
          <g stroke="#d5dadf" strokeWidth="0.6" opacity="0.8">
            <path d="M22 11.5l20 13M42 11.5l-20 13M12 18h40" />
          </g>
          {header(24, 34, 3)}
        </>
      );
    case "rain":
      return (
        <>
          <rect x="8" y="8" width="30" height="20" rx="1.2" fill="#d4af37" />
          <g stroke="#6b5410" strokeWidth="0.8">
            {Array.from({ length: 9 }, (_, i) => (
              <path key={i} d={`M${10 + i * 3.2} 9v18`} />
            ))}
          </g>
          <rect x="42" y="14" width="16" height="12" rx="1" fill="#0f5d63" />
          <path d="M46 30l-2 5M52 30l-2 5" stroke="var(--cyan)" strokeWidth="1.5" strokeLinecap="round" />
        </>
      );
    case "sound":
      return (
        <>
          <rect x="4" y="14" width="34" height="17" rx="1.2" fill="#0f5d63" />
          <circle cx="47" cy="20" r="9" fill={metal} />
          <circle cx="47" cy="20" r="6.6" fill="#20262c" />
          <g fill="#5d666e">
            {[0, 1, 2].map((i) => (
              <circle key={i} cx={44 + i * 3} cy={20} r="0.9" />
            ))}
          </g>
          <rect x="8" y="18" width="9" height="8" rx="0.8" fill="#20262c" />
          {header(20, 32, 3)}
        </>
      );
    case "ir-obstacle":
      return (
        <>
          <rect x="4" y="12" width="34" height="19" rx="1.2" fill="#0d3c66" />
          <circle cx="46" cy="15" r="4" fill="#0b1220" stroke="#4a5259" />
          <circle cx="46" cy="26" r="4" fill="#2b1a1a" stroke="#7a3030" />
          <path d="M52 13q5 7 0 14" stroke="var(--danger)" strokeWidth="1.3" fill="none" opacity="0.8" />
          <rect x="8" y="17" width="9" height="8" rx="0.8" fill="#20262c" />
          {header(20, 32, 3)}
        </>
      );
    case "bmp280":
    case "mpu6050":
      return (
        <>
          <rect x="8" y="10" width="48" height="22" rx="1.4" fill="#0d4b6b" />
          <rect x="20" y="15" width="14" height="12" rx="1" fill="#15181c" />
          <text x="21" y="23" fontSize="3.6" fill="#8d99a4" fontFamily="monospace">
            {t === "bmp280" ? "BMP" : "MPU"}
          </text>
          <g fill="#c8ced6" opacity="0.6">
            {[0, 1, 2].map((i) => (
              <rect key={i} x={38 + i * 5} y="17" width="3.4" height="2.4" rx="0.4" />
            ))}
          </g>
          {header(22, 32, 4)}
        </>
      );
    case "rfid":
      return (
        <>
          <rect x="4" y="7" width="56" height="26" rx="1.4" fill="#0f6fa8" />
          <rect x="9" y="11" width="46" height="18" rx="2" fill="none" stroke="#d4af37" strokeWidth="1.6" />
          <rect x="13" y="15" width="38" height="10" rx="1.6" fill="none" stroke="#d4af37" strokeWidth="1.2" opacity="0.7" />
          <rect x="26" y="17" width="12" height="6" rx="0.8" fill="#15181c" />
          {header(22, 33, 4)}
        </>
      );
    case "gps":
      return (
        <>
          <rect x="4" y="9" width="56" height="24" rx="1.4" fill="#123c2b" />
          <rect x="10" y="12" width="24" height="18" rx="1" fill="#1a2a5e" />
          <path d="M22 14l0 14M14 21h16" stroke="#4a6bd0" strokeWidth="0.8" />
          <rect x="38" y="15" width="16" height="12" rx="1" fill="#15181c" />
          <text x="39.6" y="23" fontSize="3.6" fill="#8d99a4" fontFamily="monospace">
            NEO6
          </text>
          {header(20, 33, 4)}
        </>
      );
    case "acs712":
      return (
        <>
          <rect x="4" y="9" width="56" height="24" rx="1.4" fill="#0d4b6b" />
          <rect x="8" y="14" width="16" height="14" rx="1" fill="#15181c" />
          <g fill="#1b6f4a">
            <rect x="36" y="13" width="20" height="16" rx="1" />
          </g>
          {[0, 1].map((i) => (
            <rect key={i} x={39 + i * 9} y="15" width="6" height="12" rx="0.6" fill="#d4af37" />
          ))}
          <path d="M26 26l4-9 3 6 3-5" stroke="var(--cyan)" strokeWidth="1.4" fill="none" />
          {header(8, 33, 3)}
        </>
      );
    case "anemometer":
      return (
        <>
          <circle cx="32" cy="20" r="2.6" fill={metal} />
          <path d="M32 20l-12-6M32 20l13-4M32 20l-2 13" stroke="#8d99a4" strokeWidth="1.6" />
          {[
            [20, 14],
            [45, 16],
            [30, 33],
          ].map(([x = 0, y = 0]) => (
            <g key={`${x}-${y}`}>
              <circle cx={x} cy={y} r="4" fill="#f4f6f8" opacity="0.9" />
              <path d={`M${x} ${y - 4}a4 4 0 000 8z`} fill="#c8ced6" />
            </g>
          ))}
          <rect x="30" y="33" width="4" height="7" rx="1" fill="#5d666e" />
        </>
      );
    case "load-cell":
      return (
        <>
          <rect x="6" y="17" width="44" height="9" rx="1.4" fill={metal} />
          <rect x="6" y="17" width="44" height="9" rx="1.4" fill="none" stroke="#5d666e" />
          <circle cx="12" cy="21.5" r="1.6" fill="#20262c" />
          <circle cx="44" cy="21.5" r="1.6" fill="#20262c" />
          <rect x="22" y="12" width="12" height="5" rx="1" fill="#c8ced6" />
          <g strokeWidth="1.3">
            <path d="M50 19h8" stroke="#e06666" />
            <path d="M50 22h8" stroke="#111" />
            <path d="M50 25h8" stroke="#4a90d9" />
          </g>
        </>
      );
    case "dht11":
    case "dht22":
      return (
        <>
          <rect x="19" y="6" width="26" height="24" rx="1.4" fill={t === "dht22" ? "#f4f6f8" : "#4a90d9"} />
          <g fill="#20262c" opacity="0.85">
            {Array.from({ length: 4 }, (_, i) =>
              Array.from({ length: 3 }, (_, j) => (
                <rect key={`${i}-${j}`} x={22 + j * 7} y={9 + i * 5} width="4.4" height="2.6" rx="0.5" />
              )),
            )}
          </g>
          {legs([25, 30, 35, 40], 30, 39, 1.6)}
        </>
      );
    default:
      return (
        <>
          <rect x="8" y="11" width="48" height="20" rx="1.4" fill="#0d4b6b" />
          <rect x="20" y="15" width="16" height="12" rx="1" fill="#15181c" />
          <g fill="#c8ced6" opacity="0.6">
            {[0, 1, 2].map((i) => (
              <rect key={i} x={40 + i * 5} y="17" width="3.4" height="2.4" rx="0.4" />
            ))}
          </g>
          {header(22, 31, 4)}
        </>
      );
  }
}

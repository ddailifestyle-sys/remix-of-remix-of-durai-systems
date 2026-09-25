import type { PartDef } from "@/lib/circuit/parts";

/** Small illustrated thumbnail for each component in the library / canvas. */
export function PartIcon({ def, className = "h-10 w-14" }: { def: PartDef; className?: string }) {
  const c = def.color;
  return (
    <svg viewBox="0 0 64 44" className={className} role="img" aria-label={def.label}>
      <rect x="0.5" y="0.5" width="63" height="43" rx="6" fill="var(--surface-2, transparent)" stroke="var(--border)" />
      <g>{art(def, c)}</g>
    </svg>
  );
}

const dots = (y: number, n: number, fill: string) =>
  Array.from({ length: n }, (_, i) => (
    <circle key={i} cx={12 + i * (40 / Math.max(1, n - 1))} cy={y} r="1.4" fill={fill} />
  ));

function art(def: PartDef, c: string) {
  const t = def.type;

  if (def.hasCamera)
    return (
      <>
        <rect x="8" y="10" width="48" height="24" rx="3" fill={c} opacity="0.25" stroke={c} />
        <circle cx="32" cy="22" r="8" fill="var(--background)" stroke={c} strokeWidth="1.5" />
        <circle cx="32" cy="22" r="3.5" fill={c} />
        {dots(8, 10, c)}
      </>
    );

  if (def.isBoard)
    return (
      <>
        <rect x="5" y="9" width="54" height="26" rx="3" fill={c} opacity="0.25" stroke={c} />
        <rect x="12" y="16" width="16" height="12" rx="2" fill={c} opacity="0.7" />
        <rect x="34" y="17" width="18" height="6" rx="1" fill="var(--muted-foreground)" opacity="0.5" />
        {dots(7, 12, c)}
        {dots(37, 12, "var(--muted-foreground)")}
      </>
    );

  switch (t) {
    case "breadboard":
      return (
        <>
          <rect x="4" y="8" width="56" height="28" rx="3" fill="var(--muted-foreground)" opacity="0.18" stroke="var(--border)" />
          {dots(13, 12, "var(--danger)")}
          {dots(22, 12, "var(--muted-foreground)")}
          {dots(31, 12, "var(--blue, var(--cyan))")}
        </>
      );
    case "led":
    case "rgb-led":
      return (
        <>
          <circle cx="32" cy="18" r="9" fill={c} opacity="0.55" stroke={c} />
          <path d="M28 27v9M36 27v9" stroke="var(--muted-foreground)" strokeWidth="1.6" />
          <path d="M24 10l-4-4M40 10l4-4" stroke={c} strokeWidth="1.4" />
        </>
      );
    case "led-strip":
      return (
        <>
          <rect x="6" y="17" width="52" height="10" rx="2" fill="var(--surface-2)" stroke="var(--border)" />
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={10 + i * 10} y="19" width="6" height="6" rx="1" fill={i % 2 ? "var(--cyan)" : c} />
          ))}
        </>
      );
    case "buzzer":
      return (
        <>
          <circle cx="32" cy="21" r="11" fill={c} opacity="0.35" stroke={c} />
          <circle cx="32" cy="21" r="2.4" fill={c} />
          <path d="M28 34v5M36 34v5" stroke="var(--muted-foreground)" strokeWidth="1.6" />
        </>
      );
    case "push-button":
      return (
        <>
          <rect x="20" y="12" width="24" height="20" rx="3" fill="var(--surface-2)" stroke="var(--border)" />
          <circle cx="32" cy="22" r="6" fill={c} opacity="0.7" />
          <path d="M20 16h-8M44 16h8M20 28h-8M44 28h8" stroke="var(--muted-foreground)" strokeWidth="1.4" />
        </>
      );
    case "potentiometer":
      return (
        <>
          <circle cx="32" cy="20" r="10" fill={c} opacity="0.3" stroke={c} />
          <path d="M32 20l6-5" stroke={c} strokeWidth="2" strokeLinecap="round" />
          <path d="M26 33v5M32 33v5M38 33v5" stroke="var(--muted-foreground)" strokeWidth="1.5" />
        </>
      );
    case "servo":
      return (
        <>
          <rect x="14" y="14" width="26" height="18" rx="2" fill={c} opacity="0.35" stroke={c} />
          <circle cx="40" cy="20" r="6" fill={c} opacity="0.6" />
          <rect x="40" y="18" width="14" height="3" rx="1.5" fill="var(--foreground)" opacity="0.6" />
        </>
      );
    case "dc-motor":
    case "stepper":
      return (
        <>
          <rect x="12" y="12" width="30" height="20" rx="10" fill={c} opacity="0.3" stroke={c} />
          <circle cx="27" cy="22" r="5" fill={c} opacity="0.6" />
          <rect x="42" y="20" width="10" height="4" rx="2" fill="var(--muted-foreground)" />
        </>
      );
    case "solenoid":
      return (
        <>
          <rect x="16" y="10" width="18" height="14" rx="2" fill={c} opacity="0.4" stroke={c} />
          <path d="M12 30h40" stroke="var(--muted-foreground)" strokeWidth="4" strokeLinecap="round" />
          <path d="M25 24v6" stroke={c} strokeWidth="2" />
        </>
      );
    case "relay":
      return (
        <>
          <rect x="10" y="11" width="44" height="22" rx="2" fill={c} opacity="0.25" stroke={c} />
          <rect x="14" y="15" width="14" height="14" rx="1" fill={c} opacity="0.6" />
          <path d="M34 26l8-8" stroke="var(--foreground)" strokeWidth="1.6" />
          <circle cx="34" cy="26" r="1.6" fill="var(--foreground)" />
        </>
      );
    case "lcd-i2c":
    case "oled":
      return (
        <>
          <rect x="7" y="10" width="50" height="24" rx="2" fill={c} opacity="0.25" stroke={c} />
          <rect x="12" y="15" width="40" height="14" rx="1" fill="var(--background)" />
          <path d="M16 20h20M16 25h28" stroke={c} strokeWidth="1.6" />
        </>
      );
    case "ultrasonic":
      return (
        <>
          <rect x="8" y="11" width="48" height="22" rx="3" fill={c} opacity="0.2" stroke={c} />
          <circle cx="22" cy="22" r="7" fill="var(--background)" stroke={c} strokeWidth="1.6" />
          <circle cx="42" cy="22" r="7" fill="var(--background)" stroke={c} strokeWidth="1.6" />
        </>
      );
    case "soil-moisture":
    case "ph-sensor":
    case "tds":
    case "water-level":
      return (
        <>
          <rect x="26" y="6" width="12" height="20" rx="2" fill={c} opacity="0.4" stroke={c} />
          <path d="M30 26v10M34 26v10" stroke={c} strokeWidth="2" />
          <path d="M8 34c6-4 10 4 16 0s10 4 16 0 10 4 16 0" stroke="var(--cyan)" strokeWidth="1.6" fill="none" />
        </>
      );
    case "flame":
      return (
        <path
          d="M32 6c6 8 10 10 10 17a10 10 0 11-20 0c0-4 3-6 5-9 1 3 3 4 3 6 2-3 2-9 2-14z"
          fill={c}
          opacity="0.6"
          stroke={c}
        />
      );
    case "gas":
    case "co2":
      return (
        <>
          <circle cx="32" cy="21" r="11" fill={c} opacity="0.25" stroke={c} />
          <path d="M24 18h16M24 22h16M24 26h10" stroke={c} strokeWidth="1.6" />
        </>
      );
    case "dht11":
    case "dht22":
      return (
        <>
          <rect x="20" y="8" width="24" height="24" rx="3" fill={c} opacity="0.3" stroke={c} />
          {[0, 1, 2, 3].map((i) => (
            <circle key={i} cx={26 + (i % 2) * 12} cy={15 + Math.floor(i / 2) * 10} r="2" fill={c} />
          ))}
          <path d="M26 32v6M32 32v6M38 32v6" stroke="var(--muted-foreground)" strokeWidth="1.5" />
        </>
      );
    case "ldr":
    case "uv-sensor":
      return (
        <>
          <circle cx="32" cy="20" r="10" fill={c} opacity="0.3" stroke={c} />
          <path d="M26 20q3-5 6 0t6 0" stroke={c} strokeWidth="1.8" fill="none" />
          <path d="M32 4v4M18 8l3 3M46 8l-3 3" stroke={c} strokeWidth="1.5" />
        </>
      );
    case "pir":
      return (
        <>
          <path d="M32 8l18 12-18 12-18-12z" fill={c} opacity="0.3" stroke={c} />
          <circle cx="32" cy="20" r="5" fill={c} opacity="0.7" />
        </>
      );
    case "rain":
      return (
        <>
          <path d="M18 20a8 8 0 0116 0h4a6 6 0 010 12H18a6 6 0 010-12z" fill={c} opacity="0.3" stroke={c} />
          <path d="M22 36l-2 4M32 36l-2 4M42 36l-2 4" stroke="var(--cyan)" strokeWidth="1.6" />
        </>
      );
    case "sound":
      return (
        <>
          <rect x="26" y="8" width="12" height="18" rx="6" fill={c} opacity="0.4" stroke={c} />
          <path d="M22 22a10 10 0 0020 0" stroke={c} strokeWidth="1.6" fill="none" />
          <path d="M32 32v6" stroke="var(--muted-foreground)" strokeWidth="1.6" />
        </>
      );
    case "ir-obstacle":
      return (
        <>
          <rect x="12" y="14" width="20" height="16" rx="2" fill={c} opacity="0.3" stroke={c} />
          <path d="M36 16q6 6 0 12M42 13q9 9 0 18" stroke={c} strokeWidth="1.6" fill="none" />
        </>
      );
    case "bmp280":
    case "mpu6050":
    case "rfid":
    case "gps":
      return (
        <>
          <rect x="12" y="11" width="40" height="22" rx="2" fill={c} opacity="0.25" stroke={c} />
          <rect x="20" y="16" width="14" height="12" rx="1" fill={c} opacity="0.6" />
          <path d="M38 18h10M38 22h10M38 26h6" stroke="var(--muted-foreground)" strokeWidth="1.4" />
        </>
      );
    case "acs712":
      return (
        <>
          <rect x="12" y="12" width="40" height="20" rx="2" fill={c} opacity="0.25" stroke={c} />
          <path d="M22 27l8-12 4 8 8-6" stroke={c} strokeWidth="2" fill="none" />
        </>
      );
    case "anemometer":
      return (
        <>
          <circle cx="32" cy="20" r="3" fill={c} />
          <path d="M32 20l-12-6M32 20l14-4M32 20l-2 14" stroke={c} strokeWidth="1.8" />
          <circle cx="20" cy="14" r="3.5" fill={c} opacity="0.6" />
          <circle cx="46" cy="16" r="3.5" fill={c} opacity="0.6" />
          <circle cx="30" cy="34" r="3.5" fill={c} opacity="0.6" />
        </>
      );
    case "load-cell":
      return (
        <>
          <rect x="10" y="18" width="44" height="8" rx="2" fill={c} opacity="0.4" stroke={c} />
          <path d="M16 18v-6h32v6" stroke={c} strokeWidth="1.6" fill="none" />
          <path d="M14 26v6M50 26v6" stroke="var(--muted-foreground)" strokeWidth="1.6" />
        </>
      );
    default:
      return (
        <>
          <rect x="12" y="12" width="40" height="20" rx="3" fill={c} opacity="0.3" stroke={c} />
          <path d="M20 22h24" stroke={c} strokeWidth="2" />
        </>
      );
  }
}

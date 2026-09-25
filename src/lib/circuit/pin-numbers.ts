/*
 * Sketch-facing pin numbers per board.
 *
 * Real Arduino cores number pins differently per board: on an ESP32 `A0` is
 * GPIO36, on a Mega `A0` is 54, on a Pico `A0` is GP26. The simulator and the
 * sketch generator both use this single table so `analogRead(36)`,
 * `analogRead(A0)` and the wire on the canvas all refer to the same pin.
 */
import { partByType } from "./parts";

export type BoardPinNumbers = {
  /** board pin id (D4, A0, SDA…) → number a sketch uses for it */
  byId: Map<string, number>;
  /** number → silkscreen label, used in serial/io logs */
  labels: Map<number, string>;
  /** board-specific constants such as A0..A15 */
  consts: Record<string, number>;
  /** full-scale analogRead() value: 4095 on ESP32 (12-bit), 1023 elsewhere */
  adcMax: number;
};

const analogBase = (boardType: string) =>
  boardType === "arduino-mega" ? 54 : boardType === "esp8266" ? 17 : 14;

export function boardPinNumbers(boardType: string | undefined): BoardPinNumbers {
  const def = boardType ? partByType(boardType) : undefined;
  const byId = new Map<string, number>();
  const labels = new Map<number, string>();
  const consts: Record<string, number> = {};
  const type = def?.type ?? "arduino-uno";
  const pins = def?.pins ?? partByType("arduino-uno")?.pins ?? [];

  // first pass: D/A pins
  for (const p of pins) {
    const gpio = /\bGP(?:IO)?(\d+)/i.exec(p.label);
    let num: number | undefined;
    if (gpio) num = Number(gpio[1]);
    else if (/^D\d+$/.test(p.id)) num = Number(p.id.slice(1));
    else if (/^A\d+$/.test(p.id)) num = analogBase(type) + Number(p.id.slice(1));
    if (num === undefined) continue;
    byId.set(p.id, num);
    if (!labels.has(num) || /^A\d+$/.test(p.id)) labels.set(num, p.label);
    if (/^A\d+$/.test(p.id)) consts[p.id] = num;
  }
  // second pass: I2C pins that alias a D/A pin ("SDA (A4)", "SDA (D20)")
  for (const p of pins) {
    if (byId.has(p.id)) continue;
    const alias = /\((A\d+|D\d+)\)/.exec(p.label)?.[1];
    const n = alias ? byId.get(alias) : undefined;
    if (n !== undefined) byId.set(p.id, n);
  }
  // Uno-style A4/A5 constants must exist even if the board lacks them
  for (let i = 0; i < 6; i++) if (!(`A${i}` in consts)) consts[`A${i}`] = analogBase(type) + i;
  const adcMax = type.startsWith("esp32") ? 4095 : 1023;
  return { byId, labels, consts, adcMax };
}

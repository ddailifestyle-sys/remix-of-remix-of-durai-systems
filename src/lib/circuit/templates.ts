/* Ready-made reference circuits used by the builder's "load demo" actions. */
import { createNode, newId, type Circuit, type CircuitNode, type PinAddr } from "./model";
import { partByType } from "./parts";

const place = (type: string, x: number, y: number): CircuitNode => {
  const def = partByType(type);
  if (!def) throw new Error(`Unknown part: ${type}`);
  return createNode(def, x, y);
};

const RED = "#ef4444";
const BLACK = "#94a3b8";
const CYAN = "#22d3ee";
const GREEN = "#22c55e";
const YELLOW = "#eab308";
const VIOLET = "#a855f7";

const wire = (from: PinAddr, to: PinAddr, color: string) => ({ id: newId("wire"), from, to, color });

export const GARDEN_SKETCH = `#include <Arduino.h>
#include <DHT.h>
#include <Wire.h>
#include <Adafruit_SSD1306.h>

// ESP32 garden controller: DHT22, soil moisture, LDR, relay pump and I2C OLED.
const int DHT_PIN = 4;       // GPIO4
const int SOIL_PIN = 36;     // GPIO36 / ADC1_CH0 (A0)
const int LDR_PIN = 39;      // GPIO39 / ADC1_CH3 (A1)
const int RELAY_PIN = 5;     // GPIO5
const int DRY_LIMIT = 35;    // water below 35 % soil moisture

DHT dht(DHT_PIN, DHT22);
Adafruit_SSD1306 display(128, 64);   // SDA GPIO21 · SCL GPIO22

void setup() {
  Serial.begin(115200);
  dht.begin();
  display.begin();
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW);
  Serial.println("ESP32 garden controller ready");
}

void loop() {
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();
  int soil = map(analogRead(SOIL_PIN), 0, 4095, 0, 100);   // 12-bit ADC
  int light = map(analogRead(LDR_PIN), 0, 4095, 0, 100);

  Serial.print("DHT22 temperature = "); Serial.println(temp);
  Serial.print("DHT22 humidity = "); Serial.println(hum);
  Serial.print("Soil Moisture Sensor = "); Serial.println(soil);
  Serial.print("LDR Light Sensor = "); Serial.println(light);

  bool dry = soil < DRY_LIMIT;
  digitalWrite(RELAY_PIN, dry ? HIGH : LOW);
  Serial.println(dry ? "Relay = ON (watering)" : "Relay = OFF");

  display.clearDisplay();
  display.setCursor(0, 0);
  display.print("T: "); display.println(temp);
  display.print("H: "); display.println(hum);
  display.print("Soil: "); display.println(soil);
  display.print("Light: "); display.println(light);
  display.display();

  delay(1000);
}
`;

/** The named garden fixture replaces the old generic ESP32 demo. */
export const ESP32_DEMO_SKETCH = GARDEN_SKETCH;

/**
 * A complete ESP32 node: dev board, breadboard power rails, three sensors,
 * an I2C display and a relay-driven pump — wired so board verification passes.
 */
export function gardenCircuit(): { circuit: Circuit; code: string; name: string } {
  const board = place("esp32-devkit", 400, 340);
  const bb = place("breadboard", 400, 80);
  const dht = place("dht22", 70, 70);
  const soil = place("soil-moisture", 50, 250);
  const ldr = place("ldr", 60, 430);
  const oled = place("oled", 790, 80);
  const relay = place("relay", 790, 300);

  const nodes = [board, bb, dht, soil, ldr, oled, relay];

  const railPlus = { node: bb.id, pin: "RAIL+" };
  const railMinus = { node: bb.id, pin: "RAIL-" };

  const wires = [
    // power rails fed from the board
    wire({ node: board.id, pin: "3V3" }, railPlus, RED),
    wire({ node: board.id, pin: "GND" }, railMinus, BLACK),
    // module supplies
    wire({ node: dht.id, pin: "VCC" }, railPlus, RED),
    wire({ node: dht.id, pin: "GND" }, railMinus, BLACK),
    wire({ node: soil.id, pin: "VCC" }, railPlus, RED),
    wire({ node: soil.id, pin: "GND" }, railMinus, BLACK),
    wire({ node: ldr.id, pin: "VCC" }, railPlus, RED),
    wire({ node: ldr.id, pin: "GND" }, railMinus, BLACK),
    wire({ node: oled.id, pin: "VCC" }, railPlus, RED),
    wire({ node: oled.id, pin: "GND" }, railMinus, BLACK),
    wire({ node: relay.id, pin: "VCC" }, railPlus, RED),
    wire({ node: relay.id, pin: "GND" }, railMinus, BLACK),
    // signals
    wire({ node: dht.id, pin: "DATA" }, { node: board.id, pin: "D4" }, CYAN),
    wire({ node: soil.id, pin: "AOUT" }, { node: board.id, pin: "A0" }, GREEN),
    wire({ node: ldr.id, pin: "AOUT" }, { node: board.id, pin: "A1" }, YELLOW),
    wire({ node: relay.id, pin: "IN" }, { node: board.id, pin: "D5" }, VIOLET),
    wire({ node: oled.id, pin: "SDA" }, { node: board.id, pin: "SDA" }, YELLOW),
    wire({ node: oled.id, pin: "SCL" }, { node: board.id, pin: "SCL" }, VIOLET),
  ];

  return { circuit: { nodes, wires }, code: GARDEN_SKETCH, name: "ESP32 real garden circuit" };
}

export const esp32DemoCircuit = gardenCircuit;

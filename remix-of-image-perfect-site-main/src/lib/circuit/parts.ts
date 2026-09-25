/* Component catalog for the circuit builder. */

export type PinKind = "power" | "ground" | "digital" | "analog" | "pwm" | "i2c" | "passive";

export type PartPin = {
  id: string;
  label: string;
  kind: PinKind;
  /** pin must be wired for the part to work */
  required?: boolean;
  /** side of the body the pin sits on */
  side: "top" | "bottom" | "left" | "right";
};

export type PartProp = {
  key: string;
  label: string;
  type: "number" | "text" | "select";
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  default: string | number;
};

export type SensorChannel =
  | "waterLevel"
  | "temperature"
  | "humidity"
  | "soilMoisture"
  | "light"
  | "gas"
  | "flame"
  | "smoke"
  | "weight"
  | "wind"
  | "motion"
  | "rain"
  | "sound"
  | "pressure"
  | "co2"
  | "ph"
  | "tds"
  | "current"
  | "vibration"
  | "uv"
  | "distance";

export type PartDef = {
  type: string;
  label: string;
  category: "Board" | "Prototyping" | "Output" | "Input" | "Sensor" | "Actuator";
  color: string;
  width: number;
  height: number;
  pins: PartPin[];
  props?: PartProp[];
  /** sensor parts expose one live channel */
  channel?: SensorChannel;
  isBoard?: boolean;
  /** board exposes a camera peripheral (uses the device webcam in simulation) */
  hasCamera?: boolean;
  description: string;
};

const p = (
  id: string,
  label: string,
  kind: PinKind,
  side: PartPin["side"],
  required = false,
): PartPin => ({ id, label, kind, side, required });

const UNO_PINS: PartPin[] = [
  p("5V", "5V", "power", "bottom"),
  p("3V3", "3.3V", "power", "bottom"),
  p("VIN", "VIN", "power", "bottom"),
  p("GND", "GND", "ground", "bottom"),
  p("GND2", "GND", "ground", "bottom"),
  ...Array.from({ length: 14 }, (_, i) =>
    p(`D${i}`, `D${i}`, [3, 5, 6, 9, 10, 11].includes(i) ? "pwm" : "digital", "top"),
  ),
  ...Array.from({ length: 6 }, (_, i) => p(`A${i}`, `A${i}`, "analog", "bottom")),
  p("SDA", "SDA", "i2c", "top"),
  p("SCL", "SCL", "i2c", "top"),
];

const mcuPins = (digital: number, analog: number): PartPin[] => [
  p("3V3", "3.3V", "power", "bottom"),
  p("5V", "5V", "power", "bottom"),
  p("GND", "GND", "ground", "bottom"),
  p("GND2", "GND", "ground", "bottom"),
  ...Array.from({ length: digital }, (_, i) => p(`D${i}`, `D${i}`, "pwm", "top")),
  ...Array.from({ length: analog }, (_, i) => p(`A${i}`, `A${i}`, "analog", "bottom")),
  p("SDA", "SDA", "i2c", "top"),
  p("SCL", "SCL", "i2c", "top"),
];

export const PARTS: PartDef[] = [
  {
    type: "arduino-uno",
    label: "Arduino UNO",
    category: "Board",
    color: "var(--blue)",
    width: 300,
    height: 150,
    isBoard: true,
    pins: UNO_PINS,
    description: "ATmega328P microcontroller board — the brain of the circuit.",
  },
  {
    type: "breadboard",
    label: "Breadboard",
    category: "Prototyping",
    color: "var(--muted-foreground)",
    width: 300,
    height: 110,
    pins: [
      p("RAIL+", "+ rail", "power", "top"),
      p("RAIL-", "- rail", "ground", "top"),
      ...Array.from({ length: 8 }, (_, i) => p(`R${i + 1}`, `${i + 1}`, "passive", "bottom")),
    ],
    description: "Solderless prototyping board with power rails and tie points.",
  },
  {
    type: "led",
    label: "LED",
    category: "Output",
    color: "var(--danger)",
    width: 120,
    height: 76,
    pins: [p("A", "Anode +", "digital", "top", true), p("K", "Cathode -", "ground", "bottom", true)],
    props: [
      { key: "color", label: "Colour", type: "select", options: ["Red", "Green", "Blue", "Yellow", "White"], default: "Red" },
      { key: "resistor", label: "Series resistor (Ω)", type: "number", min: 100, max: 1000, step: 10, default: 220 },
    ],
    description: "Single colour indicator LED with series resistor.",
  },
  {
    type: "rgb-led",
    label: "RGB LED",
    category: "Output",
    color: "var(--violet)",
    width: 150,
    height: 84,
    pins: [
      p("R", "R", "pwm", "top", true),
      p("G", "G", "pwm", "top", true),
      p("B", "B", "pwm", "top", true),
      p("K", "Common -", "ground", "bottom", true),
    ],
    props: [{ key: "common", label: "Common", type: "select", options: ["Cathode", "Anode"], default: "Cathode" }],
    description: "Three-channel LED driven with PWM for mixed colours.",
  },
  {
    type: "buzzer",
    label: "Buzzer",
    category: "Output",
    color: "var(--warning)",
    width: 130,
    height: 80,
    pins: [p("SIG", "SIG", "digital", "top", true), p("GND", "GND", "ground", "bottom", true)],
    props: [{ key: "kind", label: "Type", type: "select", options: ["Active", "Passive"], default: "Active" }],
    description: "Piezo buzzer for audible alerts.",
  },
  {
    type: "push-button",
    label: "Push Button",
    category: "Input",
    color: "var(--foreground)",
    width: 130,
    height: 80,
    pins: [p("OUT", "OUT", "digital", "top", true), p("GND", "GND", "ground", "bottom", true)],
    props: [{ key: "mode", label: "Wiring", type: "select", options: ["Pull-up", "Pull-down"], default: "Pull-up" }],
    description: "Momentary tactile switch.",
  },
  {
    type: "potentiometer",
    label: "Potentiometer",
    category: "Input",
    color: "var(--cyan)",
    width: 150,
    height: 86,
    pins: [
      p("VCC", "VCC", "power", "top", true),
      p("SIG", "SIG", "analog", "top", true),
      p("GND", "GND", "ground", "bottom", true),
    ],
    props: [{ key: "value", label: "Knob position (%)", type: "number", min: 0, max: 100, step: 1, default: 50 }],
    description: "10 kΩ rotary potentiometer producing an analog voltage.",
  },
  {
    type: "servo",
    label: "Servo Motor",
    category: "Actuator",
    color: "var(--success)",
    width: 150,
    height: 86,
    pins: [
      p("VCC", "VCC", "power", "top", true),
      p("SIG", "PWM", "pwm", "top", true),
      p("GND", "GND", "ground", "bottom", true),
    ],
    props: [{ key: "range", label: "Max angle (°)", type: "number", min: 90, max: 360, step: 10, default: 180 }],
    description: "SG90 hobby servo positioned by a PWM signal.",
  },
  {
    type: "dc-motor",
    label: "DC Motor / Pump",
    category: "Actuator",
    color: "var(--blue)",
    width: 160,
    height: 86,
    pins: [p("V+", "V+", "power", "top", true), p("V-", "V-", "ground", "bottom", true)],
    props: [{ key: "role", label: "Role", type: "select", options: ["Water Pump", "Fan", "Motor"], default: "Water Pump" }],
    description: "DC motor / water pump driven through a relay or driver.",
  },
  {
    type: "relay",
    label: "Relay Module",
    category: "Actuator",
    color: "var(--warning)",
    width: 170,
    height: 96,
    pins: [
      p("VCC", "VCC", "power", "top", true),
      p("IN", "IN", "digital", "top", true),
      p("GND", "GND", "ground", "bottom", true),
      p("COM", "COM", "passive", "bottom"),
      p("NO", "NO", "passive", "bottom"),
      p("NC", "NC", "passive", "bottom"),
    ],
    props: [{ key: "active", label: "Trigger", type: "select", options: ["Active HIGH", "Active LOW"], default: "Active HIGH" }],
    description: "Single channel relay switching a mains/DC load.",
  },
  {
    type: "lcd-i2c",
    label: "LCD 16x2 I2C",
    category: "Output",
    color: "var(--success)",
    width: 210,
    height: 104,
    pins: [
      p("VCC", "VCC", "power", "top", true),
      p("SDA", "SDA", "i2c", "top", true),
      p("SCL", "SCL", "i2c", "top", true),
      p("GND", "GND", "ground", "bottom", true),
    ],
    props: [{ key: "address", label: "I2C address", type: "text", default: "0x27" }],
    description: "16x2 character LCD on an I2C backpack.",
  },
  {
    type: "oled",
    label: "OLED 128x64",
    category: "Output",
    color: "var(--cyan)",
    width: 180,
    height: 100,
    pins: [
      p("VCC", "VCC", "power", "top", true),
      p("SDA", "SDA", "i2c", "top", true),
      p("SCL", "SCL", "i2c", "top", true),
      p("GND", "GND", "ground", "bottom", true),
    ],
    props: [{ key: "address", label: "I2C address", type: "text", default: "0x3C" }],
    description: "SSD1306 monochrome OLED display.",
  },
  {
    type: "dht11",
    label: "DHT11",
    category: "Sensor",
    color: "var(--cyan)",
    width: 150,
    height: 90,
    channel: "temperature",
    pins: [
      p("VCC", "VCC", "power", "top", true),
      p("DATA", "DATA", "digital", "top", true),
      p("GND", "GND", "ground", "bottom", true),
    ],
    description: "Basic temperature and humidity sensor (±2 °C).",
  },
  {
    type: "dht22",
    label: "DHT22",
    category: "Sensor",
    color: "var(--cyan)",
    width: 150,
    height: 90,
    channel: "temperature",
    pins: [
      p("VCC", "VCC", "power", "top", true),
      p("DATA", "DATA", "digital", "top", true),
      p("GND", "GND", "ground", "bottom", true),
    ],
    description: "High accuracy temperature and humidity sensor.",
  },
  {
    type: "ultrasonic",
    label: "Ultrasonic HC-SR04",
    category: "Sensor",
    color: "var(--violet)",
    width: 190,
    height: 96,
    channel: "waterLevel",
    pins: [
      p("VCC", "VCC", "power", "top", true),
      p("TRIG", "TRIG", "digital", "top", true),
      p("ECHO", "ECHO", "digital", "top", true),
      p("GND", "GND", "ground", "bottom", true),
    ],
    props: [{ key: "tankHeight", label: "Tank height (cm)", type: "number", min: 10, max: 400, step: 5, default: 100 }],
    description: "Distance sensor used here to measure tank water level.",
  },
  {
    type: "ldr",
    label: "LDR Light Sensor",
    category: "Sensor",
    color: "var(--warning)",
    width: 160,
    height: 90,
    channel: "light",
    pins: [
      p("VCC", "VCC", "power", "top", true),
      p("AOUT", "AOUT", "analog", "top", true),
      p("GND", "GND", "ground", "bottom", true),
    ],
    description: "Light dependent resistor module (analog).",
  },
  {
    type: "soil-moisture",
    label: "Soil Moisture Sensor",
    category: "Sensor",
    color: "var(--success)",
    width: 190,
    height: 96,
    channel: "soilMoisture",
    pins: [
      p("VCC", "VCC", "power", "top", true),
      p("AOUT", "AOUT", "analog", "top", true),
      p("DOUT", "DOUT", "digital", "top"),
      p("GND", "GND", "ground", "bottom", true),
    ],
    description: "Capacitive soil moisture probe.",
  },
  {
    type: "flame",
    label: "Flame Sensor",
    category: "Sensor",
    color: "var(--danger)",
    width: 170,
    height: 96,
    channel: "flame",
    pins: [
      p("VCC", "VCC", "power", "top", true),
      p("AOUT", "AOUT", "analog", "top", true),
      p("DOUT", "DOUT", "digital", "top"),
      p("GND", "GND", "ground", "bottom", true),
    ],
    description: "IR flame detector for fire detection projects.",
  },
  {
    type: "gas",
    label: "Gas Sensor (MQ-2)",
    category: "Sensor",
    color: "var(--warning)",
    width: 180,
    height: 96,
    channel: "gas",
    pins: [
      p("VCC", "VCC", "power", "top", true),
      p("AOUT", "AOUT", "analog", "top", true),
      p("DOUT", "DOUT", "digital", "top"),
      p("GND", "GND", "ground", "bottom", true),
    ],
    props: [{ key: "model", label: "Model", type: "select", options: ["MQ-2", "MQ-135", "MQ-7"], default: "MQ-2" }],
    description: "Gas / smoke sensor producing an analog concentration signal.",
  },
  {
    type: "water-level",
    label: "Water Level Sensor",
    category: "Sensor",
    color: "var(--blue)",
    width: 190,
    height: 96,
    channel: "waterLevel",
    pins: [
      p("VCC", "VCC", "power", "top", true),
      p("AOUT", "AOUT", "analog", "top", true),
      p("GND", "GND", "ground", "bottom", true),
    ],
    description: "Resistive water level strip (analog).",
  },
  {
    type: "load-cell",
    label: "Load Cell (HX711)",
    category: "Sensor",
    color: "var(--violet)",
    width: 190,
    height: 96,
    channel: "weight",
    pins: [
      p("VCC", "VCC", "power", "top", true),
      p("DT", "DT", "digital", "top", true),
      p("SCK", "SCK", "digital", "top", true),
      p("GND", "GND", "ground", "bottom", true),
    ],
    props: [{ key: "capacity", label: "Capacity (g)", type: "number", min: 100, max: 20000, step: 100, default: 10000 }],
    description: "Weight sensor with HX711 24-bit amplifier.",
  },

  /* ------------------------------ more boards ----------------------------- */
  {
    type: "esp32-devkit",
    label: "ESP32 Dev Module",
    category: "Board",
    color: "var(--violet)",
    width: 280,
    height: 150,
    isBoard: true,
    pins: mcuPins(20, 6),
    description: "ESP32 WROOM-32 dev board with Wi-Fi, Bluetooth and 20 GPIO.",
  },
  {
    type: "esp32-s3-cam",
    label: "ESP32-S3 Camera",
    category: "Board",
    color: "var(--cyan)",
    width: 280,
    height: 150,
    isBoard: true,
    hasCamera: true,
    pins: mcuPins(16, 4),
    props: [
      { key: "resolution", label: "Frame size", type: "select", options: ["QVGA 320x240", "VGA 640x480", "HD 1280x720"], default: "VGA 640x480" },
      { key: "facing", label: "Camera", type: "select", options: ["Front", "Rear"], default: "Front" },
    ],
    description: "ESP32-S3 board with OV2640 camera — streams the live device camera during simulation.",
  },
  {
    type: "esp8266",
    label: "NodeMCU ESP8266",
    category: "Board",
    color: "var(--success)",
    width: 260,
    height: 140,
    isBoard: true,
    pins: mcuPins(10, 1),
    description: "Low cost Wi-Fi microcontroller board for IoT nodes.",
  },
  {
    type: "arduino-nano",
    label: "Arduino Nano",
    category: "Board",
    color: "var(--blue)",
    width: 230,
    height: 130,
    isBoard: true,
    pins: mcuPins(14, 6),
    description: "Compact ATmega328P board with the same pin map as the UNO.",
  },
  {
    type: "arduino-mega",
    label: "Arduino Mega 2560",
    category: "Board",
    color: "var(--blue)",
    width: 330,
    height: 160,
    isBoard: true,
    pins: mcuPins(24, 6),
    description: "ATmega2560 board with many IO pins for larger builds.",
  },
  {
    type: "rpi-pico",
    label: "Raspberry Pi Pico W",
    category: "Board",
    color: "var(--danger)",
    width: 250,
    height: 140,
    isBoard: true,
    pins: mcuPins(20, 3),
    description: "RP2040 board with Wi-Fi, programmed here with an Arduino-style sketch.",
  },

  /* ------------------------------ more sensors ---------------------------- */
  {
    type: "pir",
    label: "PIR Motion Sensor",
    category: "Sensor",
    color: "var(--warning)",
    width: 180,
    height: 96,
    channel: "motion",
    pins: [
      p("VCC", "VCC", "power", "top", true),
      p("OUT", "OUT", "digital", "top", true),
      p("GND", "GND", "ground", "bottom", true),
    ],
    description: "HC-SR501 passive infrared motion detector.",
  },
  {
    type: "rain",
    label: "Rain Sensor",
    category: "Sensor",
    color: "var(--blue)",
    width: 180,
    height: 96,
    channel: "rain",
    pins: [
      p("VCC", "VCC", "power", "top", true),
      p("AOUT", "AOUT", "analog", "top", true),
      p("DOUT", "DOUT", "digital", "top"),
      p("GND", "GND", "ground", "bottom", true),
    ],
    description: "Raindrop detection board for weather stations.",
  },
  {
    type: "sound",
    label: "Sound Sensor (KY-038)",
    category: "Sensor",
    color: "var(--violet)",
    width: 190,
    height: 96,
    channel: "sound",
    pins: [
      p("VCC", "VCC", "power", "top", true),
      p("AOUT", "AOUT", "analog", "top", true),
      p("GND", "GND", "ground", "bottom", true),
    ],
    description: "Microphone module measuring ambient noise level.",
  },
  {
    type: "ir-obstacle",
    label: "IR Obstacle Sensor",
    category: "Sensor",
    color: "var(--danger)",
    width: 180,
    height: 96,
    channel: "distance",
    pins: [
      p("VCC", "VCC", "power", "top", true),
      p("OUT", "OUT", "digital", "top", true),
      p("GND", "GND", "ground", "bottom", true),
    ],
    description: "Reflective IR proximity switch for obstacle detection.",
  },
  {
    type: "bmp280",
    label: "BMP280 Pressure",
    category: "Sensor",
    color: "var(--cyan)",
    width: 180,
    height: 96,
    channel: "pressure",
    pins: [
      p("VCC", "VCC", "power", "top", true),
      p("SDA", "SDA", "i2c", "top", true),
      p("SCL", "SCL", "i2c", "top", true),
      p("GND", "GND", "ground", "bottom", true),
    ],
    description: "Barometric pressure and altitude sensor on I2C.",
  },
  {
    type: "mpu6050",
    label: "MPU6050 IMU",
    category: "Sensor",
    color: "var(--violet)",
    width: 180,
    height: 96,
    channel: "vibration",
    pins: [
      p("VCC", "VCC", "power", "top", true),
      p("SDA", "SDA", "i2c", "top", true),
      p("SCL", "SCL", "i2c", "top", true),
      p("GND", "GND", "ground", "bottom", true),
    ],
    description: "6-axis accelerometer + gyroscope, used here for vibration.",
  },
  {
    type: "co2",
    label: "CO₂ Sensor (MH-Z19)",
    category: "Sensor",
    color: "var(--success)",
    width: 190,
    height: 96,
    channel: "co2",
    pins: [
      p("VCC", "VCC", "power", "top", true),
      p("AOUT", "AOUT", "analog", "top", true),
      p("GND", "GND", "ground", "bottom", true),
    ],
    description: "NDIR carbon dioxide sensor for air quality projects.",
  },
  {
    type: "ph-sensor",
    label: "pH Sensor",
    category: "Sensor",
    color: "var(--warning)",
    width: 180,
    height: 96,
    channel: "ph",
    pins: [
      p("VCC", "VCC", "power", "top", true),
      p("AOUT", "AOUT", "analog", "top", true),
      p("GND", "GND", "ground", "bottom", true),
    ],
    description: "Analog pH probe for water quality monitoring.",
  },
  {
    type: "tds",
    label: "TDS Sensor",
    category: "Sensor",
    color: "var(--blue)",
    width: 180,
    height: 96,
    channel: "tds",
    pins: [
      p("VCC", "VCC", "power", "top", true),
      p("AOUT", "AOUT", "analog", "top", true),
      p("GND", "GND", "ground", "bottom", true),
    ],
    description: "Total dissolved solids probe for water purity.",
  },
  {
    type: "acs712",
    label: "ACS712 Current Sensor",
    category: "Sensor",
    color: "var(--danger)",
    width: 200,
    height: 96,
    channel: "current",
    pins: [
      p("VCC", "VCC", "power", "top", true),
      p("AOUT", "AOUT", "analog", "top", true),
      p("GND", "GND", "ground", "bottom", true),
    ],
    description: "Hall-effect current sensor for energy monitoring.",
  },
  {
    type: "uv-sensor",
    label: "UV Sensor (ML8511)",
    category: "Sensor",
    color: "var(--violet)",
    width: 180,
    height: 96,
    channel: "uv",
    pins: [
      p("VCC", "VCC", "power", "top", true),
      p("AOUT", "AOUT", "analog", "top", true),
      p("GND", "GND", "ground", "bottom", true),
    ],
    description: "Ultraviolet light intensity sensor.",
  },
  {
    type: "anemometer",
    label: "Anemometer",
    category: "Sensor",
    color: "var(--cyan)",
    width: 190,
    height: 96,
    channel: "wind",
    pins: [
      p("VCC", "VCC", "power", "top", true),
      p("AOUT", "AOUT", "analog", "top", true),
      p("GND", "GND", "ground", "bottom", true),
    ],
    description: "Cup anemometer producing an analog wind speed signal.",
  },
  {
    type: "rfid",
    label: "RFID RC522",
    category: "Sensor",
    color: "var(--warning)",
    width: 200,
    height: 100,
    pins: [
      p("VCC", "3.3V", "power", "top", true),
      p("SDA", "SDA", "i2c", "top", true),
      p("SCL", "SCK", "i2c", "top", true),
      p("GND", "GND", "ground", "bottom", true),
    ],
    description: "13.56 MHz RFID reader for access control projects.",
  },
  {
    type: "gps",
    label: "GPS NEO-6M",
    category: "Sensor",
    color: "var(--success)",
    width: 200,
    height: 100,
    pins: [
      p("VCC", "VCC", "power", "top", true),
      p("TX", "TX", "digital", "top", true),
      p("RX", "RX", "digital", "top"),
      p("GND", "GND", "ground", "bottom", true),
    ],
    description: "GPS receiver module streaming NMEA position data.",
  },

  /* ---------------------------- more actuators ---------------------------- */
  {
    type: "stepper",
    label: "Stepper Motor 28BYJ-48",
    category: "Actuator",
    color: "var(--blue)",
    width: 200,
    height: 96,
    pins: [
      p("VCC", "VCC", "power", "top", true),
      p("IN1", "IN1", "digital", "top", true),
      p("IN2", "IN2", "digital", "top", true),
      p("GND", "GND", "ground", "bottom", true),
    ],
    props: [{ key: "steps", label: "Steps / rev", type: "number", min: 200, max: 4096, step: 4, default: 2048 }],
    description: "Geared stepper motor driven through a ULN2003 board.",
  },
  {
    type: "solenoid",
    label: "Solenoid Valve",
    category: "Actuator",
    color: "var(--warning)",
    width: 190,
    height: 96,
    pins: [p("V+", "V+", "power", "top", true), p("V-", "V-", "ground", "bottom", true)],
    props: [{ key: "size", label: "Port size", type: "select", options: ['1/2"', '3/4"', '1"'], default: '1/2"' }],
    description: "Electrically actuated water valve switched by a relay.",
  },
  {
    type: "led-strip",
    label: "WS2812 LED Strip",
    category: "Output",
    color: "var(--violet)",
    width: 210,
    height: 90,
    pins: [
      p("VCC", "5V", "power", "top", true),
      p("DIN", "DIN", "digital", "top", true),
      p("GND", "GND", "ground", "bottom", true),
    ],
    props: [{ key: "leds", label: "LED count", type: "number", min: 1, max: 144, step: 1, default: 8 }],
    description: "Addressable RGB LED strip for status indication.",
  },
];

export const partByType = (type: string) => PARTS.find((x) => x.type === type);
export const pinDef = (type: string, pinId: string) => partByType(type)?.pins.find((x) => x.id === pinId);
export const defaultProps = (def: PartDef): Record<string, string | number> =>
  Object.fromEntries((def.props ?? []).map((x) => [x.key, x.default]));

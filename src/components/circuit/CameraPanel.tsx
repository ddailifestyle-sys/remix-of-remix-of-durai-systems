import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, RefreshCw } from "lucide-react";
import type { CameraState } from "@/lib/circuit/engine";

type Props = {
  running: boolean;
  resolution?: string;
  facing?: string;
  label?: string;
  /** camera peripheral state reported by the running sketch */
  sim?: CameraState | null;
};

type Frame = { n: number; url: string; bytes: number; at: string };

const SIZES: Record<string, { width: number; height: number }> = {
  "QVGA 320x240": { width: 320, height: 240 },
  "VGA 640x480": { width: 640, height: 480 },
  "HD 1280x720": { width: 1280, height: 720 },
};

/** Streams the real device camera while the ESP32-S3 camera board is simulated, with a clear permission prompt and a synthetic fallback. */
export function CameraPanel({ running, resolution = "VGA 640x480", facing = "Front", label = "ESP32-S3 Camera", sim }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [live, setLive] = useState(false);
  const [permission, setPermission] = useState<"prompt" | "granted" | "denied" | "unknown">("unknown");
  const rafRef = useRef<number | null>(null);
  const [frames, setFrames] = useState<Frame[]>([]);
  const [flash, setFlash] = useState(false);
  const lastCapture = useRef(0);
  const lastThumbAt = useRef(0);

  const size = SIZES[resolution] ?? SIZES["VGA 640x480"]!;

  const queryPermission = async () => {
    try {
      const status = await navigator.permissions?.query({ name: "camera" as PermissionName });
      if (status) {
        setPermission(status.state === "granted" ? "granted" : status.state === "denied" ? "denied" : "prompt");
        status.onchange = () => setPermission(status.state === "granted" ? "granted" : status.state === "denied" ? "denied" : "prompt");
      } else {
        setPermission("unknown");
      }
    } catch {
      setPermission("unknown");
    }
  };

  useEffect(() => {
    queryPermission();
  }, []);

  const startStream = async () => {
    try {
      setError(null);
      const s = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: size.width },
          height: { ideal: size.height },
          facingMode: facing === "Rear" ? "environment" : "user",
        },
        audio: false,
      });
      setPermission("granted");
      setLive(true);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch (e: unknown) {
      setPermission("denied");
      setError(e instanceof Error ? e.message : "Camera unavailable");
    }
  };

  const stopStream = () => {
    const video = videoRef.current;
    const stream = video?.srcObject as MediaStream | null;
    stream?.getTracks().forEach((t) => t.stop());
    if (video) video.srcObject = null;
    setLive(false);
  };

  const drawFallback = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    const t = performance.now() / 1000;
    // animated test pattern + telemetry overlay
    ctx.fillStyle = "#0b0f19";
    ctx.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 40) {
      ctx.fillStyle = `rgba(6,182,212,${0.05 + 0.05 * Math.sin(y / 60 + t)})`;
      ctx.fillRect(0, y, w, 20);
    }
    ctx.strokeStyle = "rgba(6,182,212,0.3)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 20) {
      const y = h / 2 + Math.sin(x / 40 + t * 2) * h * 0.25 + Math.cos(x / 25 - t) * h * 0.1;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.fillStyle = "rgba(6,182,212,0.9)";
    ctx.font = "14px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.fillText(`ESP32-S3 CAMERA (SYNTHETIC) — ${resolution}`, 16, 28);
    ctx.fillText(`FACING: ${facing.toUpperCase()} · FPS: 30 · STREAM: FALLBACK`, 16, 50);
    ctx.fillText(`Reason: ${error ?? "camera access not granted"}`, 16, 72);
  };

  // real device stream when permission is granted
  useEffect(() => {
    if (!running) {
      stopStream();
      return;
    }
    if (permission === "granted" && !error) void startStream();
    return () => stopStream();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, permission, resolution, facing]);

  // synthetic feed whenever the real camera is not streaming
  useEffect(() => {
    if (!running || live) return;
    const loop = () => {
      drawFallback();
      rafRef.current = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, live, error, resolution, facing]);

  // each esp_camera_capture() in the sketch grabs a frame from the feed
  useEffect(() => {
    const captures = sim?.captures ?? 0;
    if (!running || captures <= lastCapture.current) {
      if (captures < lastCapture.current) lastCapture.current = captures;
      return;
    }
    lastCapture.current = captures;
    const now = performance.now();
    if (now - lastThumbAt.current < 400) return; // keep thumbnails light
    lastThumbAt.current = now;
    const source: HTMLVideoElement | HTMLCanvasElement | null = live ? videoRef.current : canvasRef.current;
    if (!source) return;
    const thumb = document.createElement("canvas");
    thumb.width = 160;
    thumb.height = 120;
    const ctx = thumb.getContext("2d");
    if (!ctx) return;
    try {
      ctx.drawImage(source, 0, 0, thumb.width, thumb.height);
      const url = thumb.toDataURL("image/jpeg", 0.7);
      setFrames((f) => [{ n: captures, url, bytes: sim?.frameBytes ?? 0, at: new Date().toLocaleTimeString() }, ...f].slice(0, 4));
      setFlash(true);
      window.setTimeout(() => setFlash(false), 120);
    } catch {
      /* frame not ready yet */
    }
  }, [sim?.captures, sim?.frameBytes, running, live]);

  useEffect(() => {
    if (!running) return;
    setFrames([]);
    lastCapture.current = 0;
  }, [running]);

  useEffect(() => {
    if (!running && error) setError(null);
  }, [running, error]);

  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Camera className="h-4 w-4 text-cyan" aria-hidden="true" /> {label} Output
        </h2>
        <span
          role="status"
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
            live ? "bg-success/15 text-success" : "bg-surface-2 text-muted-foreground"
          }`}
        >
          {live ? "STREAMING" : running ? (error || permission === "denied" ? "FALLBACK" : "SYNTHETIC") : "OFFLINE"}
        </span>
      </div>
      <div className="relative mt-3 aspect-video overflow-hidden rounded-xl border border-border bg-background">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`h-full w-full object-cover ${live ? "" : "opacity-0"}`}
        />
        <canvas
          ref={canvasRef}
          width={size.width}
          height={size.height}
          className={`absolute inset-0 h-full w-full object-cover ${live ? "opacity-0" : "opacity-100"}`}
          aria-label="Synthetic camera feed fallback"
        />
        {!running && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center text-xs text-muted-foreground">
            <CameraOff className="h-5 w-5" />
            <span>Run the simulation to start the camera</span>
          </div>
        )}
        {running && !live && error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center text-xs text-muted-foreground">
            <CameraOff className="h-5 w-5" />
            <p className="max-w-[80%] text-danger">{error}</p>
            <p className="max-w-[80%]">A synthetic pattern is being used so your sketch can still run.</p>
            <button
              onClick={() => { setError(null); setPermission("unknown"); void startStream(); }}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:border-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
            >
              <RefreshCw className="h-3 w-3" aria-hidden="true" /> Try camera again
            </button>
          </div>
        )}
        {running && !live && !error && permission !== "granted" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center text-xs text-muted-foreground">
            <Camera className="h-5 w-5" />
            <p className="max-w-[80%]">Allow camera access to see the live ESP32-S3 camera feed.</p>
            <button
              onClick={() => void startStream()}
              className="inline-flex items-center gap-1 rounded-lg bg-brand-gradient px-4 py-2 text-xs font-semibold text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
            >
              <Camera className="h-3 w-3" aria-hidden="true" /> Enable camera
            </button>
          </div>
        )}
        {live && (
          <span className="absolute left-2 top-2 rounded bg-background/70 px-2 py-0.5 font-mono text-[10px] text-cyan">
            {resolution} · {facing.toLowerCase()} cam
          </span>
        )}
        {flash && <div className="pointer-events-none absolute inset-0 bg-foreground/20" aria-hidden="true" />}
      </div>

      {running && (
        <dl className="mt-3 grid grid-cols-3 gap-2 text-center text-[10px]" aria-live="polite">
          <div className="rounded-lg bg-surface-2 p-2">
            <dt className="text-muted-foreground">Sensor</dt>
            <dd className={`font-mono font-semibold ${sim?.ready ? "text-success" : "text-muted-foreground"}`}>
              {sim?.ready ? "READY" : "NOT INIT"}
            </dd>
          </div>
          <div className="rounded-lg bg-surface-2 p-2">
            <dt className="text-muted-foreground">Frames</dt>
            <dd className="font-mono font-semibold text-cyan">{sim?.captures ?? 0}</dd>
          </div>
          <div className="rounded-lg bg-surface-2 p-2">
            <dt className="text-muted-foreground">Last frame</dt>
            <dd className="font-mono font-semibold text-cyan">
              {sim?.frameBytes ? `${(sim.frameBytes / 1024).toFixed(1)} KB` : "—"}
            </dd>
          </div>
        </dl>
      )}
      {running && !sim?.ready && (
        <p className="mt-2 text-[11px] text-muted-foreground">
          Waiting for the sketch to call <code className="font-mono text-cyan">esp_camera_init()</code> — use Generate → Run to add it automatically.
        </p>
      )}
      {frames.length > 0 && (
        <div className="mt-3">
          <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Captured frames</h3>
          <ul className="mt-2 grid grid-cols-4 gap-2">
            {frames.map((f) => (
              <li key={f.n} className="overflow-hidden rounded-md border border-border">
                <img src={f.url} alt={`Captured frame ${f.n} at ${f.at}`} className="aspect-[4/3] w-full object-cover" />
                <p className="px-1 py-0.5 font-mono text-[9px] text-muted-foreground">#{f.n}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

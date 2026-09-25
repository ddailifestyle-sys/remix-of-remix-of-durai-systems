import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff } from "lucide-react";

type Props = { running: boolean; resolution?: string; facing?: string; label?: string };

const SIZES: Record<string, { width: number; height: number }> = {
  "QVGA 320x240": { width: 320, height: 240 },
  "VGA 640x480": { width: 640, height: 480 },
  "HD 1280x720": { width: 1280, height: 720 },
};

/** Streams the real device camera while the ESP32-S3 camera board is simulated. */
export function CameraPanel({ running, resolution = "VGA 640x480", facing = "Front", label = "ESP32-S3 Camera" }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;
    if (!running) {
      setLive(false);
      return;
    }
    const size = SIZES[resolution] ?? SIZES["VGA 640x480"]!;
    navigator.mediaDevices
      ?.getUserMedia({
        video: {
          width: { ideal: size.width },
          height: { ideal: size.height },
          facingMode: facing === "Rear" ? "environment" : "user",
        },
        audio: false,
      })
      .then((s) => {
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        stream = s;
        setError(null);
        setLive(true);
        if (videoRef.current) videoRef.current.srcObject = s;
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Camera unavailable");
      });
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
      setLive(false);
    };
  }, [running, resolution, facing]);

  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Camera className="h-4 w-4 text-cyan" /> {label} Output
        </h2>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
            live ? "bg-success/15 text-success" : "bg-surface-2 text-muted-foreground"
          }`}
        >
          {live ? "STREAMING" : running ? "STARTING…" : "OFFLINE"}
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
        {!live && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center text-xs text-muted-foreground">
            <CameraOff className="h-5 w-5" />
            {error ? <span className="px-4 text-danger">{error}</span> : <span>Run the simulation to stream the camera</span>}
          </div>
        )}
        {live && (
          <span className="absolute left-2 top-2 rounded bg-background/70 px-2 py-0.5 font-mono text-[10px] text-cyan">
            {resolution} · {facing.toLowerCase()} cam
          </span>
        )}
      </div>
    </div>
  );
}

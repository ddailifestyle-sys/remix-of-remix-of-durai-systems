import { ClientOnly } from "@tanstack/react-router";
import { Component, lazy, Suspense, type ErrorInfo, type ReactNode } from "react";
import { EnvironmentFallback } from "./EnvironmentFallback";

const EngineeringEnvironment = lazy(() => import("./EngineeringEnvironment"));

class VisualBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  override state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  override componentDidCatch(error: Error, info: ErrorInfo) { console.warn("3D environment unavailable; fallback active", error, info); }
  override render() { return this.state.failed ? <EnvironmentFallback /> : this.props.children; }
}


function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch { return false; }
}

export function EnvironmentLayer({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <ClientOnly fallback={<EnvironmentFallback />}>
      {reducedMotion || !supportsWebGL() || window.innerWidth < 900 ? <EnvironmentFallback /> : <VisualBoundary><Suspense fallback={<EnvironmentFallback />}><EngineeringEnvironment /></Suspense></VisualBoundary>}
    </ClientOnly>
  );
}
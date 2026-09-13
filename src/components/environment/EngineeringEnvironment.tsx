import { Environment, Float, Lightformer } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function CoreAssembly() {
  const group = useRef<THREE.Group>(null);
  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    if (group.current) group.current.rotation.y += delta * 0.09;
  });
  return (
    <group ref={group} position={[2.8, 0.5, 0]}>
      <mesh castShadow><cylinderGeometry args={[1.55, 1.9, 0.34, 8]} /><meshStandardMaterial color="#1c2833" metalness={0.9} roughness={0.28} /></mesh>
      <mesh position={[0, 0.35, 0]} castShadow><cylinderGeometry args={[1.12, 1.3, 0.72, 8]} /><meshStandardMaterial color="#253745" metalness={0.78} roughness={0.3} /></mesh>
      <mesh position={[0, 0.86, 0]}><torusGeometry args={[0.8, 0.045, 8, 48]} /><meshStandardMaterial color="#5fd7e8" emissive="#1f8094" emissiveIntensity={1.1} /></mesh>
      <mesh position={[0, 1.1, 0]} castShadow><octahedronGeometry args={[0.48, 1]} /><meshStandardMaterial color="#668493" metalness={0.85} roughness={0.18} /></mesh>
      {[0, 1, 2].map((level) => <mesh key={level} position={[-2.3, 0.6 + level * 0.86, -0.8]} castShadow><boxGeometry args={[0.72, 0.68, 1.65]} /><meshStandardMaterial color={level === 1 ? "#263a48" : "#18252e"} metalness={0.8} roughness={0.38} /></mesh>)}
    </group>
  );
}

function DataNodes() {
  const points = useMemo(() => [[1.2,2.6,-0.4], [3.8,2.5,-1.4], [4.8,1.6,0.6], [1.4,1.3,-2.2]] as [number,number,number][], []);
  return <>{points.map((position, index) => <Float key={index} speed={0.5 + index * 0.08} floatIntensity={0.18}><mesh position={position}><sphereGeometry args={[0.055, 10, 10]} /><meshBasicMaterial color="#70ddeb" /></mesh></Float>)}</>;
}

export default function EngineeringEnvironment() {
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <Canvas dpr={1} shadows camera={{ position: [0.5, 3.5, 9], fov: 46 }} gl={{ antialias: true, powerPreference: "high-performance" }}>
        <color attach="background" args={["#070b0f"]} />
        <fog attach="fog" args={["#070b0f", 7, 18]} />
        <ambientLight intensity={0.42} color="#668093" />
        <directionalLight position={[3, 7, 5]} intensity={2.1} color="#c1d9e2" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
        <pointLight position={[3, 2, 3]} intensity={8} distance={8} color="#2aabc2" />
        <CoreAssembly />
        <DataNodes />
        <mesh rotation-x={-Math.PI / 2} position={[2, -0.02, 0]} receiveShadow><planeGeometry args={[18, 18]} /><meshStandardMaterial color="#0b1218" metalness={0.5} roughness={0.58} /></mesh>
        <Environment><Lightformer intensity={1.8} position={[0, 5, 2]} scale={[10, 2, 1]} /><Lightformer intensity={0.9} color="#4aaabd" position={[-5, 1, 0]} rotation-y={Math.PI / 2} scale={[10, 1, 1]} /></Environment>
      </Canvas>
    </div>
  );
}
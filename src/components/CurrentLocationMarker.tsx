"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface CurrentLocationMarkerProps {
  mapWidth: number;
  mapHeight: number;
  position: { x: number; y: number }; // percentage 0-100
}

export default function CurrentLocationMarker({
  mapWidth,
  mapHeight,
  position,
}: CurrentLocationMarkerProps) {
  const ringRef = useRef<THREE.Mesh>(null);
  const pulseRef = useRef<THREE.Mesh>(null);

  const worldX = (position.x / 100 - 0.5) * mapWidth;
  const worldZ = (position.y / 100 - 0.5) * mapHeight;

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Pulse ring animation
    if (pulseRef.current) {
      const scale = 1 + Math.sin(t * 2) * 0.3 + 0.3;
      pulseRef.current.scale.set(scale, scale, 1);
      const mat = pulseRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.3 - Math.sin(t * 2) * 0.15;
    }

    // Gentle bob for the dot
    if (ringRef.current) {
      ringRef.current.position.y = 0.15 + Math.sin(t * 3) * 0.03;
    }
  });

  return (
    <group position={[worldX, 0.01, worldZ]}>
      {/* Pulsing outer ring on ground */}
      <mesh
        ref={pulseRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.006, 0]}
      >
        <ringGeometry args={[0.4, 0.55, 32]} />
        <meshBasicMaterial
          color="#3B82F6"
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Static accuracy circle on ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
        <circleGeometry args={[0.6, 32]} />
        <meshBasicMaterial
          color="#3B82F6"
          transparent
          opacity={0.1}
          depthWrite={false}
        />
      </mesh>

      {/* Blue dot */}
      <mesh ref={ringRef} position={[0, 0.15, 0]}>
        <sphereGeometry args={[0.18, 20, 20]} />
        <meshStandardMaterial
          color="#3B82F6"
          emissive="#3B82F6"
          emissiveIntensity={0.6}
          roughness={0.2}
          metalness={0.1}
        />
      </mesh>

      {/* White border ring around dot */}
      <mesh position={[0, 0.15, 0]}>
        <sphereGeometry args={[0.22, 20, 20]} />
        <meshStandardMaterial
          color="white"
          transparent
          opacity={0.6}
          roughness={0.3}
        />
      </mesh>
    </group>
  );
}

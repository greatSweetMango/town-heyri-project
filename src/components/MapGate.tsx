"use client";

import { useRef } from "react";
import * as THREE from "three";

interface GateData {
  id: string;
  name: string;
  positionX: number;
  positionY: number;
  description?: string | null;
}

interface MapGateProps {
  gate: GateData;
  mapWidth: number;
  mapHeight: number;
}

export default function MapGate({ gate, mapWidth, mapHeight }: MapGateProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Convert percentage position (0-100) to world coordinates
  const worldX = (gate.positionX / 100 - 0.5) * mapWidth;
  const worldZ = (gate.positionY / 100 - 0.5) * mapHeight;

  const archColor = new THREE.Color("#8B8178");
  const pillarColor = new THREE.Color("#6B5E53");

  const pillarWidth = 0.08;
  const pillarHeight = 0.6;
  const archWidth = 0.5;

  return (
    <group ref={groupRef} position={[worldX, 0.01, worldZ]}>
      {/* Left pillar */}
      <mesh position={[-archWidth / 2, pillarHeight / 2, 0]}>
        <boxGeometry args={[pillarWidth, pillarHeight, pillarWidth]} />
        <meshStandardMaterial
          color={pillarColor}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Right pillar */}
      <mesh position={[archWidth / 2, pillarHeight / 2, 0]}>
        <boxGeometry args={[pillarWidth, pillarHeight, pillarWidth]} />
        <meshStandardMaterial
          color={pillarColor}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Top arch beam */}
      <mesh position={[0, pillarHeight, 0]}>
        <boxGeometry
          args={[archWidth + pillarWidth, pillarWidth * 1.2, pillarWidth * 1.2]}
        />
        <meshStandardMaterial
          color={archColor}
          roughness={0.6}
          metalness={0.15}
        />
      </mesh>

      {/* Ground shadow */}
      <mesh position={[0, 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[archWidth + 0.2, 0.3]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={0.15}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

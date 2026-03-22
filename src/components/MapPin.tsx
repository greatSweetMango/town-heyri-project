"use client";

import { useRef } from "react";
import * as THREE from "three";

interface PinData {
  id: string;
  name: string;
  category: string;
  positionX: number;
  positionY: number;
  description?: string | null;
}

interface MapPinProps {
  pin: PinData;
  mapWidth: number;
  mapHeight: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  recycling: "#4CAF50",
  info: "#2196F3",
  "first-aid": "#F44336",
};

const DEFAULT_COLOR = "#9E9E9E";

export default function MapPin({ pin, mapWidth, mapHeight }: MapPinProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Convert percentage position (0-100) to world coordinates
  const worldX = (pin.positionX / 100 - 0.5) * mapWidth;
  const worldZ = (pin.positionY / 100 - 0.5) * mapHeight;

  const color = new THREE.Color(
    CATEGORY_COLORS[pin.category] ?? DEFAULT_COLOR
  );

  const pinRadius = 0.12;
  const stemHeight = 0.2;

  return (
    <group ref={groupRef} position={[worldX, 0.01, worldZ]}>
      {/* Shadow on ground */}
      <mesh position={[0, 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.1, 16]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={0.2}
          depthWrite={false}
        />
      </mesh>

      {/* Stem */}
      <mesh position={[0, stemHeight / 2, 0]}>
        <cylinderGeometry args={[0.02, 0.03, stemHeight, 6]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.2} />
      </mesh>

      {/* Pin head (small sphere) */}
      <mesh position={[0, stemHeight + pinRadius * 0.8, 0]}>
        <sphereGeometry args={[pinRadius, 12, 12]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.15}
          roughness={0.35}
          metalness={0.2}
        />
      </mesh>
    </group>
  );
}

"use client";

import { useRef, useState, useCallback } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { StoreWithEvents } from "@/types";
import { CATEGORY_CONFIG } from "@/types";

interface MapMarkerProps {
  store: StoreWithEvents;
  mapWidth: number;
  mapHeight: number;
  onHover: (store: StoreWithEvents | null, screenPos: { x: number; y: number } | null) => void;
  onClick: (store: StoreWithEvents) => void;
  isSelected: boolean;
  isOpen: boolean;
  hasActiveEvent: boolean;
}

export default function MapMarker({
  store,
  mapWidth,
  mapHeight,
  onHover,
  onClick,
  isSelected,
  isOpen,
  hasActiveEvent,
}: MapMarkerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const eventGlowRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const targetScale = useRef(1);

  const config = CATEGORY_CONFIG[store.category];
  const color = new THREE.Color(config.color);
  const closedGray = new THREE.Color("#888888");
  const eventGoldColor = new THREE.Color("#C9A84C");

  // Convert percentage position (0-100) to world coordinates
  const worldX = (store.positionX / 100 - 0.5) * mapWidth;
  const worldZ = (store.positionY / 100 - 0.5) * mapHeight;

  const pinRadius = 0.25;
  const stemHeight = 0.4;

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Determine target
    targetScale.current = hovered || isSelected ? 1.5 : 1.0;

    // Smooth lerp to target scale (stable, no jitter)
    const s = groupRef.current.scale;
    const t = targetScale.current;
    s.x += (t - s.x) * Math.min(delta * 6, 1);
    s.y += (t - s.y) * Math.min(delta * 6, 1);
    s.z += (t - s.z) * Math.min(delta * 6, 1);

    // Glow ring opacity
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      const targetOpacity = hovered || isSelected ? 0.5 : 0;
      mat.opacity += (targetOpacity - mat.opacity) * Math.min(delta * 8, 1);
    }

    // Event glow pulsing animation
    if (eventGlowRef.current && hasActiveEvent) {
      const mat = eventGlowRef.current.material as THREE.MeshBasicMaterial;
      const pulse = (Math.sin(state.clock.elapsedTime * 3) + 1) / 2; // 0 to 1
      mat.opacity = 0.2 + pulse * 0.45;
      const scale = 1 + pulse * 0.3;
      eventGlowRef.current.scale.set(scale, scale, 1);
    }
  });

  const { camera, gl } = useThree();

  const projectToScreen = useCallback(() => {
    const vec = new THREE.Vector3(worldX, stemHeight + pinRadius + 0.3, worldZ);
    vec.project(camera);
    const rect = gl.domElement.getBoundingClientRect();
    return {
      x: rect.left + ((vec.x + 1) / 2) * rect.width,
      y: rect.top + ((-vec.y + 1) / 2) * rect.height,
    };
  }, [worldX, worldZ, camera, gl]);

  const handlePointerOver = useCallback(
    (e: any) => {
      e.stopPropagation();
      setHovered(true);
      document.body.style.cursor = "pointer";
      onHover(store, projectToScreen());
    },
    [store, onHover, projectToScreen]
  );

  const handlePointerOut = useCallback(() => {
    setHovered(false);
    document.body.style.cursor = "auto";
    onHover(null, null);
  }, [onHover]);

  const handleClick = useCallback(
    (e: any) => {
      e.stopPropagation();
      onClick(store);
      // On mobile, also trigger hover to show tooltip
      if (!hovered) {
        setHovered(true);
        onHover(store, projectToScreen());
      }
    },
    [store, onClick, hovered, onHover, projectToScreen]
  );

  // Determine visual properties based on isOpen
  const pinColor = isOpen ? color : closedGray;
  const pinEmissiveIntensity = isOpen ? (hovered || isSelected ? 0.5 : 0.1) : 0;
  const pinOpacity = isOpen ? 1 : 0.4;

  return (
    <group
      ref={groupRef}
      position={[worldX, 0.01, worldZ]}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {/* Shadow on ground */}
      <mesh position={[0, 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.2, 24]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={isOpen ? 0.25 : 0.1}
          depthWrite={false}
        />
      </mesh>

      {/* Glow ring on ground */}
      <mesh ref={glowRef} position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 0.55, 32]} />
        <meshBasicMaterial
          color={pinColor}
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Event glow ring (golden pulsing) — only when hasActiveEvent */}
      {hasActiveEvent && (
        <mesh ref={eventGlowRef} position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.35, 0.7, 32]} />
          <meshBasicMaterial
            color={eventGoldColor}
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Pin stem */}
      <mesh position={[0, stemHeight / 2, 0]}>
        <cylinderGeometry args={[0.04, 0.06, stemHeight, 8]} />
        <meshStandardMaterial
          color={pinColor}
          roughness={0.4}
          metalness={0.3}
          transparent={!isOpen}
          opacity={pinOpacity}
        />
      </mesh>

      {/* Pin head (sphere) */}
      <mesh position={[0, stemHeight + pinRadius * 0.8, 0]}>
        <sphereGeometry args={[pinRadius, 20, 20]} />
        <meshStandardMaterial
          color={pinColor}
          emissive={pinColor}
          emissiveIntensity={pinEmissiveIntensity}
          roughness={0.25}
          metalness={0.3}
          transparent={!isOpen}
          opacity={pinOpacity}
        />
      </mesh>

      {/* Category icon label (using small sphere as indicator on top) */}
      <mesh position={[0, stemHeight + pinRadius * 2.2, 0]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial
          color="white"
          transparent={!isOpen}
          opacity={pinOpacity}
        />
      </mesh>

      {/* LARGE invisible hit area for easy interaction (especially mobile) */}
      <mesh position={[0, stemHeight / 2 + 0.2, 0]} visible={false}>
        <boxGeometry args={[1.0, stemHeight + pinRadius * 2 + 0.5, 1.0]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
}

"use client";

import { useMemo } from "react";
import { Line } from "@react-three/drei";

interface TrailPoint {
  x: number;
  y: number;
}

interface TrailData {
  id: string;
  name: string;
  points: TrailPoint[];
  isActive: boolean;
}

interface MapTrailProps {
  trail: TrailData;
  mapWidth: number;
  mapHeight: number;
}

export default function MapTrail({ trail, mapWidth, mapHeight }: MapTrailProps) {
  // Convert percentage-based points to world coordinates
  const worldPoints = useMemo(() => {
    return trail.points.map((p) => {
      const worldX = (p.x / 100 - 0.5) * mapWidth;
      const worldZ = (p.y / 100 - 0.5) * mapHeight;
      return [worldX, 0.02, worldZ] as [number, number, number];
    });
  }, [trail.points, mapWidth, mapHeight]);

  if (worldPoints.length < 2) return null;

  return (
    <Line
      points={worldPoints}
      color="#8B7355"
      lineWidth={2.5}
      transparent
      opacity={0.7}
    />
  );
}

"use client";

import { Store, Category } from "@/types";

/**
 * Euclidean distance between two position points.
 */
export function getDistance(
  a: { x: number; y: number },
  b: { x: number; y: number }
): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

/**
 * Rough walking time estimate in minutes from position distance.
 * Assumes the map represents ~1.2km across (100 units),
 * and walking speed is ~5km/h (~80m/min).
 */
export function getWalkingTime(distance: number): number {
  const metersPerUnit = 12;
  const meters = distance * metersPerUnit;
  const minutes = meters / 80;
  return Math.max(1, Math.round(minutes));
}

/**
 * Filter stores by category. Returns all stores if category is null.
 */
export function getStoresByCategory(
  stores: Store[],
  category: Category | null
): Store[] {
  if (!category) return stores;
  return stores.filter((s) => s.category === category);
}

/**
 * Get nearby stores sorted by distance, excluding the reference store itself.
 */
export function getNearbyStores(
  store: Store,
  allStores: Store[],
  limit: number = 3
): Store[] {
  return allStores
    .filter((s) => s.id !== store.id)
    .map((s) => ({
      store: s,
      distance: getDistance(store.position, s.position),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit)
    .map((entry) => entry.store);
}

/**
 * Classname utility — joins truthy class strings.
 */
export function cn(
  ...classes: (string | undefined | false | null)[]
): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Heyri Art Village GPS bounding box (approximate).
 * Used to convert real GPS coordinates → map percentage (0-100).
 */
const HEYRI_BOUNDS = {
  north: 37.766,
  south: 37.754,
  west: 126.688,
  east: 126.703,
};

/**
 * Convert GPS lat/lng to map percentage position (0-100).
 * Returns null if outside the Heyri bounds (with some margin).
 */
export function gpsToMapPosition(
  lat: number,
  lng: number
): { x: number; y: number } | null {
  const margin = 0.003; // ~300m margin around bounds
  const bounds = HEYRI_BOUNDS;

  if (
    lat < bounds.south - margin ||
    lat > bounds.north + margin ||
    lng < bounds.west - margin ||
    lng > bounds.east + margin
  ) {
    return null;
  }

  const x = ((lng - bounds.west) / (bounds.east - bounds.west)) * 100;
  const y = ((bounds.north - lat) / (bounds.north - bounds.south)) * 100;

  return {
    x: Math.max(0, Math.min(100, x)),
    y: Math.max(0, Math.min(100, y)),
  };
}

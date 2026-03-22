import { prisma } from "./prisma";

// Default feature flags to seed
export const DEFAULT_FLAGS = [
  { name: "trails_enabled", enabled: false, description: "산책로 표시" },
  { name: "gates_enabled", enabled: false, description: "출입구(Gate) 표시" },
  { name: "kakao_map", enabled: false, description: "카카오맵 버전 사용" },
] as const;

// Server-side: fetch a single flag
export async function getFeatureFlag(name: string): Promise<boolean> {
  const flag = await prisma.featureFlag.findUnique({ where: { name } });
  return flag?.enabled ?? false;
}

// Server-side: fetch all flags
export async function getAllFeatureFlags(): Promise<Record<string, boolean>> {
  const flags = await prisma.featureFlag.findMany();
  return Object.fromEntries(flags.map((f) => [f.name, f.enabled]));
}

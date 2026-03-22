import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: return view counts for a store
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const now = new Date();

  // Start of today (midnight)
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Start of this week (Monday)
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - mondayOffset);

  // Start of this month
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // 30 days ago
  const thirtyDaysAgo = new Date(todayStart);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);

  const [todayViews, weekViews, monthViews, recentViews] = await Promise.all([
    prisma.storeView.count({
      where: { storeId: id, createdAt: { gte: todayStart } },
    }),
    prisma.storeView.count({
      where: { storeId: id, createdAt: { gte: weekStart } },
    }),
    prisma.storeView.count({
      where: { storeId: id, createdAt: { gte: monthStart } },
    }),
    prisma.storeView.findMany({
      where: { storeId: id, createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  // Group recent views by day
  const dailyMap: Record<string, number> = {};

  // Initialize all 30 days with 0
  for (let i = 0; i < 30; i++) {
    const d = new Date(thirtyDaysAgo);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().split("T")[0];
    dailyMap[key] = 0;
  }

  // Count views per day
  for (const view of recentViews as { createdAt: Date }[]) {
    const key = new Date(view.createdAt).toISOString().split("T")[0];
    if (dailyMap[key] !== undefined) {
      dailyMap[key]++;
    }
  }

  const dailyViews = Object.entries(dailyMap).map(([date, count]) => ({
    date,
    count,
  }));

  return NextResponse.json({
    todayViews,
    weekViews,
    monthViews,
    dailyViews,
  });
}

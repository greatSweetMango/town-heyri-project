import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET: admin only - aggregated stats
export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);
  const monthStart = new Date(todayStart);
  monthStart.setDate(monthStart.getDate() - 30);

  const [
    totalStores,
    totalUsers,
    totalEvents,
    todayViews,
    weekViews,
    monthViews,
    topStoreViews,
  ] = await Promise.all([
    prisma.store.count(),
    prisma.user.count(),
    prisma.event.count({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
    }),
    prisma.pageView.count({
      where: { createdAt: { gte: todayStart } },
    }),
    prisma.pageView.count({
      where: { createdAt: { gte: weekStart } },
    }),
    prisma.pageView.count({
      where: { createdAt: { gte: monthStart } },
    }),
    prisma.storeView.groupBy({
      by: ["storeId"],
      _count: { id: true },
      where: { createdAt: { gte: monthStart } },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    }),
  ]);

  // Resolve store names
  const storeIds = topStoreViews.map((v) => v.storeId);
  const storesData = await prisma.store.findMany({
    where: { id: { in: storeIds } },
    select: { id: true, name: true },
  });
  const storeMap = Object.fromEntries(storesData.map((s) => [s.id, s.name]));

  const topStores = topStoreViews.map((v) => ({
    storeId: v.storeId,
    storeName: storeMap[v.storeId] || "알 수 없음",
    views: v._count.id,
  }));

  return NextResponse.json({
    totalStores,
    totalUsers,
    totalEvents,
    todayViews,
    weekViews,
    monthViews,
    topStores,
  });
}

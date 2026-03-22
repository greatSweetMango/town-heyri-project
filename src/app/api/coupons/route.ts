import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET: list coupons (filtered by storeId for shop owners, all for admin)
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const storeId = searchParams.get("storeId");

  const session = await auth();

  // If not admin and no storeId filter, return empty
  const where: Record<string, unknown> = {};

  if (storeId) {
    where.storeId = storeId;
  } else if (session?.user?.role === "ADMIN") {
    // Admin sees all
  } else if (session?.user?.storeId) {
    where.storeId = session.user.storeId;
  } else {
    // Public: only active, non-expired coupons
    where.isActive = true;
    where.validUntil = { gte: new Date() };
  }

  const coupons = await prisma.coupon.findMany({
    where,
    include: {
      store: { select: { id: true, name: true, category: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(coupons);
}

// POST: create coupon (auth required)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "SHOP_OWNER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { storeId, title, description, discount, validUntil } = body;

  if (!storeId || !title || !discount || !validUntil) {
    return NextResponse.json(
      { error: "storeId, title, discount, validUntil are required" },
      { status: 400 }
    );
  }

  // Shop owners can only create coupons for their own store
  if (session.user.role === "SHOP_OWNER" && session.user.storeId !== storeId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const coupon = await prisma.coupon.create({
    data: {
      storeId,
      title,
      description: description || null,
      discount,
      validUntil: new Date(validUntil),
    },
    include: {
      store: { select: { id: true, name: true, category: true } },
    },
  });

  return NextResponse.json(coupon, { status: 201 });
}

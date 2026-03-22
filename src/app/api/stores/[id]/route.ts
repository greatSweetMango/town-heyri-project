import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET: public - get single store
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const store = await prisma.store.findUnique({
    where: { id },
    include: {
      events: {
        where: {
          isActive: true,
          startDate: { lte: new Date() },
          endDate: { gte: new Date() },
        },
      },
      coupons: {
        where: { isActive: true, validUntil: { gte: new Date() } },
      },
    },
  });

  if (!store) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(store);
}

// PATCH: admin or store owner
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Shop owners can only edit their own store
  if (session.user.role === "SHOP_OWNER" && session.user.storeId !== id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const store = await prisma.store.update({ where: { id }, data: body });
  return NextResponse.json(store);
}

// DELETE: admin only
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.store.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

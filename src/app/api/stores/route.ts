import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET: public - list all stores
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const category = searchParams.get("category");

  const stores = await prisma.store.findMany({
    where: category ? { category } : undefined,
    include: {
      events: {
        where: {
          isActive: true,
          startDate: { lte: new Date() },
          endDate: { gte: new Date() },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(stores);
}

// POST: admin only - create a store
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const store = await prisma.store.create({ data: body });
  return NextResponse.json(store, { status: 201 });
}

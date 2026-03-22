import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET: public - list events with store
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const storeId = searchParams.get("storeId");
  const activeOnly = searchParams.get("active") !== "false";

  const events = await prisma.event.findMany({
    where: {
      ...(storeId ? { storeId } : {}),
      ...(activeOnly
        ? { isActive: true, endDate: { gte: new Date() } }
        : {}),
    },
    include: {
      store: { select: { name: true, category: true } },
    },
    orderBy: { startDate: "asc" },
  });

  return NextResponse.json(events);
}

// POST: auth required - create an event + auto board post
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { storeId, title, description, category, startDate, endDate } = body;

  if (!storeId || !title || !startDate || !endDate) {
    return NextResponse.json(
      { error: "storeId, title, startDate, endDate are required" },
      { status: 400 }
    );
  }

  // Create event and auto-create board post in a transaction
  const [event] = await prisma.$transaction([
    prisma.event.create({
      data: {
        storeId,
        title,
        description: description || null,
        category: category || null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
      include: {
        store: { select: { name: true, category: true } },
      },
    }),
    prisma.boardPost.create({
      data: {
        authorId: session.user.id,
        storeId,
        title,
        content: description || title,
        category: category || "general",
      },
    }),
  ]);

  return NextResponse.json(event, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET: public - list all pins
export async function GET() {
  const pins = await prisma.pin.findMany({
    orderBy: { name: "asc" },
  });

  return NextResponse.json(pins);
}

// POST: admin only - create a pin
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const pin = await prisma.pin.create({ data: body });
  return NextResponse.json(pin, { status: 201 });
}

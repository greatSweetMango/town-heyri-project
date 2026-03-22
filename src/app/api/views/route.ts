import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST: record a store view or page view
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { storeId, page } = body;

  if (storeId) {
    // Record store view
    await prisma.storeView.create({
      data: { storeId },
    });
    return NextResponse.json({ success: true }, { status: 201 });
  }

  if (page) {
    // Record page view
    await prisma.pageView.create({
      data: { page },
    });
    return NextResponse.json({ success: true }, { status: 201 });
  }

  return NextResponse.json(
    { error: "storeId or page is required" },
    { status: 400 }
  );
}

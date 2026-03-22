import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET: list trails (public shows active only, admin with ?all=true shows all)
export async function GET(req: NextRequest) {
  const showAll = req.nextUrl.searchParams.get("all") === "true";

  if (showAll) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const trails = await prisma.trail.findMany({
    where: showAll ? undefined : { isActive: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(trails);
}

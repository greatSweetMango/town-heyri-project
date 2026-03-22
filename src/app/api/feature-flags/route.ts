import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET: public - returns all flags
export async function GET() {
  const flags = await prisma.featureFlag.findMany();
  const result = Object.fromEntries(flags.map((f: { name: string; enabled: boolean }) => [f.name, f.enabled]));
  return NextResponse.json(result);
}

// PATCH: admin only - toggle a flag
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, enabled } = await req.json();
  if (typeof name !== "string" || typeof enabled !== "boolean") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const flag = await prisma.featureFlag.update({
    where: { name },
    data: { enabled },
  });

  return NextResponse.json(flag);
}

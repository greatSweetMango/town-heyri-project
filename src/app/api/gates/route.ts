import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: public - list all gates
export async function GET() {
  const gates = await prisma.gate.findMany({
    orderBy: { name: "asc" },
  });

  return NextResponse.json(gates);
}

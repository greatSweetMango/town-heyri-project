import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET: public - list all announcements
export async function GET() {
  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(announcements);
}

// POST: admin only - create announcement
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, content } = await req.json();

  if (!title || !content) {
    return NextResponse.json(
      { error: "제목과 내용은 필수입니다." },
      { status: 400 }
    );
  }

  const announcement = await prisma.announcement.create({
    data: { title, content },
  });

  return NextResponse.json(announcement, { status: 201 });
}

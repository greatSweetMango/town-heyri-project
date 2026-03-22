import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET: public - list non-expired stories
export async function GET() {
  const stories = await prisma.story.findMany({
    where: {
      expiresAt: { gt: new Date() },
    },
    include: {
      author: { select: { name: true } },
      store: { select: { name: true, category: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(stories);
}

// POST: auth required - create a story
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { storeId, image, text, category } = body;

  if (!storeId) {
    return NextResponse.json(
      { error: "storeId is required" },
      { status: 400 }
    );
  }

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const story = await prisma.story.create({
    data: {
      authorId: session.user.id,
      storeId,
      image: image || null,
      text: text || null,
      category: category || null,
      expiresAt,
    },
    include: {
      author: { select: { name: true } },
      store: { select: { name: true, category: true } },
    },
  });

  return NextResponse.json(story, { status: 201 });
}

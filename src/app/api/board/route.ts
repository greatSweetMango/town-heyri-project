import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET: public - list board posts with pagination
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
  const category = searchParams.get("category");

  const where = category ? { category } : undefined;

  const [posts, total] = await Promise.all([
    prisma.boardPost.findMany({
      where,
      include: {
        author: { select: { id: true, name: true, email: true } },
        store: { select: { id: true, name: true, category: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.boardPost.count({ where }),
  ]);

  return NextResponse.json({
    posts,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

// POST: auth required (shop owner or admin) - create board post
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "SHOP_OWNER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { title, content, category, storeId, images } = body;

  if (!title || !content) {
    return NextResponse.json(
      { error: "Title and content are required" },
      { status: 400 }
    );
  }

  const post = await prisma.boardPost.create({
    data: {
      title,
      content,
      category: category || "general",
      storeId: storeId || session.user.storeId || null,
      images: images || [],
      authorId: session.user.id,
    },
    include: {
      author: { select: { id: true, name: true, email: true } },
      store: { select: { id: true, name: true, category: true } },
    },
  });

  return NextResponse.json(post, { status: 201 });
}

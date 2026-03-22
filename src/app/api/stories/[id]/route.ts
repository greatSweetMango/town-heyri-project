import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// DELETE: author or admin only
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const story = await prisma.story.findUnique({ where: { id } });
  if (!story) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Only author or admin can delete
  if (story.authorId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.story.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

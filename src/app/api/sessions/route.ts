import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const practiceSession = await prisma.session.create({
    data: { userId: session.user.id },
  });

  return NextResponse.json({ id: practiceSession.id });
}
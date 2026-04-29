import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ handId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { handId } = await params;

  const hand = await prisma.hand.findUnique({
    where: { id: handId },
    select: { llmExplanation: true },
  });

  if (!hand) {
    return NextResponse.json({ error: "Hand not found" }, { status: 404 });
  }

  if (hand.llmExplanation) {
    return NextResponse.json({ status: "complete", explanation: hand.llmExplanation });
  }

  return NextResponse.json({ status: "pending" });
}
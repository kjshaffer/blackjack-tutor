import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const mastery = await prisma.mastery.findMany({
    where: { userId: session.user.id },
  });

  // Convert to a map of component -> { attempts, correct, accuracy }
  const masteryMap: Record<string, { attempts: number; correct: number; accuracy: number }> = {};
  for (const m of mastery) {
    masteryMap[m.component] = {
      attempts: m.attempts,
      correct: m.correct,
      accuracy: m.attempts > 0 ? m.correct / m.attempts : 0,
    };
  }

  return NextResponse.json(masteryMap);
}
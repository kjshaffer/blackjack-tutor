import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // Get mastery data per component
  const mastery = await prisma.mastery.findMany({
    where: { userId },
  });

  const masteryData = mastery.map((m) => ({
    component: m.component.charAt(0).toUpperCase() + m.component.slice(1),
    attempts: m.attempts,
    correct: m.correct,
    accuracy: m.attempts > 0 ? Math.round((m.correct / m.attempts) * 100) : 0,
  }));

  // Get all sessions with hand counts
  const sessions = await prisma.session.findMany({
    where: { userId },
    orderBy: { startedAt: "asc" },
    select: {
      id: true,
      startedAt: true,
      totalHands: true,
      correctCount: true,
    },
  });

  const sessionData = sessions
    .filter((s) => s.totalHands > 0)
    .map((s, i) => ({
      session: i + 1,
      date: s.startedAt.toLocaleDateString(),
      totalHands: s.totalHands,
      correct: s.correctCount,
      accuracy: s.totalHands > 0 ? Math.round((s.correctCount / s.totalHands) * 100) : 0,
    }));

  // Get recent hands for accuracy over time (last 100)
  const recentHands = await prisma.hand.findMany({
    where: {
      session: { userId },
    },
    orderBy: { createdAt: "asc" },
    take: 200,
    select: {
      isCorrect: true,
      handType: true,
      createdAt: true,
    },
  });

  // Compute rolling accuracy in chunks of 10
  const rollingAccuracy: { hand: number; accuracy: number }[] = [];
  for (let i = 9; i < recentHands.length; i++) {
    const chunk = recentHands.slice(i - 9, i + 1);
    const correct = chunk.filter((h) => h.isCorrect).length;
    rollingAccuracy.push({
      hand: i + 1,
      accuracy: Math.round((correct / 10) * 100),
    });
  }

  // Overall stats
  const totalHands = recentHands.length;
  const totalCorrect = recentHands.filter((h) => h.isCorrect).length;

  return NextResponse.json({
    mastery: masteryData,
    sessions: sessionData,
    rollingAccuracy,
    overall: {
      totalHands,
      totalCorrect,
      accuracy: totalHands > 0 ? Math.round((totalCorrect / totalHands) * 100) : 0,
    },
  });
}
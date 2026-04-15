import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const {
      sessionId,
      playerCards,
      dealerUpcard,
      handType,
      userAction,
      correctAction,
      isCorrect,
    } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    // Save the hand
    const hand = await prisma.hand.create({
      data: {
        sessionId,
        playerCards,
        dealerUpcard,
        handType,
        userAction,
        correctAction,
        isCorrect,
      },
    });

    // Update session totals
    await prisma.session.update({
      where: { id: sessionId },
      data: {
        totalHands: { increment: 1 },
        correctCount: isCorrect ? { increment: 1 } : undefined,
      },
    });

    // Update mastery for this component
    await prisma.mastery.upsert({
      where: {
        userId_component: {
          userId: session.user.id,
          component: handType,
        },
      },
      update: {
        attempts: { increment: 1 },
        correct: isCorrect ? { increment: 1 } : undefined,
        lastUpdated: new Date(),
      },
      create: {
        userId: session.user.id,
        component: handType,
        attempts: 1,
        correct: isCorrect ? 1 : 0,
      },
    });

    return NextResponse.json({ id: hand.id, isCorrect });
  } catch (error) {
    console.error("Save hand error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
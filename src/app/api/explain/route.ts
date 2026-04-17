import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateExplanation } from "@/lib/openai";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { handId, playerCards, dealerUpcard, userAction, correctAction, handType } =
      await req.json();

    const explanation = await generateExplanation({
      playerCards,
      dealerUpcard,
      userAction,
      correctAction,
      handType,
    });

    // Save the explanation to the hand record if we have a handId
    if (handId) {
      await prisma.hand.update({
        where: { id: handId },
        data: { llmExplanation: explanation },
      });
    }

    return NextResponse.json({ explanation });
  } catch (error) {
    console.error("Explanation error:", error);
    return NextResponse.json(
      { error: "Failed to generate explanation" },
      { status: 500 }
    );
  }
}
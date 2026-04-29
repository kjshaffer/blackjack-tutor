import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { explanationQueue } from "@/lib/queue";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { handId, playerCards, dealerUpcard, userAction, correctAction, handType } =
      await req.json();

    // Enqueue the job instead of calling LLM directly
    const job = await explanationQueue.add("generate-explanation", {
      handId,
      playerCards,
      dealerUpcard,
      userAction,
      correctAction,
      handType,
    });

    return NextResponse.json({ jobId: job.id, handId });
  } catch (error) {
    console.error("Enqueue error:", error);
    return NextResponse.json(
      { error: "Failed to enqueue explanation" },
      { status: 500 }
    );
  }
}
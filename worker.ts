import { Worker } from "bullmq";
import IORedis from "ioredis";
import OpenAI from "openai";
import { PrismaClient } from "./src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

// Set up Prisma with adapter
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Set up OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Redis connection for the worker
const connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

const ACTION_LABELS: Record<string, string> = {
  H: "Hit",
  S: "Stand",
  D: "Double Down",
  P: "Split",
};

async function generateExplanation(data: {
  playerCards: string[];
  dealerUpcard: string;
  userAction: string;
  correctAction: string;
  handType: string;
}): Promise<string> {
  const prompt = `You are a blackjack basic strategy tutor. A student just made an incorrect decision and needs a clear, concise explanation of why the correct play is better.

Game state:
- Player's hand: ${data.playerCards.join(", ")} (${data.handType} hand)
- Dealer's upcard: ${data.dealerUpcard}
- Student chose: ${ACTION_LABELS[data.userAction] || data.userAction}
- Correct play: ${ACTION_LABELS[data.correctAction] || data.correctAction}

Key facts for reference:
- Dealer must hit on 16 or less and stand on 17 or more
- Dealer bust probabilities by upcard: 2 (35%), 3 (37%), 4 (40%), 5 (42%), 6 (42%), 7 (26%), 8 (24%), 9 (23%), 10 (23%), A (17%)
- A "soft" hand contains an Ace counted as 11, so hitting cannot bust you

Write a 2-3 sentence explanation of why the correct play is optimal here. Be specific about the probability reasoning. Use a friendly, conversational tone. Do not restate the game state — jump straight into the reasoning.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 200,
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content || "No explanation available.";
}

// Create the worker
const worker = new Worker(
  "explanation",
  async (job) => {
    console.log(`Processing job ${job.id} for hand ${job.data.handId}`);

    const explanation = await generateExplanation({
      playerCards: job.data.playerCards,
      dealerUpcard: job.data.dealerUpcard,
      userAction: job.data.userAction,
      correctAction: job.data.correctAction,
      handType: job.data.handType,
    });

    // Save explanation to the database
    if (job.data.handId) {
      await prisma.hand.update({
        where: { id: job.data.handId },
        data: { llmExplanation: explanation },
      });
    }

    console.log(`Job ${job.id} completed`);
    return { explanation };
  },
  {
    connection,
    concurrency: 3,
  }
);

worker.on("completed", (job) => {
  console.log(`Job ${job?.id} finished successfully`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message);
});

console.log("Worker started, waiting for jobs...");
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateExplanation({
  playerCards,
  dealerUpcard,
  userAction,
  correctAction,
  handType,
}: {
  playerCards: string[];
  dealerUpcard: string;
  userAction: string;
  correctAction: string;
  handType: string;
}): Promise<string> {
  const actionLabels: Record<string, string> = {
    H: "Hit",
    S: "Stand",
    D: "Double Down",
    P: "Split",
  };

  const prompt = `You are a blackjack basic strategy tutor. A student just made an incorrect decision and needs a clear, concise explanation of why the correct play is better.

Game state:
- Player's hand: ${playerCards.join(", ")} (${handType} hand)
- Dealer's upcard: ${dealerUpcard}
- Student chose: ${actionLabels[userAction] || userAction}
- Correct play: ${actionLabels[correctAction] || correctAction}

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
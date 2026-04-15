"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import PlayingCard from "@/components/PlayingCard";
import {
  generateHand,
  getAvailableActions,
  formatCard,
  ACTION_LABELS,
  type Card,
  type Action,
  type HandType,
} from "@/lib/basicStrategy";

type HandResult = {
  playerCards: [Card, Card];
  dealerUpcard: Card;
  userAction: Action;
  correctAction: Action;
  isCorrect: boolean;
  handType: HandType;
};

export default function PracticePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [playerCards, setPlayerCards] = useState<[Card, Card] | null>(null);
  const [dealerUpcard, setDealerUpcard] = useState<Card | null>(null);
  const [correctAction, setCorrectAction] = useState<Action | null>(null);
  const [handType, setHandType] = useState<HandType | null>(null);
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    userAction: Action;
    correctAction: Action;
  } | null>(null);
  const [history, setHistory] = useState<HandResult[]>([]);
  const [started, setStarted] = useState(false);
  const [practiceSessionId, setPracticeSessionId] = useState<string | null>(null);

  const startSession = useCallback(async () => {
    if (!session?.user) return;
    try {
      const res = await fetch("/api/sessions", { method: "POST" });
      const data = await res.json();
      setPracticeSessionId(data.id);
    } catch (err) {
      console.error("Failed to create session:", err);
    }
  }, [session]);

  const dealNewHand = useCallback(async () => {
    if (!practiceSessionId && session?.user) {
      await startSession();
    }
    const hand = generateHand();
    setPlayerCards(hand.playerCards);
    setDealerUpcard(hand.dealerUpcard);
    setCorrectAction(hand.correctAction);
    setHandType(hand.handType);
    setFeedback(null);
    setStarted(true);
  }, [practiceSessionId, session, startSession]);

  const handleAction = useCallback(
    async (action: Action) => {
      if (!correctAction || !playerCards || !dealerUpcard || !handType) return;

      const isCorrect = action === correctAction;
      const result: HandResult = {
        playerCards,
        dealerUpcard,
        userAction: action,
        correctAction,
        isCorrect,
        handType,
      };

      setFeedback({ isCorrect, userAction: action, correctAction });
      setHistory((prev) => [result, ...prev]);

      // Save to database if logged in
      if (practiceSessionId) {
        try {
          await fetch("/api/hands", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId: practiceSessionId,
              playerCards: playerCards.map((c) => `${c.rank}${c.suit}`),
              dealerUpcard: `${dealerUpcard.rank}${dealerUpcard.suit}`,
              handType,
              userAction: action,
              correctAction,
              isCorrect,
            }),
          });
        } catch (err) {
          console.error("Failed to save hand:", err);
        }
      }
    },
    [correctAction, playerCards, dealerUpcard, handType, practiceSessionId]
  );

  const totalHands = history.length;
  const correctCount = history.filter((h) => h.isCorrect).length;
  const accuracy = totalHands > 0 ? Math.round((correctCount / totalHands) * 100) : 0;
  const availableActions = playerCards ? getAvailableActions(playerCards) : [];

  // Redirect to login if not authenticated
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Blackjack Strategy Trainer
            </h1>
            <p className="text-gray-400 text-sm">
              Learn basic strategy through practice
            </p>
          </div>
          <div className="text-right text-sm text-gray-400">
            {session?.user?.email}
          </div>
        </div>

        {/* Score Bar */}
        {totalHands > 0 && (
          <div className="flex justify-center gap-8 mb-8 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold">{totalHands}</div>
              <div className="text-gray-400">Hands</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{correctCount}</div>
              <div className="text-gray-400">Correct</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{totalHands - correctCount}</div>
              <div className="text-gray-400">Wrong</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{accuracy}%</div>
              <div className="text-gray-400">Accuracy</div>
            </div>
          </div>
        )}

        {/* Game Area */}
        <div className="bg-emerald-900/40 border border-emerald-800/50 rounded-2xl p-8 mb-6">
          {!started ? (
            <div className="text-center py-12">
              <p className="text-gray-300 mb-6 text-lg">
                You&#39;ll be dealt a hand and shown the dealer&#39;s upcard.
                <br />
                Choose the correct basic strategy action.
              </p>
              <button
                onClick={dealNewHand}
                className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold px-8 py-3 rounded-lg text-lg transition-colors"
              >
                Start Practicing
              </button>
            </div>
          ) : (
            <>
              {/* Dealer Section */}
              <div className="text-center mb-8">
                <div className="text-xs uppercase tracking-widest text-gray-400 mb-3">
                  Dealer
                </div>
                <div className="flex justify-center gap-3">
                  {dealerUpcard && (
                    <>
                      <PlayingCard rank={dealerUpcard.rank} suit={dealerUpcard.suit} />
                      <PlayingCard rank="" suit="" hidden />
                    </>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-emerald-700/50 my-6" />

              {/* Player Section */}
              <div className="text-center mb-6">
                <div className="text-xs uppercase tracking-widest text-gray-400 mb-3">
                  Your Hand
                  {handType && (
                    <span className="ml-2 text-emerald-400">
                      ({handType === "pair" ? "Pair" : handType === "soft" ? "Soft" : "Hard"})
                    </span>
                  )}
                </div>
                <div className="flex justify-center gap-3">
                  {playerCards?.map((card, i) => (
                    <PlayingCard key={i} rank={card.rank} suit={card.suit} />
                  ))}
                </div>
              </div>

              {/* Feedback */}
              {feedback && (
                <div
                  className={`text-center p-4 rounded-lg mb-6 ${
                    feedback.isCorrect
                      ? "bg-green-900/50 border border-green-700"
                      : "bg-red-900/50 border border-red-700"
                  }`}
                >
                  {feedback.isCorrect ? (
                    <div className="text-green-300 font-bold text-lg">
                      ✓ Correct! {ACTION_LABELS[feedback.correctAction]} is right.
                    </div>
                  ) : (
                    <div>
                      <div className="text-red-300 font-bold text-lg">
                        ✗ Incorrect — you chose {ACTION_LABELS[feedback.userAction]}
                      </div>
                      <div className="text-gray-300 mt-1">
                        The correct play is{" "}
                        <span className="font-bold text-white">
                          {ACTION_LABELS[feedback.correctAction]}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              {!feedback ? (
                <div className="flex justify-center gap-3">
                  {availableActions.map((action) => (
                    <button
                      key={action}
                      onClick={() => handleAction(action)}
                      className="bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-gray-500 text-white font-semibold px-6 py-3 rounded-lg transition-colors min-w-[120px]"
                    >
                      {ACTION_LABELS[action]}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex justify-center">
                  <button
                    onClick={dealNewHand}
                    className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold px-8 py-3 rounded-lg transition-colors"
                  >
                    Next Hand →
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Recent History */}
        {history.length > 0 && (
          <div>
            <h2 className="text-sm uppercase tracking-widest text-gray-400 mb-3">
              Recent Hands
            </h2>
            <div className="space-y-2">
              {history.slice(0, 10).map((h, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between p-3 rounded-lg text-sm ${
                    h.isCorrect
                      ? "bg-green-900/20 border border-green-900/30"
                      : "bg-red-900/20 border border-red-900/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={h.isCorrect ? "text-green-400" : "text-red-400"}>
                      {h.isCorrect ? "✓" : "✗"}
                    </span>
                    <span className="text-gray-300">
                      {formatCard(h.playerCards[0])}, {formatCard(h.playerCards[1])}
                    </span>
                    <span className="text-gray-500">vs</span>
                    <span className="text-gray-300">{formatCard(h.dealerUpcard)}</span>
                  </div>
                  <div className="text-gray-400">
                    {h.isCorrect ? (
                      ACTION_LABELS[h.correctAction]
                    ) : (
                      <span>
                        <span className="text-red-400 line-through">
                          {ACTION_LABELS[h.userAction]}
                        </span>{" "}
                        → {ACTION_LABELS[h.correctAction]}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
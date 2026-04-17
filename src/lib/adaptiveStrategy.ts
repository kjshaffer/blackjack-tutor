import {
  randomCard,
  cardValue,
  getCorrectAction,
  type Card,
  type Action,
  type HandType,
} from "./basicStrategy";

type MasteryData = Record<string, { attempts: number; correct: number; accuracy: number }>;

/**
 * Pick which hand type to practice based on mastery data.
 * Lower accuracy = higher chance of being selected.
 * If no mastery data exists, picks uniformly at random.
 */
function pickHandType(mastery: MasteryData): HandType {
  const types: HandType[] = ["hard", "soft", "pair"];

  // Default weights if no data
  const weights = types.map((type) => {
    const data = mastery[type];
    if (!data || data.attempts < 3) {
      // Not enough data yet — give equal weight
      return 1;
    }
    // Invert accuracy so weaker areas get more weight
    // accuracy of 0.2 -> weight of 0.8, accuracy of 0.9 -> weight of 0.1
    return Math.max(1 - data.accuracy, 0.05);
  });

  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < types.length; i++) {
    random -= weights[i];
    if (random <= 0) return types[i];
  }

  return "hard"; // fallback
}

/**
 * Generate a hand of a specific type.
 * Keeps trying until we get the desired hand type.
 */
function generateHandOfType(targetType: HandType): {
  playerCards: [Card, Card];
  dealerUpcard: Card;
  correctAction: Action;
  handType: HandType;
} {
  // Max attempts to avoid infinite loop
  for (let i = 0; i < 100; i++) {
    let c1: Card, c2: Card;

    if (targetType === "pair") {
      // Force a pair
      c1 = randomCard();
      // Same rank for pair (or both 10-value)
      c2 = { rank: c1.rank, suit: ["♠", "♥", "♦", "♣"][Math.floor(Math.random() * 4)] };
    } else if (targetType === "soft") {
      // Force an ace + non-ace
      c1 = { rank: "A", suit: ["♠", "♥", "♦", "♣"][Math.floor(Math.random() * 4)] };
      do {
        c2 = randomCard();
      } while (c2.rank === "A" || cardValue(c1) + cardValue(c2) === 21); // avoid pair of aces and blackjack
    } else {
      // Hard hand: no aces, no pairs, no blackjack
      do {
        c1 = randomCard();
        c2 = randomCard();
      } while (
        c1.rank === "A" ||
        c2.rank === "A" ||
        c1.rank === c2.rank ||
        (cardValue(c1) === 10 && cardValue(c2) === 10)
      );
    }

    const playerCards: [Card, Card] = [c1, c2];
    const dealerUpcard = randomCard();
    const { action, handType } = getCorrectAction(playerCards, dealerUpcard);

    // Verify we got the right hand type
    if (handType === targetType) {
      return { playerCards, dealerUpcard, correctAction: action, handType };
    }
  }

  // Fallback: just generate any hand
  const c1 = randomCard();
  const c2 = randomCard();
  const playerCards: [Card, Card] = [c1, c2];
  const dealerUpcard = randomCard();
  const { action, handType } = getCorrectAction(playerCards, dealerUpcard);
  return { playerCards, dealerUpcard, correctAction: action, handType };
}

/**
 * Generate a hand adaptively based on user's mastery data.
 * Biases toward hand types the user struggles with.
 */
export function generateAdaptiveHand(mastery: MasteryData): {
  playerCards: [Card, Card];
  dealerUpcard: Card;
  correctAction: Action;
  handType: HandType;
} {
  const targetType = pickHandType(mastery);
  return generateHandOfType(targetType);
}
// Basic Strategy Lookup Table for Blackjack
// H = Hit, S = Stand, D = Double (hit if not allowed), P = Split

// Keys: player hand value (or pair label)
// Values: array of 10 actions indexed by dealer upcard (2,3,4,5,6,7,8,9,10,A)

const HARD: Record<number, string[]> = {
  //              2    3    4    5    6    7    8    9    10   A
  5:            ["H", "H", "H", "H", "H", "H", "H", "H", "H", "H"],
  6:            ["H", "H", "H", "H", "H", "H", "H", "H", "H", "H"],
  7:            ["H", "H", "H", "H", "H", "H", "H", "H", "H", "H"],
  8:            ["H", "H", "H", "H", "H", "H", "H", "H", "H", "H"],
  9:            ["H", "D", "D", "D", "D", "H", "H", "H", "H", "H"],
  10:           ["D", "D", "D", "D", "D", "D", "D", "D", "H", "H"],
  11:           ["D", "D", "D", "D", "D", "D", "D", "D", "D", "D"],
  12:           ["H", "H", "S", "S", "S", "H", "H", "H", "H", "H"],
  13:           ["S", "S", "S", "S", "S", "H", "H", "H", "H", "H"],
  14:           ["S", "S", "S", "S", "S", "H", "H", "H", "H", "H"],
  15:           ["S", "S", "S", "S", "S", "H", "H", "H", "H", "H"],
  16:           ["S", "S", "S", "S", "S", "H", "H", "H", "H", "H"],
  17:           ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S"],
  18:           ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S"],
  19:           ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S"],
  20:           ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S"],
  21:           ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S"],
};

// Soft hands: player has an Ace counted as 11
// Key is the OTHER card value (not the ace), so "soft 13" = A+2, key is 2
const SOFT: Record<number, string[]> = {
  //              2    3    4    5    6    7    8    9    10   A
  2:            ["H", "H", "H", "D", "D", "H", "H", "H", "H", "H"],  // A,2 (soft 13)
  3:            ["H", "H", "H", "D", "D", "H", "H", "H", "H", "H"],  // A,3 (soft 14)
  4:            ["H", "H", "D", "D", "D", "H", "H", "H", "H", "H"],  // A,4 (soft 15)
  5:            ["H", "H", "D", "D", "D", "H", "H", "H", "H", "H"],  // A,5 (soft 16)
  6:            ["H", "D", "D", "D", "D", "H", "H", "H", "H", "H"],  // A,6 (soft 17)
  7:            ["D", "D", "D", "D", "D", "S", "S", "H", "H", "H"],  // A,7 (soft 18)
  8:            ["S", "S", "S", "S", "D", "S", "S", "S", "S", "S"],  // A,8 (soft 19)
  9:            ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S"],  // A,9 (soft 20)
};

// Pair splitting
// Key is the card value of the pair
const PAIRS: Record<number, string[]> = {
  //              2    3    4    5    6    7    8    9    10   A
  2:            ["P", "P", "P", "P", "P", "P", "H", "H", "H", "H"],
  3:            ["P", "P", "P", "P", "P", "P", "H", "H", "H", "H"],
  4:            ["H", "H", "H", "P", "P", "H", "H", "H", "H", "H"],
  5:            ["D", "D", "D", "D", "D", "D", "D", "D", "H", "H"],  // Never split 5s, treat as hard 10
  6:            ["P", "P", "P", "P", "P", "H", "H", "H", "H", "H"],
  7:            ["P", "P", "P", "P", "P", "P", "H", "H", "H", "H"],
  8:            ["P", "P", "P", "P", "P", "P", "P", "P", "P", "P"],  // Always split 8s
  9:            ["P", "P", "P", "P", "P", "S", "P", "P", "S", "S"],
  10:           ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S"],  // Never split 10s
  11:           ["P", "P", "P", "P", "P", "P", "P", "P", "P", "P"],  // Always split Aces (value 11)
};

// Card definitions
const CARD_VALUES: Record<string, number> = {
  "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9,
  "10": 10, "J": 10, "Q": 10, "K": 10, "A": 11,
};

const SUITS = ["♠", "♥", "♦", "♣"] as const;
const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"] as const;

export type Card = {
  rank: string;
  suit: string;
};

export type HandType = "hard" | "soft" | "pair";
export type Action = "H" | "S" | "D" | "P";

export const ACTION_LABELS: Record<Action, string> = {
  H: "Hit",
  S: "Stand",
  D: "Double Down",
  P: "Split",
};

/** Get the numeric value of a card (Ace = 11) */
export function cardValue(card: Card): number {
  return CARD_VALUES[card.rank];
}

/** Deal a random card */
export function randomCard(): Card {
  const rank = RANKS[Math.floor(Math.random() * RANKS.length)];
  const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
  return { rank, suit };
}

/** Convert dealer upcard index: 2-10 map to 0-8, A maps to 9 */
function dealerIndex(card: Card): number {
  if (card.rank === "A") return 9;
  return cardValue(card) - 2;
}

/** Classify a two-card hand */
export function classifyHand(cards: [Card, Card]): {
  handType: HandType;
  handValue: number;
  softOther?: number; // the non-ace card value for soft hands
  pairValue?: number; // the card value for pairs
} {
  const [c1, c2] = cards;
  const v1 = cardValue(c1);
  const v2 = cardValue(c2);

  // Check for pair (same rank, or both are 10-value)
  if (c1.rank === c2.rank || (v1 === 10 && v2 === 10)) {
    // For 10-value pairs (10, J, Q, K), treat as pair of 10s
    const pairVal = v1 === 10 ? 10 : v1 === 11 ? 11 : v1;
    return { handType: "pair", handValue: v1 + v2, pairValue: pairVal };
  }

  // Check for soft hand (exactly one ace)
  if (v1 === 11 || v2 === 11) {
    const other = v1 === 11 ? v2 : v1;
    return { handType: "soft", handValue: 11 + other, softOther: other };
  }

  // Hard hand
  return { handType: "hard", handValue: v1 + v2 };
}

/** Look up the correct basic strategy action */
export function getCorrectAction(
  cards: [Card, Card],
  dealerUpcard: Card
): { action: Action; handType: HandType } {
  const { handType, handValue, softOther, pairValue } = classifyHand(cards);
  const dIdx = dealerIndex(dealerUpcard);

  let action: Action;

  if (handType === "pair" && pairValue !== undefined) {
    action = PAIRS[pairValue][dIdx] as Action;
    // If the pair table says don't split (not "P"), fall through to hard/soft
    if (action !== "P") {
      // Re-evaluate as hard or soft
      if (pairValue === 11) {
        // Pair of aces, but not splitting — treat as soft 12? 
        // This shouldn't happen since we always split aces, but just in case:
        action = SOFT[1]?.[dIdx] as Action ?? "H";
      } else {
        action = HARD[pairValue * 2]?.[dIdx] as Action ?? "H";
      }
      return { action, handType: "pair" };
    }
    return { action: "P", handType: "pair" };
  }

  if (handType === "soft" && softOther !== undefined) {
    if (softOther === 10) {
      return { action: "S", handType: "soft" }; // soft 21 = always stand
    }
    action = SOFT[softOther]?.[dIdx] as Action ?? "H";
    return { action, handType: "soft" };
  }

  // Hard hand
  const lookupValue = Math.min(Math.max(handValue, 5), 21);
  action = HARD[lookupValue]?.[dIdx] as Action ?? "H";
  return { action, handType: "hard" };
}

/** Generate a random hand scenario for practice */
export function generateHand(): {
  playerCards: [Card, Card];
  dealerUpcard: Card;
  correctAction: Action;
  handType: HandType;
} {
  let playerCards: [Card, Card];
  do {
    playerCards = [randomCard(), randomCard()];
  } while (cardValue(playerCards[0]) + cardValue(playerCards[1]) === 21);
  const dealerUpcard = randomCard();
  const { action, handType } = getCorrectAction(playerCards, dealerUpcard);

  return {
    playerCards,
    dealerUpcard,
    correctAction: action,
    handType,
  };
}

/** Get the available actions for a hand (pairs can split, others can't) */
export function getAvailableActions(cards: [Card, Card]): Action[] {
  const { handType } = classifyHand(cards);
  if (handType === "pair") {
    return ["H", "S", "D", "P"];
  }
  return ["H", "S", "D"];
}

/** Format a card for display, e.g. "A♠" or "10♥" */
export function formatCard(card: Card): string {
  return `${card.rank}${card.suit}`;
}
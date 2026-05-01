import type { Card } from "./types";

export function shuffle<T>(items: readonly T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function createDeck(cards: readonly Card[]): Card[] {
  return shuffle(cards);
}

export function drawNext(
  deck: readonly Card[],
  usedIds: ReadonlySet<number>
): { card: Card; nextDeck: Card[] } | null {
  for (let i = 0; i < deck.length; i++) {
    if (!usedIds.has(deck[i].id)) {
      const card = deck[i];
      const nextDeck = [...deck.slice(0, i), ...deck.slice(i + 1)];
      return { card, nextDeck };
    }
  }
  return null;
}

export function reshuffleIfEmpty(deck: Card[], allCards: readonly Card[]): Card[] {
  return deck.length === 0 ? createDeck(allCards) : deck;
}

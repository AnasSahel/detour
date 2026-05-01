export type Category =
  | "objet"
  | "animal"
  | "metier"
  | "lieu"
  | "action"
  | "nourriture"
  | "concept"
  | "loisir";

export type Card = {
  id: number;
  word: string;
  forbidden: string[];
  category: Category;
};

export type WordBank = {
  version: number;
  language: string;
  cards: Card[];
};

export type Team = {
  id: string;
  name: string;
  score: number;
};

export type RoundDuration = 30 | 60 | 90;
export type ForbiddenCount = 3 | 4 | 5;

export type GameSettings = {
  roundDurationSec: RoundDuration;
  targetScore: number;
  forbiddenCount: ForbiddenCount;
};

export type OutcomeKind = "guessed" | "skipped" | "fault";

export type RoundOutcome = {
  cardId: number;
  result: OutcomeKind;
};

export type GameStatus = "setup" | "playing" | "round-recap" | "finished";

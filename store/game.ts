import { create } from "zustand";
import {
  applyRoundToTeam,
  checkGameOver,
  createDeck,
  drawNext,
  nextTeamIndex,
  reshuffleIfEmpty,
  type Card,
  type GameSettings,
  type GameStatus,
  type OutcomeKind,
  type RoundOutcome,
  type Team,
} from "@/lib/game";

type GameState = {
  status: GameStatus;
  settings: GameSettings;
  cards: Card[];
  deck: Card[];
  usedIds: Set<number>;
  teams: Team[];
  currentTeamIndex: number;
  currentCard: Card | null;
  currentOutcomes: RoundOutcome[];
  winners: Team[];
  pausedSecondsLeft: number | null;

  startGame: (input: {
    cards: Card[];
    settings: GameSettings;
    teamNames: [string, string];
  }) => void;
  drawCard: () => void;
  recordOutcome: (result: OutcomeKind) => void;
  endRound: () => void;
  finalizeRound: (adjusted: RoundOutcome[]) => void;
  startNextRound: () => void;
  abandonGame: () => void;
  pauseRound: (secondsLeft: number) => void;
  consumePausedSeconds: () => void;
};

const emptyState = {
  status: "setup" as GameStatus,
  cards: [] as Card[],
  deck: [] as Card[],
  usedIds: new Set<number>(),
  teams: [] as Team[],
  currentTeamIndex: 0,
  currentCard: null as Card | null,
  currentOutcomes: [] as RoundOutcome[],
  winners: [] as Team[],
  pausedSecondsLeft: null as number | null,
};

export const useGame = create<GameState>()((set, get) => ({
  ...emptyState,
  settings: { roundDurationSec: 60, targetScore: 30, forbiddenCount: 5 },

  startGame: ({ cards, settings, teamNames }) => {
    const deck = createDeck(cards);
    const teams: Team[] = [
      { id: "team-0", name: teamNames[0], score: 0 },
      { id: "team-1", name: teamNames[1], score: 0 },
    ];
    const draw = drawNext(deck, new Set());
    set({
      ...emptyState,
      status: "playing",
      settings,
      cards,
      deck: draw ? draw.nextDeck : deck,
      teams,
      currentTeamIndex: 0,
      currentCard: draw?.card ?? null,
      currentOutcomes: [],
    });
  },

  drawCard: () => {
    const { deck, usedIds, cards } = get();
    const refilled = reshuffleIfEmpty(deck, cards);
    const draw = drawNext(refilled, usedIds);
    if (!draw) {
      set({ currentCard: null });
      return;
    }
    set({ currentCard: draw.card, deck: draw.nextDeck });
  },

  recordOutcome: (result) => {
    const { currentCard, currentOutcomes, usedIds } = get();
    if (!currentCard) return;
    const nextOutcomes = [...currentOutcomes, { cardId: currentCard.id, result }];
    const nextUsed = new Set(usedIds);
    nextUsed.add(currentCard.id);
    set({ currentOutcomes: nextOutcomes, usedIds: nextUsed });
    get().drawCard();
  },

  endRound: () => {
    set({ status: "round-recap", pausedSecondsLeft: null });
  },

  finalizeRound: (adjusted) => {
    const { teams, currentTeamIndex, settings, deck, usedIds, cards } = get();
    const updatedTeam = applyRoundToTeam(teams[currentTeamIndex], adjusted);
    const nextTeams = teams.map((t, i) => (i === currentTeamIndex ? updatedTeam : t));
    const overCheck = checkGameOver(nextTeams, settings.targetScore);
    if (overCheck.over) {
      set({
        teams: nextTeams,
        status: "finished",
        winners: overCheck.winners,
        currentCard: null,
        currentOutcomes: [],
      });
      return;
    }
    const refilled = reshuffleIfEmpty(deck, cards);
    const draw = drawNext(refilled, usedIds);
    set({
      teams: nextTeams,
      currentTeamIndex: nextTeamIndex(currentTeamIndex, nextTeams.length),
      currentOutcomes: [],
      status: "playing",
      deck: draw?.nextDeck ?? refilled,
      currentCard: draw?.card ?? null,
      pausedSecondsLeft: null,
    });
  },

  startNextRound: () => {
    const { deck, usedIds, cards } = get();
    const refilled = reshuffleIfEmpty(deck, cards);
    const draw = drawNext(refilled, usedIds);
    set({
      status: "playing",
      currentCard: draw?.card ?? null,
      deck: draw?.nextDeck ?? refilled,
      currentOutcomes: [],
    });
  },

  abandonGame: () => {
    set({ ...emptyState, settings: get().settings });
  },

  pauseRound: (secondsLeft) => {
    set({ pausedSecondsLeft: secondsLeft });
  },

  consumePausedSeconds: () => {
    set({ pausedSecondsLeft: null });
  },
}));

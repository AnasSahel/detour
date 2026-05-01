import type { RoundOutcome, Team } from "./types";

export const POINTS = {
  guessed: 1,
  skipped: 0,
  fault: -1,
} as const;

export function computeRoundScore(outcomes: readonly RoundOutcome[]): number {
  return outcomes.reduce((sum, o) => sum + POINTS[o.result], 0);
}

export function applyRoundToTeam(team: Team, outcomes: readonly RoundOutcome[]): Team {
  return { ...team, score: team.score + computeRoundScore(outcomes) };
}

export function nextTeamIndex(currentIndex: number, teamCount: number): number {
  return (currentIndex + 1) % teamCount;
}

export type GameOverResult =
  | { over: false }
  | { over: true; winners: Team[] };

export function checkGameOver(teams: readonly Team[], targetScore: number): GameOverResult {
  const reached = teams.filter((t) => t.score >= targetScore);
  if (reached.length === 0) return { over: false };
  const max = Math.max(...reached.map((t) => t.score));
  return { over: true, winners: reached.filter((t) => t.score === max) };
}

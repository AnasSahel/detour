export type TeamPalette = {
  primary: string;
  soft: string;
  textOnPrimary: string;
  textOnSoft: string;
};

export const TEAM_PALETTES: TeamPalette[] = [
  {
    primary: "#dc2626",
    soft: "#fee2e2",
    textOnPrimary: "#ffffff",
    textOnSoft: "#7f1d1d",
  },
  {
    primary: "#2563eb",
    soft: "#dbeafe",
    textOnPrimary: "#ffffff",
    textOnSoft: "#1e3a8a",
  },
];

export function paletteFor(teamIndex: number): TeamPalette {
  return TEAM_PALETTES[teamIndex % TEAM_PALETTES.length];
}

export type TeamPalette = {
  primary: string;
  soft: string;
  textOnPrimary: string;
  textOnSoft: string;
};

export const TEAM_PALETTES: TeamPalette[] = [
  {
    primary: "#7c3aed",
    soft: "#ede9fe",
    textOnPrimary: "#ffffff",
    textOnSoft: "#5b21b6",
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

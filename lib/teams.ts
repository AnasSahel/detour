export type TeamPalette = {
  primary: string;
  soft: string;
  textOnPrimary: string;
  textOnSoft: string;
};

export const TEAM_PALETTES: TeamPalette[] = [
  {
    primary: "#1f2937",
    soft: "#f3f4f6",
    textOnPrimary: "#ffffff",
    textOnSoft: "#1f2937",
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

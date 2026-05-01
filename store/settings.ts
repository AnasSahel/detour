import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { RoundDuration } from "@/lib/game";

type SettingsState = {
  roundDurationSec: RoundDuration;
  targetScore: number;
  teamNames: [string, string];
  setRoundDuration: (d: RoundDuration) => void;
  setTargetScore: (n: number) => void;
  setTeamName: (index: 0 | 1, name: string) => void;
};

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      roundDurationSec: 60,
      targetScore: 30,
      teamNames: ["Équipe rouge", "Équipe bleue"],
      setRoundDuration: (d) => set({ roundDurationSec: d }),
      setTargetScore: (n) => set({ targetScore: Math.max(5, Math.min(100, n)) }),
      setTeamName: (index, name) =>
        set((s) => {
          const next: [string, string] = [...s.teamNames] as [string, string];
          next[index] = name;
          return { teamNames: next };
        }),
    }),
    {
      name: "detour:settings",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

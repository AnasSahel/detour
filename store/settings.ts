import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ForbiddenCount, RoundDuration } from "@/lib/game";

type SettingsState = {
  roundDurationSec: RoundDuration;
  targetScore: number;
  forbiddenCount: ForbiddenCount;
  teamNames: [string, string];
  setRoundDuration: (d: RoundDuration) => void;
  setTargetScore: (n: number) => void;
  setForbiddenCount: (n: ForbiddenCount) => void;
  setTeamName: (index: 0 | 1, name: string) => void;
};

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      roundDurationSec: 60,
      targetScore: 30,
      forbiddenCount: 5,
      teamNames: ["Équipe noire", "Équipe bleue"],
      setRoundDuration: (d) => set({ roundDurationSec: d }),
      setTargetScore: (n) => set({ targetScore: Math.max(5, Math.min(100, n)) }),
      setForbiddenCount: (n) => set({ forbiddenCount: n }),
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
      version: 4,
      migrate: (persistedState, version) => {
        let state = persistedState as Partial<SettingsState> & Record<string, unknown>;
        if (version < 2) {
          state = { ...state, forbiddenCount: 5 };
        }
        if (version < 3) {
          const names = state.teamNames as [string, string] | undefined;
          if (names && names[0] === "Équipe rouge") {
            state = { ...state, teamNames: ["Équipe violette", names[1]] };
          }
        }
        if (version < 4) {
          const names = state.teamNames as [string, string] | undefined;
          if (names && names[0] === "Équipe violette") {
            state = { ...state, teamNames: ["Équipe noire", names[1]] };
          }
        }
        return state as SettingsState;
      },
    }
  )
);

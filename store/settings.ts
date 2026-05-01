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
      teamNames: ["Équipe rouge", "Équipe bleue"],
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
      version: 2,
      migrate: (persistedState, version) => {
        if (version < 2) {
          return { ...(persistedState as object), forbiddenCount: 5 };
        }
        return persistedState as SettingsState;
      },
    }
  )
);

import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { paletteFor } from "@/lib/teams";
import { useGame } from "@/store/game";

export default function Ready() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const currentTeamIndex = useGame((s) => s.currentTeamIndex);
  const currentTeam = useGame((s) => s.teams[s.currentTeamIndex]);
  const palette = paletteFor(currentTeamIndex);

  const [count, setCount] = useState(3);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    intervalRef.current = setInterval(() => {
      setCount((c) => Math.max(0, c - 1));
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (count === 0) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      router.replace("/play");
    } else if (count > 0 && count < 3) {
      Haptics.selectionAsync().catch(() => {});
    }
  }, [count, router]);

  if (!currentTeam) {
    return (
      <View
        style={[
          styles.root,
          {
            backgroundColor: "#fff",
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        <Text>Chargement…</Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: palette.soft,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <View style={styles.content}>
        <Text style={[styles.label, { color: palette.textOnSoft }]}>À toi</Text>
        <Text style={[styles.team, { color: palette.primary }]}>{currentTeam.name}</Text>
        <View style={[styles.countCircle, { backgroundColor: palette.primary }]}>
          <Text style={[styles.count, { color: palette.textOnPrimary }]}>
            {count > 0 ? count : "Go !"}
          </Text>
        </View>
        <Text style={[styles.hint, { color: palette.textOnSoft }]}>
          Passe le téléphone à la personne qui fait deviner.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24, gap: 16 },
  label: { fontSize: 18, fontWeight: "600", opacity: 0.8 },
  team: { fontSize: 44, fontWeight: "800", letterSpacing: -1, textAlign: "center", marginBottom: 24 },
  countCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  count: { fontSize: 88, fontWeight: "900", letterSpacing: -2 },
  hint: { fontSize: 14, opacity: 0.7, textAlign: "center", marginTop: 24, paddingHorizontal: 24 },
});

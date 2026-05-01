import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { paletteFor } from "@/lib/teams";
import { useGame } from "@/store/game";

export default function Scoreboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const teams = useGame((s) => s.teams);
  const winners = useGame((s) => s.winners);
  const abandon = useGame((s) => s.abandonGame);

  const winnerIds = new Set(winners.map((w) => w.id));
  const tied = winners.length > 1;

  const onRestart = () => {
    abandon();
    router.replace("/setup");
  };

  const onHome = () => {
    abandon();
    router.replace("/");
  };

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
      ]}
    >
      <View style={styles.headline}>
        <Text style={styles.headlineLabel}>{tied ? "Égalité !" : "Victoire de"}</Text>
        <Text style={styles.headlineName}>
          {winners.map((w) => w.name).join(" & ")}
        </Text>
      </View>

      <View style={styles.scores}>
        {teams.map((t, i) => {
          const isWinner = winnerIds.has(t.id);
          const palette = paletteFor(i);
          return (
            <View
              key={t.id}
              style={[
                styles.scoreRow,
                {
                  backgroundColor: isWinner ? palette.primary : palette.soft,
                  borderColor: palette.primary,
                  borderWidth: isWinner ? 0 : 2,
                },
              ]}
            >
              <Text
                style={[
                  styles.scoreName,
                  { color: isWinner ? palette.textOnPrimary : palette.textOnSoft },
                ]}
              >
                {t.name}
              </Text>
              <Text
                style={[
                  styles.scoreValue,
                  { color: isWinner ? palette.textOnPrimary : palette.textOnSoft },
                ]}
              >
                {t.score}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.actions}>
        <Pressable style={[styles.btn, styles.btnPrimary]} onPress={onRestart}>
          <Text style={styles.btnPrimaryText}>Rejouer</Text>
        </Pressable>
        <Pressable style={[styles.btn, styles.btnGhost]} onPress={onHome}>
          <Text style={styles.btnGhostText}>Retour à l&apos;accueil</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 24, backgroundColor: "#fff", justifyContent: "space-between" },
  headline: { alignItems: "center", marginTop: 24 },
  headlineLabel: { fontSize: 18, color: "#888" },
  headlineName: { fontSize: 40, fontWeight: "800", color: "#111", marginTop: 8, textAlign: "center" },
  scores: { gap: 12 },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingVertical: 20,
    borderRadius: 18,
  },
  scoreName: { fontSize: 20, fontWeight: "800" },
  scoreValue: { fontSize: 28, fontWeight: "900" },
  actions: { gap: 12 },
  btn: { paddingVertical: 18, borderRadius: 16, alignItems: "center" },
  btnPrimary: { backgroundColor: "#111" },
  btnPrimaryText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  btnGhost: { borderWidth: 1, borderColor: "#ddd" },
  btnGhostText: { color: "#111", fontSize: 16, fontWeight: "600" },
});

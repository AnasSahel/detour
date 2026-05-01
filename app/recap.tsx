import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { computeRoundScore, type OutcomeKind, type RoundOutcome } from "@/lib/game";
import { paletteFor } from "@/lib/teams";
import { useGame } from "@/store/game";

const KINDS: OutcomeKind[] = ["guessed", "skipped", "fault"];
const KIND_LABEL: Record<OutcomeKind, string> = {
  guessed: "Trouvé",
  skipped: "Passé",
  fault: "Faute",
};
const KIND_COLOR: Record<OutcomeKind, string> = {
  guessed: "#16a34a",
  skipped: "#6b7280",
  fault: "#dc2626",
};

export default function Recap() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const status = useGame((s) => s.status);
  const cards = useGame((s) => s.cards);
  const currentOutcomes = useGame((s) => s.currentOutcomes);
  const currentTeamIndex = useGame((s) => s.currentTeamIndex);
  const currentTeam = useGame((s) => s.teams[s.currentTeamIndex]);
  const finalizeRound = useGame((s) => s.finalizeRound);
  const winners = useGame((s) => s.winners);
  const palette = paletteFor(currentTeamIndex);

  const [outcomes, setOutcomes] = useState<RoundOutcome[]>(currentOutcomes);

  const cardsById = useMemo(() => {
    const m = new Map<number, (typeof cards)[number]>();
    cards.forEach((c) => m.set(c.id, c));
    return m;
  }, [cards]);

  const score = computeRoundScore(outcomes);

  if (status === "finished") {
    return (
      <View style={[styles.root, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.winnerBox}>
          <Text style={styles.winnerLabel}>
            {winners.length > 1 ? "Égalité !" : "Victoire de"}
          </Text>
          <Text style={styles.winnerName}>{winners.map((w) => w.name).join(" & ")}</Text>
        </View>
      </View>
    );
  }

  const cycleOutcome = (idx: number) => {
    setOutcomes((prev) =>
      prev.map((o, i) => {
        if (i !== idx) return o;
        const next = KINDS[(KINDS.indexOf(o.result) + 1) % KINDS.length];
        return { ...o, result: next };
      })
    );
  };

  const onValidate = () => {
    finalizeRound(outcomes);
    const newStatus = useGame.getState().status;
    if (newStatus === "finished") {
      router.replace("/scoreboard");
    } else {
      router.replace("/ready");
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 12 }]}>
      <View style={styles.header}>
        <Text style={[styles.teamName, { color: palette.primary }]}>{currentTeam?.name}</Text>
        <Text
          style={[
            styles.scoreBadge,
            { color: palette.textOnPrimary, backgroundColor: palette.primary },
          ]}
        >
          {score >= 0 ? `+${score}` : score}
        </Text>
      </View>
      <Text style={styles.hint}>Touchez une carte pour corriger le résultat.</Text>

      <ScrollView style={styles.list} contentContainerStyle={{ paddingBottom: 16 }}>
        {outcomes.length === 0 ? (
          <Text style={styles.empty}>Aucune carte jouée pendant cette manche.</Text>
        ) : (
          outcomes.map((o, idx) => {
            const card = cardsById.get(o.cardId);
            return (
              <Pressable key={`${o.cardId}-${idx}`} style={styles.row} onPress={() => cycleOutcome(idx)}>
                <Text style={styles.rowWord}>{card?.word ?? `#${o.cardId}`}</Text>
                <View style={[styles.kindBadge, { backgroundColor: KIND_COLOR[o.result] }]}>
                  <Text style={styles.kindBadgeText}>{KIND_LABEL[o.result]}</Text>
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>

      <Pressable style={[styles.validateBtn, { backgroundColor: palette.primary }]} onPress={onValidate}>
        <Text style={[styles.validateText, { color: palette.textOnPrimary }]}>
          Valider et passer à l&apos;équipe suivante
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 20, backgroundColor: "#fff" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  teamName: { fontSize: 26, fontWeight: "900", letterSpacing: -0.5 },
  scoreBadge: { fontSize: 22, fontWeight: "800", paddingHorizontal: 16, paddingVertical: 6, borderRadius: 999 },
  hint: { fontSize: 13, color: "#888", marginTop: 6, marginBottom: 12 },
  list: { flex: 1 },
  empty: { color: "#888", fontStyle: "italic", marginTop: 20 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  rowWord: { fontSize: 18, fontWeight: "600", color: "#111", flex: 1 },
  kindBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  kindBadgeText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  validateBtn: { paddingVertical: 18, borderRadius: 16, alignItems: "center" },
  validateText: { fontSize: 16, fontWeight: "800" },
  winnerBox: { flex: 1, justifyContent: "center", alignItems: "center" },
  winnerLabel: { fontSize: 18, color: "#888", marginBottom: 8 },
  winnerName: { fontSize: 40, fontWeight: "800", color: "#111" },
});

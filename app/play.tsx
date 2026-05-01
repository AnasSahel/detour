import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { paletteFor } from "@/lib/teams";
import { useGame } from "@/store/game";

export default function Play() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const status = useGame((s) => s.status);
  const settings = useGame((s) => s.settings);
  const currentCard = useGame((s) => s.currentCard);
  const currentTeamIndex = useGame((s) => s.currentTeamIndex);
  const currentTeam = useGame((s) => s.teams[s.currentTeamIndex]);
  const recordOutcome = useGame((s) => s.recordOutcome);
  const endRound = useGame((s) => s.endRound);

  const palette = paletteFor(currentTeamIndex);
  const [secondsLeft, setSecondsLeft] = useState<number>(settings.roundDurationSec);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progress = useRef(new Animated.Value(1)).current;

  // Reset timer + animation when entering a new round
  useEffect(() => {
    if (status !== "playing") return;
    setSecondsLeft(settings.roundDurationSec);
    progress.setValue(1);
    Animated.timing(progress, {
      toValue: 0,
      duration: settings.roundDurationSec * 1000,
      useNativeDriver: false,
    }).start();
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [status, settings.roundDurationSec, progress]);

  // Side effects driven by the timer (haptics + end of round)
  useEffect(() => {
    if (status !== "playing") return;
    if (secondsLeft === 0) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      endRound();
      router.replace("/recap");
      return;
    }
    if (secondsLeft <= 5) {
      Haptics.selectionAsync().catch(() => {});
    }
  }, [secondsLeft, status, endRound, router]);

  const onResult = (kind: "guessed" | "skipped" | "fault") => {
    if (kind === "guessed") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } else if (kind === "fault") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    recordOutcome(kind);
  };

  const onAbandon = () => {
    Alert.alert("Quitter la manche ?", "La manche en cours sera perdue.", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Quitter",
        style: "destructive",
        onPress: () => {
          if (intervalRef.current) clearInterval(intervalRef.current);
          router.replace("/");
        },
      },
    ]);
  };

  if (!currentCard || !currentTeam) {
    return (
      <View
        style={[
          styles.root,
          {
            backgroundColor: palette.soft,
            paddingTop: insets.top + 12,
            paddingBottom: insets.bottom + 12,
          },
        ]}
      >
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Chargement…</Text>
        </View>
      </View>
    );
  }

  const lowTime = secondsLeft <= 10;

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: palette.soft,
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 12,
        },
      ]}
    >
      <View style={styles.header}>
        <Pressable onPress={onAbandon} hitSlop={12}>
          <Text style={[styles.headerLink, { color: palette.textOnSoft }]}>Quitter</Text>
        </Pressable>
        <View style={[styles.teamPill, { backgroundColor: palette.primary }]}>
          <Text style={[styles.teamPillText, { color: palette.textOnPrimary }]}>
            {currentTeam.name}
          </Text>
        </View>
        <Text
          style={[
            styles.timer,
            { color: palette.textOnSoft },
            lowTime && styles.timerLow,
          ]}
        >
          {secondsLeft}s
        </Text>
      </View>

      <View style={styles.timerTrack}>
        <Animated.View
          style={[
            styles.timerFill,
            {
              backgroundColor: lowTime ? "#dc2626" : palette.primary,
              width: progress.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
            },
          ]}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.category}>{currentCard.category}</Text>
        <Text style={styles.word} numberOfLines={2} adjustsFontSizeToFit>
          {currentCard.word}
        </Text>
        <View style={styles.divider} />
        <Text style={styles.forbiddenLabel}>Interdits</Text>
        <View style={styles.forbiddenList}>
          {currentCard.forbidden.map((w) => (
            <Text key={w} style={styles.forbiddenItem}>
              • {w}
            </Text>
          ))}
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={[styles.btn, styles.btnFault]}
          onPress={() => onResult("fault")}
        >
          <Text style={styles.btnText}>Faute</Text>
          <Text style={styles.btnSub}>−1</Text>
        </Pressable>
        <Pressable
          style={[styles.btn, styles.btnSkip]}
          onPress={() => onResult("skipped")}
        >
          <Text style={styles.btnText}>Passer</Text>
          <Text style={styles.btnSub}>0</Text>
        </Pressable>
        <Pressable
          style={[styles.btn, styles.btnGuessed]}
          onPress={() => onResult("guessed")}
        >
          <Text style={styles.btnText}>Trouvé</Text>
          <Text style={styles.btnSub}>+1</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 16 },
  empty: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { color: "#888" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  headerLink: { fontSize: 14, fontWeight: "600", opacity: 0.7 },
  teamPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999 },
  teamPillText: { fontWeight: "800", fontSize: 14 },
  timer: { fontSize: 22, fontWeight: "800", minWidth: 60, textAlign: "right" },
  timerLow: { color: "#dc2626" },
  timerTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(0,0,0,0.08)",
    marginHorizontal: 4,
    marginTop: 12,
    overflow: "hidden",
  },
  timerFill: { height: "100%", borderRadius: 3 },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 28,
    padding: 32,
    marginVertical: 16,
    flex: 1,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  category: {
    fontSize: 12,
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 8,
    fontWeight: "700",
  },
  word: { fontSize: 56, fontWeight: "900", color: "#111", letterSpacing: -1.5 },
  divider: { height: 1, backgroundColor: "#e5e7eb", marginVertical: 24 },
  forbiddenLabel: {
    fontSize: 12,
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 12,
    fontWeight: "700",
  },
  forbiddenList: { gap: 10 },
  forbiddenItem: { fontSize: 20, color: "#dc2626", fontWeight: "700" },
  actions: { flexDirection: "row", gap: 8 },
  btn: {
    flex: 1,
    paddingVertical: 22,
    borderRadius: 18,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  btnFault: { backgroundColor: "#dc2626" },
  btnSkip: { backgroundColor: "#6b7280" },
  btnGuessed: { backgroundColor: "#16a34a" },
  btnText: { color: "#fff", fontSize: 17, fontWeight: "800" },
  btnSub: { color: "#fff", fontSize: 12, opacity: 0.85, marginTop: 2 },
});

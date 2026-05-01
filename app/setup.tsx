import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import wordBank from "@/data/words.fr.json";
import type { Card, ForbiddenCount, RoundDuration, WordBank } from "@/lib/game";
import { TEAM_PALETTES } from "@/lib/teams";
import { useGame } from "@/store/game";
import { useSettings } from "@/store/settings";

const DURATIONS: RoundDuration[] = [30, 60, 90];
const TARGETS = [15, 30, 50];
const FORBIDDEN_COUNTS: ForbiddenCount[] = [3, 4, 5];

export default function Setup() {
  const router = useRouter();
  const {
    roundDurationSec,
    targetScore,
    forbiddenCount,
    teamNames,
    setRoundDuration,
    setTargetScore,
    setForbiddenCount,
    setTeamName,
  } = useSettings();
  const startGame = useGame((s) => s.startGame);

  const onStart = () => {
    const cards = (wordBank as WordBank).cards as Card[];
    startGame({
      cards,
      settings: { roundDurationSec, targetScore, forbiddenCount },
      teamNames,
    });
    router.replace("/ready");
  };

  return (
    <ScrollView contentContainerStyle={styles.root}>
      <Section title="Équipes">
        <TeamInput
          label="Équipe 1"
          value={teamNames[0]}
          onChange={(t) => setTeamName(0, t)}
          accent={TEAM_PALETTES[0].primary}
        />
        <TeamInput
          label="Équipe 2"
          value={teamNames[1]}
          onChange={(t) => setTeamName(1, t)}
          accent={TEAM_PALETTES[1].primary}
        />
      </Section>

      <Section title="Durée d'une manche">
        <Segmented
          options={DURATIONS.map((d) => ({ value: d, label: `${d} s` }))}
          value={roundDurationSec}
          onChange={setRoundDuration}
        />
      </Section>

      <Section title="Score à atteindre">
        <Segmented
          options={TARGETS.map((t) => ({ value: t, label: `${t}` }))}
          value={targetScore}
          onChange={setTargetScore}
        />
      </Section>

      <Section title="Mots interdits affichés">
        <Segmented
          options={FORBIDDEN_COUNTS.map((c) => ({ value: c, label: `${c}` }))}
          value={forbiddenCount}
          onChange={setForbiddenCount}
        />
      </Section>

      <Pressable style={styles.startBtn} onPress={onStart}>
        <Text style={styles.startText}>Démarrer la partie</Text>
      </Pressable>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={{ gap: 10 }}>{children}</View>
    </View>
  );
}

function TeamInput({
  label,
  value,
  onChange,
  accent,
}: {
  label: string;
  value: string;
  onChange: (s: string) => void;
  accent: string;
}) {
  return (
    <View style={[styles.teamRow, { borderLeftColor: accent }]}>
      <Text style={styles.teamLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        style={styles.teamInput}
        placeholder="Nom de l'équipe"
        maxLength={24}
      />
    </View>
  );
}

function Segmented<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.segmented}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={String(opt.value)}
            style={[styles.segment, active && styles.segmentActive]}
            onPress={() => onChange(opt.value)}
          >
            <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { padding: 20, gap: 28 },
  section: { gap: 12 },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: "#666", textTransform: "uppercase", letterSpacing: 0.5 },
  teamRow: { borderLeftWidth: 5, paddingLeft: 14, paddingVertical: 10 },
  teamLabel: { fontSize: 12, color: "#888", marginBottom: 4, fontWeight: "700", letterSpacing: 0.3 },
  teamInput: { fontSize: 20, fontWeight: "700", color: "#111", paddingVertical: 4 },
  segmented: { flexDirection: "row", gap: 8 },
  segment: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: "#ddd", alignItems: "center" },
  segmentActive: { backgroundColor: "#111", borderColor: "#111" },
  segmentText: { fontSize: 16, fontWeight: "600", color: "#444" },
  segmentTextActive: { color: "#fff" },
  startBtn: { backgroundColor: "#111", paddingVertical: 18, borderRadius: 16, alignItems: "center", marginTop: 12 },
  startText: { color: "#fff", fontSize: 18, fontWeight: "700" },
});

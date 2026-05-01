import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGame } from "@/store/game";

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const status = useGame((s) => s.status);
  const teams = useGame((s) => s.teams);
  const abandon = useGame((s) => s.abandonGame);

  const hasGameInProgress = status === "playing" || status === "round-recap";

  const onResume = () => router.push(status === "playing" ? "/play" : "/recap");
  const onNew = () => {
    abandon();
    router.push("/setup");
  };

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
      ]}
    >
      <View style={styles.hero}>
        <Text style={styles.title}>Détour</Text>
        <Text style={styles.tagline}>Fais deviner sans dire l&apos;interdit.</Text>
      </View>

      <View style={styles.actions}>
        {hasGameInProgress ? (
          <>
            <Pressable style={[styles.btn, styles.btnPrimary]} onPress={onResume}>
              <Text style={styles.btnPrimaryText}>Reprendre la partie</Text>
              <Text style={styles.btnSubtext}>
                {teams.map((t) => `${t.name} ${t.score}`).join(" · ")}
              </Text>
            </Pressable>
            <Pressable style={[styles.btn, styles.btnGhost]} onPress={onNew}>
              <Text style={styles.btnGhostText}>Nouvelle partie</Text>
            </Pressable>
          </>
        ) : (
          <Pressable
            style={[styles.btn, styles.btnPrimary]}
            onPress={() => router.push("/setup")}
          >
            <Text style={styles.btnPrimaryText}>Nouvelle partie</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 24,
    backgroundColor: "#fff",
  },
  hero: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 64,
    fontWeight: "800",
    color: "#111",
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
  actions: {
    gap: 12,
  },
  btn: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
  },
  btnPrimary: {
    backgroundColor: "#111",
  },
  btnPrimaryText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  btnSubtext: {
    color: "#bbb",
    fontSize: 13,
    marginTop: 4,
  },
  btnGhost: {
    borderWidth: 1,
    borderColor: "#ddd",
  },
  btnGhostText: {
    color: "#111",
    fontSize: 16,
    fontWeight: "600",
  },
});

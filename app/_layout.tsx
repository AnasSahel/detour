import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#fff" },
          headerTitleStyle: { fontWeight: "700" },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: "#fff" },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="setup" options={{ title: "Nouvelle partie" }} />
        <Stack.Screen name="ready" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="play" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="recap" options={{ title: "Fin de manche", headerBackVisible: false }} />
        <Stack.Screen name="scoreboard" options={{ title: "Partie terminée", headerBackVisible: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}

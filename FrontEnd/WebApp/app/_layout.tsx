import { Stack } from "expo-router";
import "./global.css";
import { useFonts } from "expo-font";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Gotham-Ultra": require("../assets/fonts/Gotham-Ultra.otf"),
    "Gotham-Bold": require("../assets/fonts/Gotham-Bold.otf"),
  });

  if (!fontsLoaded) return null;

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
      {/* Future implementations */}
    </Stack>
  );
}

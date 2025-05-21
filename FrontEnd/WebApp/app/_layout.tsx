import { Stack } from "expo-router";
import "./global.css";
import { useFonts } from "expo-font";

export default function RootLayout() {
  // Load custom fonts used throughout the app
  const [fontsLoaded] = useFonts({
    "Gotham-Ultra": require("../assets/fonts/Gotham-Ultra.otf"),
    "Gotham-Bold": require("../assets/fonts/Gotham-Bold.otf"),
  });

  // Wait until fonts are loaded before rendering the app
  if (!fontsLoaded) return null;

  // Define screen stack configuration
  return (
    <Stack>
      {/* Login page */}
      <Stack.Screen name="index" options={{ headerShown: false }} />

      {/* Signup page for Operatori Comunali */}
      <Stack.Screen name="signup" options={{ headerShown: false }} />

      {/* Dashboard view for authenticated operators */}
      <Stack.Screen name="operatore/dashboard" options={{ headerShown: false }} />
      
      {/* Token generation page for Operatori Comunali */}
      <Stack.Screen name="operatore/token" options={{ headerShown: false }} />
      
      {/* Fallback page for undefined routes */}
      <Stack.Screen name="+not-found" />

      {/* Future screen registrations can go here */}
    </Stack>
  );
}

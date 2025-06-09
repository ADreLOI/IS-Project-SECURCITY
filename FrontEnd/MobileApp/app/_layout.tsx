import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack } from "expo-router";
import './global.css';
import { useFonts } from 'expo-font';
import React from 'react';
import { CittadinoProvider } from './context/cittadinoContext'; 

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Gotham-Ultra': require('../assets/fonts/Gotham-Ultra.otf'),
    'Gotham-Bold': require('../assets/fonts/Gotham-Bold.otf'),
  });

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <CittadinoProvider>
        <Stack> 
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="screens/(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="screens/login" options={{ headerShown: false }} />
        </Stack>
      </CittadinoProvider>
    </GestureHandlerRootView>
  );
}

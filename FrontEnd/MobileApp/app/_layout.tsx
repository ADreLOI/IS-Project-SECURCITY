import { Stack } from "expo-router";
import './global.css';
import { useFonts } from 'expo-font';
import React from 'react';
import { TouchableOpacity, Image, Text } from 'react-native';

interface CustomButtonProps {
  title: string;
  imageSource: any;
  onPress: () => void;
}

export default function RootLayout() 
{
  const [fontsLoaded] = useFonts({
    'Gotham-Ultra': require('../assets/fonts/Gotham-Ultra.otf'),
    'Gotham-Bold': require('../assets/fonts/Gotham-Bold.otf'),
  });

  if (!fontsLoaded) return null;
  return <Stack> 
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="screens/home" options={{ headerShown: false }} />
          <Stack.Screen name="screens/login" options={{ headerShown: false }} />
  </Stack>;
}

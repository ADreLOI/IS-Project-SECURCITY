import { Tabs } from "expo-router";
import React from "react";
import { useFonts } from "expo-font";
import { Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';

export default function TabsLayout() {
  const [fontsLoaded] = useFonts({
    'Gotham-Ultra': require('../../../assets/fonts/Gotham-Ultra.otf'),
    'Gotham-Bold': require('../../../assets/fonts/Gotham-Bold.otf'),
  });

  if (!fontsLoaded) return null;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#0AA696",
        tabBarLabelStyle: {
          fontFamily: "Gotham-Bold",
          fontSize: 12,
        },
        tabBarStyle: {
          backgroundColor: "#011126",
          borderTopWidth: 0,
          height: 60,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="segnalazioni"
        options={{
          title: "Segnalazioni",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="pluscircle" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profilo",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

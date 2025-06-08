import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { HeaderTitle } from '@react-navigation/elements'
import { Stack } from 'expo-router'

const HomeLayout = () => 
    {
  return (
    <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="getAutobus" options={{ headerShown: false }} />
    </Stack>
  );
}

export default HomeLayout

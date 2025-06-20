import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { HeaderTitle } from '@react-navigation/elements'
import { Stack } from 'expo-router'

const StackLayout = () => 
    {
  return (
    <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="editProfile" options={{ headerShown: false }} />
    </Stack>
  );
}

export default StackLayout

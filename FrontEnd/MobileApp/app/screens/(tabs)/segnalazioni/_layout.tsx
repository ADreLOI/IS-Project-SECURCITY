import { StyleSheet, Text, View, } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

const SegnalazioniLayout = () => 
{
  return (
     <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="details" options={{ headerShown: false }} />
    </Stack>
  )
}

export default SegnalazioniLayout

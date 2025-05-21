import { Platform, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Animated, { FadeIn } from 'react-native-reanimated';
import MapView from 'react-native-maps';
import { AppleMaps, GoogleMaps } from "expo-maps"



export default function App() {
  if (Platform.OS === 'ios') {
    return <AppleMaps.View style={{ flex: 1 }} />;
  } else if (Platform.OS === 'android') {
    return <GoogleMaps.View 
    style={{ flex: 1 }} 
    cameraPosition={{
      coordinates: {
        latitude: 46.074779,
        longitude: 11.121749
      },
      zoom:12
    }}
    />;
  } else {
    return <Text>Maps are only available on Android and iOS</Text>;
  }
}

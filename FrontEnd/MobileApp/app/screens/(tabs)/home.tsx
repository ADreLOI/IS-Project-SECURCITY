import { Platform, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Animated, { FadeIn } from 'react-native-reanimated';
import { AppleMaps, GoogleMaps } from "expo-maps"
import { locationList } from "@/LocationList";
import {useState } from "react";
import { Tabs } from 'expo-router';
import { HeaderShownContext } from '@react-navigation/elements';

export default function App() {
  const [locationIndex, setLocationIndex] = useState(0);
  
  const  cameraPosition={
      coordinates: {
        latitude: 46.074779,
        longitude: 11.121749
      },
      zoom:12
    };

  if (Platform.OS === 'ios') {
    return <AppleMaps.View 
    style={{ flex: 1 }} 
    cameraPosition={cameraPosition}
    />;
  } else if (Platform.OS === 'android') {
    return <GoogleMaps.View 
    style={{ flex: 1 }} 
    cameraPosition={cameraPosition}
    />;
  } else {
    return <Text>Maps are only available on Android and iOS</Text>;
  }
}


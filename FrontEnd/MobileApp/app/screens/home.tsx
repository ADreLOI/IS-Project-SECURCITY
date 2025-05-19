import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Animated, { FadeIn } from 'react-native-reanimated';


const home = () => {
  return (
    <SafeAreaView className="flex-1 justify-center items-center bg-[#111126] px-6">
        <Animated.View entering={FadeIn.duration(500)}>
      <Text className="text-3xl text-blue-500">La mia Home</Text>
      </Animated.View>    
    </SafeAreaView>
  )
}

export default home

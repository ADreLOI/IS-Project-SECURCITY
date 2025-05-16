import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Animated, { FadeIn, SlideInLeft } from 'react-native-reanimated';
import React from 'react'

const login = () => {
  return (
    <SafeAreaView className="flex-1 justify-center items-center bg-[#111126] px-6">
            <Animated.View entering={SlideInLeft.duration(500)}>
          <Text className="text-3xl text-blue-500">Login</Text>
          </Animated.View>    
      </SafeAreaView>
  )
}

export default login

const styles = StyleSheet.create({})
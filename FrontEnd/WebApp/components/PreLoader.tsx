// PreLoader.tsx
import React, { useEffect } from "react";
import { View, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

export default function PreLoader() {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 1200,
        easing: Easing.linear,
      }),
      -1 // repeat forever
    );
  }, []);

  const rotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View className="flex-1 justify-center items-center bg-[#011126]">
      <View className="flex-row items-center">
        <Text className="text-5xl text-white font-GothamUltra">SECUR</Text>

        {/* ✅ La C ruota dentro un Animated.View */}
        <Animated.View style={rotateStyle}>
          <Text className="text-5xl text-[#0AA696] font-GothamUltra">C</Text>
        </Animated.View>

        <Text className="text-5xl text-white font-GothamUltra">ITY</Text>
      </View>
    </View>
  );
}

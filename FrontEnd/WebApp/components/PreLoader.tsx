import React, { useEffect } from "react";
import { View, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

// This component displays an animated loading screen with the rotating "C" in "SECURCITY"
export default function PreLoader() {
  // Shared value used to control the rotation angle
  const rotation = useSharedValue(0);

  useEffect(() => {
    // Start infinite rotation animation
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 1200,
        easing: Easing.linear,
      }),
      -1 // -1 means repeat forever
    );
  }, []);

  // Animated style to apply rotation transform
  const rotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View className="flex-1 justify-center items-center bg-[#011126]">
      <View className="flex-row items-center">
        {/* Static parts of the logo */}
        <Text className="text-5xl text-white font-GothamUltra">SECUR</Text>

        {/* Rotating "C" inside an Animated.View */}
        <Animated.View style={rotateStyle}>
          <Text className="text-5xl text-[#0AA696] font-GothamUltra">C</Text>
        </Animated.View>

        <Text className="text-5xl text-white font-GothamUltra">ITY</Text>
      </View>
    </View>
  );
}

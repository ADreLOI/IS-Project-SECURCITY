// Custom hook to create an infinite rotation animation using Reanimated

import {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useEffect } from "react";

export function useRotationAnimation() {
  // Shared animated value for the rotation angle (in degrees)
  const rotation = useSharedValue(0);

  useEffect(() => {
    // Start an infinite rotation loop (0 → 360 degrees)
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 1200, // Full rotation every 1.2 seconds
        easing: Easing.linear, // Constant speed
      }),
      -1 // -1 = infinite repetition
    );
  }, []);

  // Return the animated style that can be applied to a component
  return useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));
}

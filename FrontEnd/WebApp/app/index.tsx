// app/index.tsx — Login page with working animated rotating C
import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { jwtDecode } from "jwt-decode";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

interface JWTPayload {
  exp: number;
  [key: string]: any;
}

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const router = useRouter();

  // Rotazione C animata
  const rotation = useSharedValue(0);
  const rotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  useEffect(() => {
    // Avvia rotazione infinita
    rotation.value = withRepeat(
      withTiming(360, { duration: 1200, easing: Easing.linear }),
      -1
    );
  }, []);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decoded = jwtDecode<JWTPayload>(token);
          const now = Math.floor(Date.now() / 1000);
          if (decoded.exp > now) {
            setIsAuthenticated(true);
            setIsLoading(false);
            router.push("/operatore/dashboard");
            return;
          } else {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
          }
        } catch (err) {
          console.error("Invalid token:", err);
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const handleLogin = async () => {
    if (!username || !password) {
      setErrorMessage("All fields are required.");
      return;
    }

    setIsLoggingIn(true);

    try {
      const response = await fetch(
        "http://localhost:3000/api/v1/operatoreComunale/login-operatore",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        setTimeout(() => router.push("/operatore/dashboard"), 1500);
      } else {
        setErrorMessage(data.message || "Login failed.");
        setIsLoggingIn(false);
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Something went wrong.");
      setIsLoggingIn(false);
    }
  };

  if (isLoading || isLoggingIn) {
    return (
      <View className="flex-1 justify-center items-center bg-[#011126]">
        <View className="flex-row items-center">
          <Text className="text-5xl text-white font-GothamUltra">SECUR</Text>
          <Animated.View style={[rotateStyle]}>
            <Text className="text-5xl text-[#0AA696] font-GothamUltra">C</Text>
          </Animated.View>
          <Text className="text-5xl text-white font-GothamUltra">ITY</Text>
        </View>
      </View>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <View className="flex-1 justify-center items-center bg-[#011126] px-6">
      <View className="mb-8">
        <Text className="text-5xl font-GothamUltra flex-row">
          <Text className="text-white">SECUR</Text>
          <Text className="text-[#0AA696]">C</Text>
          <Text className="text-white">ITY</Text>
        </Text>
      </View>

      <View className="w-full max-w-md">
        {errorMessage !== "" && (
          <Text className="text-red-500 text-center font-GothamBold mb-4">
            {errorMessage}
          </Text>
        )}

        <Text className="text-white font-GothamBold mb-1">
          Username or Email
        </Text>
        <TextInput
          className="border border-[#0AA696] border-[1.5px] rounded-3xl px-4 py-4 mb-4 bg-gray-100 text-gray-800 font-GothamBold"
          placeholder="your username or email"
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
        />

        <Text className="text-white font-GothamBold mb-1">Password</Text>
        <TextInput
          className="border border-[#0AA696] border-[1.5px] rounded-3xl px-4 py-4 mb-6 bg-gray-100 text-gray-800 font-GothamBold"
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          className="bg-[#0AA696] rounded-3xl py-4 mb-4"
          onPress={handleLogin}
        >
          <Text className="text-center text-white font-GothamBold">Login</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/signup")}>
          <Text className="text-center text-[#0AA696] font-GothamBold">
            Don’t have an account? Create one
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

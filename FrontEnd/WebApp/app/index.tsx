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
import API_BASE_URL from "@config";

// Type for JWT payload
interface JWTPayload {
  exp: number;
  [key: string]: any;
}
import Constants from 'expo-constants';

const { apiUrl } = Constants.expoConfig?.extra ?? {};

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true); // Page loading state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false); // Login-in-progress state
  const router = useRouter();

  // Animated rotation value for the 'C' letter
  const rotation = useSharedValue(0);

  // Animation style: rotate continuously
  const rotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  useEffect(() => {
    // Start infinite rotation when component mounts
    rotation.value = withRepeat(
      withTiming(360, { duration: 1200, easing: Easing.linear }),
      -1
    );
  }, []);

  useEffect(() => {
    // Check for a valid token to auto-redirect authenticated user
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

  // Handle login request
  const handleLogin = async () => {
    if (!username || !password) {
      setErrorMessage("All fields are required.");
      return;
    }

    setIsLoggingIn(true);

    try {
      const response = await fetch(
<<<<<<< HEAD
        `${apiUrl}/api/v1/operatoreComunale/login-operatore`,
=======
        `${API_BASE_URL}/api/v1/operatoreComunale/login-operatore`,
>>>>>>> origin/itinerario
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Save token and user info in localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Add delay to show animated loader before redirect
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

  // Display loading spinner or animated logo while loading or logging in
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

  // Avoid rendering login form if already authenticated
  if (isAuthenticated) return null;

  // Render login form
  return (
    <View className="flex-1 justify-center items-center bg-[#011126] px-6">
      {/* Logo */}
      <View className="mb-8">
        <Text className="text-5xl font-GothamUltra flex-row">
          <Text className="text-white">SECUR</Text>
          <Text className="text-[#0AA696]">C</Text>
          <Text className="text-white">ITY</Text>
        </Text>
      </View>

      <View className="w-full max-w-md">
        {/* Display error message if present */}
        {errorMessage !== "" && (
          <Text className="text-red-500 text-center font-GothamBold mb-4">
            {errorMessage}
          </Text>
        )}

        {/* Username field */}
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

        {/* Password field */}
        <Text className="text-white font-GothamBold mb-1">Password</Text>
        <TextInput
          className="border border-[#0AA696] border-[1.5px] rounded-3xl px-4 py-4 mb-6 bg-gray-100 text-gray-800 font-GothamBold"
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {/* Login button */}
        <TouchableOpacity
          className="bg-[#0AA696] rounded-3xl py-4 mb-4"
          onPress={handleLogin}
        >
          <Text className="text-center text-white font-GothamBold">Login</Text>
        </TouchableOpacity>

        {/* Link to signup page */}
        <TouchableOpacity onPress={() => router.push("/signup")}>
          <Text className="text-center text-[#0AA696] font-GothamBold">
            Don’t have an account? Create one
          </Text>
        </TouchableOpacity>

        {/* Link to Comune token generator (admin only) */}
        <TouchableOpacity onPress={() => router.push("/operatore/token")}>
          <Text className="text-center text-gray-400 text-sm mt-2">
            Accesso amministratore
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

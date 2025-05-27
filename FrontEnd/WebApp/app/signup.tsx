import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import API_BASE_URL from "@config";

export default function SignupOperatore() {
  // State variables for the input fields
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tokenComune, setTokenComune] = useState("");

  // State for feedback messages
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const router = useRouter();

  // Handles form submission and signup request
  const handleSignup = async () => {
    // Basic validation
    if (!username || !email || !password || !tokenComune) {
      setErrorMessage("All fields are required.");
      return;
    }

    try {
      // Send signup request to the backend
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/operatoreComunale/signup-operatore`,
        {
          username,
          email,
          password,
          tokenComune,
        }
      );

      // Handle successful response
      if (response.status === 201) {
        setSignupSuccess(true);
        setSuccessMessage(
          response.data.message || "Account successfully created."
        );
        // Clear input fields
        setUsername("");
        setEmail("");
        setPassword("");
        setTokenComune("");
        setErrorMessage("");
      } else {
        // Handle expected errors (e.g., invalid token, email exists)
        setErrorMessage(response.data.error || "Signup failed.");
      }
    } catch (error) {
      // Handle network/server errors
      console.error(error);
      setErrorMessage("Something went wrong.");
    }
  };

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

      {/* If signup is successful, show animated confirmation message */}
      {signupSuccess ? (
        <Animated.View
          entering={FadeIn.duration(400)}
          exiting={FadeOut.duration(200)}
          className="bg-green-600 p-5 rounded-2xl mb-6 w-full max-w-md shadow-lg"
        >
          <Text className="text-white text-lg font-GothamBold mb-3 text-center">
            {successMessage}
          </Text>
          <TouchableOpacity
            className="bg-white rounded-xl py-3"
            onPress={() => router.push("/")}
          >
            <Text className="text-center text-[#0AA696] font-GothamBold">
              Back to Login
            </Text>
          </TouchableOpacity>
        </Animated.View>
      ) : (
        // Show signup form
        <View className="w-full max-w-md">
          {/* Display error if present */}
          {errorMessage !== "" && (
            <Text className="text-red-500 text-center font-GothamBold mb-4">
              {errorMessage}
            </Text>
          )}

          {/* Username input */}
          <Text className="text-white font-GothamBold mb-1">Username</Text>
          <TextInput
            className="border border-[#0AA696] border-[1.5px] rounded-3xl px-4 py-4 mb-4 bg-gray-100 text-gray-800 font-GothamBold"
            placeholder="Your Username"
            value={username}
            onChangeText={setUsername}
          />

          {/* Email input */}
          <Text className="text-white font-GothamBold mb-1">Email</Text>
          <TextInput
            className="border border-[#0AA696] border-[1.5px] rounded-3xl px-4 py-4 mb-4 bg-gray-100 text-gray-800 font-GothamBold"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
          />

          {/* Password input */}
          <Text className="text-white font-GothamBold mb-1">Password</Text>
          <TextInput
            className="border border-[#0AA696] border-[1.5px] rounded-3xl px-4 py-4 mb-4 bg-gray-100 text-gray-800 font-GothamBold"
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {/* Comune token input */}
          <Text className="text-white font-GothamBold mb-1">Comune Token</Text>
          <TextInput
            className="border border-[#0AA696] border-[1.5px] rounded-3xl px-4 py-4 mb-6 bg-gray-100 text-gray-800 font-GothamBold"
            placeholder="Insert provided token"
            value={tokenComune}
            onChangeText={setTokenComune}
          />

          {/* Submit button */}
          <TouchableOpacity
            className="bg-[#0AA696] rounded-3xl py-4"
            onPress={handleSignup}
          >
            <Text className="text-center text-white font-GothamBold">
              Create Account
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

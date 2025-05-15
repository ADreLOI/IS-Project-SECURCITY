import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import axios from "axios";

export default function SignUp() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUp = async () => 
    {
    if (!username || !email || !password) 
    {
      Alert.alert("All fields are required!");
      return;
    }

    // You can replace this with your API call
    try {
        const response = await axios.post("http://localhost:3000/api/v1/cittadino/signup", {
          username,
          email,
          password,
        });
  
        if (response.status === 200) {
          Alert.alert("SignUp successful!", response.data.message); //Works parsing automatically the JSON elements
            // Clear the input fields
            setUsername("");
            setEmail("");
            setPassword("");
          // Navigate or store token here
        } else {
          Alert.alert("SignUp failed", response.data.error);
        }
      } catch (error) {
        Alert.alert("Error", "Something went wrong. Please try again.");
        console.error(error);
      }
  };

  return (
    <View className="flex-1 justify-center items-center bg-white px-6">
      <Text className="text-3xl font-bold text-blue-600 mb-8">Sign Up</Text>

      <View className="w-full max-w-md">
        <Text className="text-gray-700 mb-1">Username</Text>
        <TextInput
          className="border border-gray-300 rounded-xl px-4 py-3 mb-4 bg-gray-100 text-gray-800"
          placeholder="yourusername"
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
        />

        <Text className="text-gray-700 mb-1">Email</Text>
        <TextInput
          className="border border-gray-300 rounded-xl px-4 py-3 mb-4 bg-gray-100 text-gray-800"
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Text className="text-gray-700 mb-1">Password</Text>
        <TextInput
          className="border border-gray-300 rounded-xl px-4 py-3 mb-6 bg-gray-100 text-gray-800"
          placeholder="••••••••"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          className="bg-blue-600 rounded-xl py-3"
          onPress={handleSignUp}
        >
          <Text className="text-center text-white font-semibold">Create Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

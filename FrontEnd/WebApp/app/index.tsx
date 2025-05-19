import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("All fields are required!");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:3000/api/v1/operatoreComunale/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Login successful");
        // Redirect to home
        //router.push("/operatore/dashboard"); // da creare in futuro
      } else {
        Alert.alert("Login failed", data.error);
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong.");
      console.error(error);
    }
  };

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
        <Text className="text-white font-GothamBold mb-1">Email</Text>
        <TextInput
          className="border border-[#0AA696] border-[1.5px] rounded-3xl px-4 py-4 mb-4 bg-gray-100 text-gray-800 font-GothamBold"
          placeholder="you@example.com"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
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
            Crea un account
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

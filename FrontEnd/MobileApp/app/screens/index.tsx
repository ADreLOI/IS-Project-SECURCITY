import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, Button } from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";

const router = useRouter();

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
    <View className="flex-1 justify-center items-center bg-[#011126] px-6">
    <View className="mb-8">
          <Text className="text-5xl font-GothamUltra flex-row">  
            <Text className="text-white">SECUR</Text>
            <Text className="text-[#0AA696]">C</Text>
            <Text className="text-white">ITY</Text>
          </Text>
        </View>     
     <View className="w-full max-w-md">
        <Text className="text-white font-GothamBold mb-1">Username</Text>
        <TextInput
          className="border border-[#0AA696] border-[1.5px] rounded-3xl font-GothamBold px-4 py-4 mb-4 bg-gray-100 text-gray-800"
          placeholder="Your Username"
          autoCapitalize="none"
          selectionColor="#0AA696"
          value={username}
          onChangeText={setUsername}
        />

        <Text className="text-white mb-1">Email</Text>
        <TextInput
          className="border border-[#0AA696] border-[1.5px] rounded-3xl font-GothamBold px-4 py-4 mb-4 bg-gray-100 text-gray-800"
          placeholder="you@example.com"
          keyboardType="email-address"
          selectionColor="#0AA696"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Text className="text-white font-GothamBold mb-1">Password</Text>
        <TextInput
          className="border border-[#0AA696] border-[1.5px] font-GothamBold rounded-3xl px-4 py-4 mb-6 bg-gray-100 text-gray-800"
          placeholder="Password"
          selectionColor="#0AA696"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          className="bg-[#0AA696] rounded-3xl py-4"
          onPress={handleSignUp}
        >
          <Text className="text-center text-white font-GothamBold">Create Account</Text>
        </TouchableOpacity>
        
        
        <Button
      title="Go to About"
      onPress={() => router.push('/screens/home')}
    />
    
      </View>
    </View>
  );
}

import { useState, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, Button, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import React from "react";
import { useCittadino } from "./context/cittadinoContext"; // Import the context
import Constants from 'expo-constants';

const { apiUrl } = Constants.expoConfig?.extra ?? {};

export default function SignUp() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { setCittadino } = useCittadino();
const hasNavigated = useRef(false);

  interface JWTPayload 
  {
    id: string;
    email: string;  
    exp: number; // seconds since epoch
    [key: string]: any;
  }

  React.useEffect(() => {
  const checkLogin = async () => {
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      if (token) {
        const decoded = jwtDecode<JWTPayload>(token);
        const now = Math.floor(Date.now() / 1000);

        if (decoded.exp > now) {
          decodeToken(token);

          const response = await axios.get(`${apiUrl}/api/v1/cittadino/${decoded.id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.status === 200) {
            setCittadino(response.data);
            setIsAuthenticated(true);
            setIsLoading(false);

            if (!hasNavigated.current) {
              hasNavigated.current = true;
              router.push("/screens/home");
            }
          } else {
            Alert.alert("Error", "Failed to fetch Cittadino data.");
            setIsAuthenticated(false);
            setIsLoading(false);
          }
          return;
        } else {
          await AsyncStorage.removeItem('jwtToken');
          if (!hasNavigated.current) {
            hasNavigated.current = true;
            router.push("/screens/login");
          }
        }
      } else {
        setIsLoading(false);
      }
    } catch (e) {
      console.error("Error checking login status:", e);
      setIsLoading(false);
    }
  };

  checkLogin();
}, []);

  const decodeToken = (token: string) => {
    try 
    {
      const decoded: JWTPayload = jwtDecode<JWTPayload>(token);
      //Cittadino ID
      return decoded.id; 
    } 
    catch (error) 
    {
      console.error('Token decoding failed:', error);
      return false;
    }
  };

  const handleSignUp = async () => 
    {
      
    if (!username || !email || !password) 
    {
      Alert.alert("All fields are required!");
      return;
    }

    // You can replace this with your API call
    try {
        const response = await axios.post(`${apiUrl}/api/v1/cittadino/signup`, {
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
           // Clear the input fields
           setUsername("");
           setEmail("");
           setPassword("");
        }
      } catch (error:any) {
        Alert.alert("Error", error.response.data.message);
        console.log(error);
      }
  };

  if(isLoading)
  {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0AA696" />
      </View>
    );
  }
  
  if(isAuthenticated)
  {
    router.push("/screens/home");
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
 
       <TouchableOpacity
          className="bg-[#0AA696] rounded-3xl py-4 mt-4"
          onPress={() => router.push("/screens/login")}
        >
          <Text className="text-center text-white font-GothamBold">Log In</Text>
        </TouchableOpacity>
    
      </View>
    </View>
  );
}

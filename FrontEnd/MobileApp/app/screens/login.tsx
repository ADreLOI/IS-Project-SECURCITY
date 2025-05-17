import { TextInput, TouchableOpacity, Alert, Text, View, Button} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Animated, { FadeIn, SlideInLeft } from 'react-native-reanimated';
import React from 'react'
import { useState } from "react";
import axios  from "axios";
import Constants from 'expo-constants';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';

const googleClientId = Constants.expoConfig?.extra?.googleClientId;
if (!googleClientId) {
  throw new Error("Google Client ID not defined in app.json");
}

import { useRouter } from "expo-router";

export default function Login()
{
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");


  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: googleClientId,
    redirectUri: 'https://auth.expo.io/mattdema17/SecurCity',
  });

  const handleLogin = async () =>
  {
      if(!username || !password)
      {
        Alert.alert("All fields are required!");
        return;
      }
      // You can replace this with your API call
      try {
          const response = await axios.post("http://localhost:3000/api/v1/cittadino/login", {
            username,
            password,
          });
    
          if (response.status === 200) {
            Alert.alert("Login successful!", response.data.message); //Works parsing automatically the JSON elements
              // Clear the input fields
              setUsername("");
              setPassword("");
            // Navigate or store token here
          } else {
            Alert.alert("Login failed", response.data.error);
             // Clear the input fields
             setUsername("");
             setPassword("");
          }
        }
        catch (error) { 
          Alert.alert("Error", "Something went wrong. Please try again.");
          console.error(error);
        }
  }

  React.useEffect(() => {
    const handleGoogleLogin = async () => {
      if (response?.type === 'success' && response.authentication?.accessToken) {
        const accessToken = response.authentication.accessToken;

        try {
          const res = await axios.post('http://localhost:3000/api/v1/cittadino/google-login', {
            accessToken,
          });

          if (res.status === 200) {
            Alert.alert('Login successful!', res.data.message);
            setUsername('');
            setPassword('');
            // Navigate or store token here
          }
        } catch (error) {
          Alert.alert('Error', 'Something went wrong. Please try again.');
          console.error(error);
        }
      }
    };

    handleGoogleLogin();
  }, [response]);
  
  
  return (
    <View className="flex-1 justify-center items-center bg-[#011126] px-6">
      <Animated.View entering={SlideInLeft.duration(500)}>
    <View className="mb-8">
          <Text className="text-5xl font-GothamUltra flex-row">  
            <Text className="text-white">SECUR</Text>
            <Text className="text-[#0AA696]">C</Text>
            <Text className="text-white">ITY</Text>
          </Text>
      </View>     
      </Animated.View>
   <View className="w-full max-w-md">
      <Text className="text-white font-GothamBold mb-1">Username or Email</Text>
      <TextInput
        className="border border-[#0AA696] border-[1.5px] rounded-3xl font-GothamBold px-4 py-4 mb-4 bg-gray-100 text-gray-800"
        placeholder="Your Username"
        autoCapitalize="none"
        selectionColor="#0AA696"
        value={username}
        onChangeText={setUsername}
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
        onPress={handleLogin}
      >
        <Text className="text-center text-white font-GothamBold">Log in</Text>
      </TouchableOpacity>

     <Button
      disabled={!request}
      title="Sign in with Google"
      onPress={() => promptAsync()}
    />
      </View>
      </View>
  )
}
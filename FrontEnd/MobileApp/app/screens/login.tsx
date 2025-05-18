import { TextInput, TouchableOpacity, Alert, Text, View, Button} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Animated, { FadeIn, SlideInLeft } from 'react-native-reanimated';
import React from 'react'
import { useState } from "react";
import axios  from "axios";
import Constants from 'expo-constants';
import { GoogleSignin, GoogleSigninButton, isSuccessResponse, isErrorWithCode, statusCodes} from '@react-native-google-signin/google-signin';



import { useRouter } from "expo-router";
import * as webBrowser from 'expo-web-browser';
webBrowser.maybeCompleteAuthSession();

export default function Login()
{
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

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

  React.useEffect(() => 
    {
    GoogleSignin.configure(
      {
      iosClientId: "615949668776-cl5b7ni96kftafc8j6qc8m7ernf3nusu.apps.googleusercontent.com",
      webClientId: "615949668776-cqsq6am4797he6oqarsaqjn2076url55.apps.googleusercontent.com",
    });
  }, []);

  const handleGoogleLogin = async () => 
    {
    try 
    {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if(isSuccessResponse(response))
      {
        const idToken = response.data.idToken;
        console.log("ID Token: ", idToken);
        
        const responseAPI = await axios.post("http://localhost:3000/api/v1/cittadino/google-login", {
          idToken,
        });
        if (responseAPI.status === 200) {
          Alert.alert("Login successful!", responseAPI.data.message);
          // Navigate or store token here
        } else 
        {
          Alert.alert("Login failed", responseAPI.data.error);
        }
      }
      else
      {
        Alert.alert("Login failed", "The Google sign-in was cancelled.");
      }
       
      }  
    catch (error)
     {
        if(isErrorWithCode(error))
        {
          switch (error.code) {
            case statusCodes.SIGN_IN_CANCELLED:
              Alert.alert("Login failed", "The Google sign-in was cancelled.");
              break;
            case statusCodes.IN_PROGRESS:
              Alert.alert("Login failed", "Sign in is in progress.");
              break;
            case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
              Alert.alert("Login failed", "Play services are not available.");
              break;
            default:
              Alert.alert(error.message);
              console.error(error.message);
            }
        }
    }
  };
  
  
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

      <GoogleSigninButton
      size={GoogleSigninButton.Size.Wide}
      color={GoogleSigninButton.Color.Dark}
      onPress={() => 
      {
        // initiate sign in
        handleGoogleLogin();
      }}
    />;
      </View>
      </View>
  )
}
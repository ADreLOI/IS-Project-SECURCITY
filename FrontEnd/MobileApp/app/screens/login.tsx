import { TextInput, TouchableOpacity, Alert, Text, View, Button} from 'react-native'
import Animated, { FadeIn, SlideInLeft } from 'react-native-reanimated';
import React from 'react'
import { useState } from "react";
import axios  from "axios";
import { GoogleSignin, GoogleSigninButton, isSuccessResponse, isErrorWithCode, statusCodes} from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";
//Define the webClientId and iosClientId in a separate file named costants.ts in root folder
import CustomButton from '../components/googleButton';
import { webClientId, iosClientId } from '../costants';
import { useCittadino } from "../context/cittadinoContext"; // Import the context

const router = useRouter();

export default function Login()
{
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
    const { setCittadino } = useCittadino();


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
    
          if (response.status === 200) 
          {
            Alert.alert("Login successful!", response.data.message); //Works parsing automatically the JSON elements
            // Store the token securely
            const jwtToken = response.data.token;
            console.log("JWT token", jwtToken);
            await AsyncStorage.setItem('jwtToken', jwtToken);
              // Clear the input fields
              setUsername("");
              setPassword("");
            // Navigate or store token here
            //Get cittadino ID and informations
            setCittadino(response.data.user)
            console.log("Cittadino:", response.data.user);
            console.log(response.data)
            router.push("/screens/home");
          } 
          else 
          {
            Alert.alert("Login failed", response.data.error);
             // Clear the input fields
             setUsername("");
             setPassword("");
          }
        }
        catch (error: any) { 
          Alert.alert("Error", error.response.data.message);
          console.error(error);
        }
  }

  React.useEffect(() => 
    {
    GoogleSignin.configure(
      {
      iosClientId: iosClientId,
      webClientId: webClientId,
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
        if (responseAPI.status === 200) 
        {
          // Navigate or store token here
          console.log("JWT token", responseAPI.data.token);
          //Store thre token in the local storage
          await AsyncStorage.setItem('jwtToken', responseAPI.data.token);

          Alert.alert("Login successful!", responseAPI.data.message);
          setCittadino(responseAPI.data.user)
          console.log("Cittadino:", responseAPI.data.user);
          console.log(responseAPI.data)
          router.push("/screens/home");
        } 
        else 
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
  
    const recoverPassword = async () =>
    {
      if(username == "")
      {
        Alert.alert("Error","Fil the 'Username' field with your username or your email!")
        return
      }
        try
        {
          console.log(username)
          const response = await axios.post( `http://localhost:3000/api/v1/cittadino/recuperaPassword`,
            {
              username
            })

            if(response.status == 200)
            {
              Alert.alert("Email sent", response.data.message)
            }
            else
            {
              Alert.alert("Some error occurred")
            }
        }
        catch(error: any)
        {
            Alert.alert("Error", error.response.data.message)
          console.error(error);
        }
    } 
  
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
        className="bg-[#0AA696] rounded-3xl py-5"
        onPress={handleLogin}
      >
        <Text className="text-center text-white font-GothamBold">Log in</Text>
      </TouchableOpacity>

      <Text className="text-white font-GothamBold text-center mt-4">or</Text>
    
      <CustomButton
        title="Login with Google"
        imageSource={require('../../assets/images/google-icon.png')}
        onPress={handleGoogleLogin}
      />

  <TouchableOpacity
        onPress={recoverPassword}
      >
        <Text className="text-center text-white font-GothamBold mt-4">Hai dimenticato la password? Clicca qui</Text>
      </TouchableOpacity>
      </View>
      </View>
  )
}
import { StyleSheet, Text, View, Alert, TextInput, TouchableOpacity } from 'react-native'
import { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useRouter } from "expo-router";

import React from 'react'

const recoverPasswordCittadino = () => 
    {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState("");
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const handleSetPassword = async () => 
    {
    if (!password || !confirmPassword) {
      setErrorMessage("Compila entrambi i campi");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Le password non corrispondono");
      return;
    }

     try 
     {
      const response = await fetch(
        `http://localhost:3000/api/v1/cittadino/setPassword/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        }
      );

      if(response.status==200)
      {
        window.alert('Password changed successfully! Go back your mobile app!');
        router.push("/")
      }

    } catch (error) {
      console.error(error);
      setErrorMessage("Something went wrong.");
    }
    // Call backend or navigate
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
    
          <View className="w-full max-w-md">
            {/* Display error message if present */}
            {errorMessage !== "" && (
              <Text className="text-red-500 text-center font-GothamBold mb-4">
                {errorMessage}
              </Text>
            )}
    
            {/* Password field */}
            <Text className="text-white font-GothamBold mb-1">Password</Text>
            <TextInput
              className="border border-[#0AA696] border-[1.5px] rounded-3xl px-4 py-4 mb-6 bg-gray-100 text-gray-800 font-GothamBold"
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            {/* Password field */}
            <Text className="text-white font-GothamBold mb-1">Conferma Password</Text>
            <TextInput
              className="border border-[#0AA696] border-[1.5px] rounded-3xl px-4 py-4 mb-6 bg-gray-100 text-gray-800 font-GothamBold"
              placeholder="Password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
    
            {/* Login button */}
            <TouchableOpacity
              className="bg-[#0AA696] rounded-3xl py-4 mb-4"
              onPress={handleSetPassword}
            >
              <Text className="text-center text-white font-GothamBold">Set Password</Text>
            </TouchableOpacity>
    
          </View>
        </View>
  );
}

export default recoverPasswordCittadino

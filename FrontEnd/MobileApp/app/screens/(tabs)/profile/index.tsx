import { StyleSheet, Text, TouchableOpacity, View, Modal, TextInput, Alert, ScrollView } from 'react-native'
import React, { use } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState } from 'react'
import Animated, { FadeIn, SlideInLeft } from 'react-native-reanimated';
import { useCittadino } from '../../../context/cittadinoContext';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { JWTPayload, ContattoEmergenza } from '../../../types/index';
import { useRouter } from 'expo-router';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';

const profile = () => {

  const { cittadino } = useCittadino();
  const { setCittadino } = useCittadino();
  const router = useRouter();


  const logout = async () => {
    try 
    {
      await AsyncStorage.removeItem('jwtToken');
      // Optionally, navigate to the login screen or reset the app state
      Alert.alert("Logged out successfully");
      router.push('../login'); // Adjust this to your navigation method
    } catch (error) 
    {
      console.error("Error during logout:", error);
      Alert.alert("Error", "Failed to log out. Please try again.");
    }
  };

const sendConfirmationToken = async () => 
  {
  const token = await AsyncStorage.getItem('jwtToken');
  if (token) 
  {
    const decoded = jwtDecode<JWTPayload>(token);
    try {
      const response = await axios.post(
        `http://localhost:3000/api/v1/cittadino/resendToken/${decoded.id}`,
        {},
        {
          headers: 
          {
            Authorization: `Bearer ${token}`
          }
        }
      );
      Alert.alert("Token re-sent successfully", response.data.message);
    } catch (error: any) {  
      Alert.alert("Error", error.response.data.message);
      console.error(error);
    }
  } else 
  {
    Alert.alert("Error", "No token found. Please log in again.");
    router.push('../login'); // Adjust this to your navigation method
  }
};
  return (
  <SafeAreaView className="flex-1 bg-[#111126] px-6">
  <ScrollView>
    <View className="flex-col">
      <Animated.View
      entering={SlideInLeft.duration(500)}
      className="top-4" >
        <View className="pb-9 relative">
            {/* Icon Positioned Absolutely */}
            <TouchableOpacity
               className="absolute right-10 top-0 p-2 z-10">
            <Ionicons
              name="create-outline"
              onPress={() => router.push('/screens/(tabs)/profile/editProfile')}
              size={24}
              color="#0AA696"
            />
          </TouchableOpacity>

            {/* Icon Positioned Absolutely */}
            <TouchableOpacity
             onPress={logout}    className="absolute right-0 top-0 p-2 z-10">
            <Ionicons
              name="log-out-outline"
              size={24}
              color="#0AA696"
            />
          </TouchableOpacity>
          <Text className="text-5xl font-GothamUltra flex-row">
            <Text className="text-white">SECUR</Text>
            <Text className="text-[#0AA696]">C</Text>
            <Text className="text-white">ITY</Text>
          </Text>
        </View>
      </Animated.View>

      {/* Centered content */}
        {/* Username */}
      <InfoRow
        icon={<FontAwesome name="user" size={20} color="#0AA696" />}
        label="Username"
        value={cittadino?.username || "N/A"}
      />

  {/* Email */}
      <InfoRow
        icon={<MaterialIcons name="email" size={20} color="#0AA696" />}
        label="Email"
        value={cittadino?.email || "N/A"}
      />

        
 {/* Contatti di Emergenza */}
 {cittadino?.contattiEmergenza?.map((contatto, index) => (
        <InfoRow
          key={index}
          icon={<Ionicons name="call" size={20} color="#0AA696" />}
          label={`Contatto ${index + 1}`}
          value={`${contatto.nominativo} - ${contatto.numeroTelefonico}`}
        />
      ))}


  {/* IsVerificato */}
      <InfoRow
        icon={<MaterialIcons name="check" size={20} color="#0AA696" />}
        label="Verificato"
        value={String(cittadino?.isVerificato) || "N/A"}
      />
      
    {/* send token again button */}

    <TouchableOpacity
        className="border border-[#0AA696] border-[1.5px] rounded-3xl py-2 px-2"
        onPress={sendConfirmationToken}
        style={{ display: cittadino?.isVerificato ? 'none' : 'flex' }}
      >
        <Text className="text-center font-GothamBold text-xs text-white mb-1">Send Confirmation Link</Text>
      </TouchableOpacity>

    </View>
    </ScrollView>
  </SafeAreaView>
  )

type InfoRowProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
};
  function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <View className="flex-row items-start mb-6">
      <View className="w-6 mt-1 mr-4 items-center">{icon}</View>
      <View className="flex-1 border-b border-[#0AA696] pb-3">
        <Text className="text-xs text-white mb-1 font-GothamBold">{label}</Text>
        <Text className="text-base text-white font-GothamBold">{value}</Text>
      </View>
    </View>
  );
}
}

export default profile

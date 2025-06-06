import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native'
import React from 'react'
import { useLocalSearchParams } from 'expo-router';
import Animated from 'react-native-reanimated';
import  {SlideInRight} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Segnalazione } from '@/app/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
const details = () => 
{
    const router = useRouter();
const [segnalazione, setSegnalazione] = useState<Segnalazione | null>(null);

     React.useEffect(() => {
    const fetchSegnalazione = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem("segnalazione");
        if (jsonValue != null) {
          setSegnalazione(JSON.parse(jsonValue) as Segnalazione);
          console.log(JSON.parse(jsonValue) as Segnalazione)
        }
      } catch (e) {
        console.error('Error reading segnalazione from storage:', e);
      }
    };

    fetchSegnalazione();
  }, []);

  return (
  <SafeAreaView className="flex-1 bg-[#111126] px-6">
    <ScrollView>
     <View className="flex-col">
      <Animated.View
      entering={SlideInRight.duration(500)}
      className="top-4" >
        <View className="pb-9 relative">

            {/* Icon Positioned Absolutely */}
            <TouchableOpacity
             onPress={async () => 
              {
                await AsyncStorage.removeItem("segnalazione")
                router.back()
              }
              }    className="absolute left-0 top-0 p-2 z-10">
            <Ionicons
              name="chevron-back"
              size={24}
              color="#0AA696"
            />        
          </TouchableOpacity>

            <TouchableOpacity
             onPress={() => console.log("Modifica segnalazione")}    className="absolute right-0 top-0 p-2 z-10">
            <Ionicons
              name="create-outline"
              size={24}
              color="#0AA696"
            />        
          </TouchableOpacity>
          <Text className="text-5xl font-GothamUltra flex-row left-10">
            <Text className="text-white">SECUR</Text>
            <Text className="text-[#0AA696]">C</Text>
            <Text className="text-white">ITY</Text>
          </Text>
        </View>
      </Animated.View>
        <View className="flex-1 p-4">
        <View className="p-4 bg-[#011126] rounded-2xl">
        <View className="flex-row items-center mb-6">
            <MaterialIcons name="calendar-today" size={22} color="#0AA696" className="mr-4"/>
            <Text className="text-white text-xl font-GothamBold">
            {segnalazione?.data
            ? new Date(segnalazione.data).toLocaleDateString()
            : 'Data non disponibile'}
            </Text>
        </View>

        <View className="flex-row items-center mb-6">
            <FontAwesome5 name="exclamation-circle" size={20} color="#0AA696" className="mr-4"/>
            <Text className="text-white text-base font-GothamBold">
            {segnalazione?.tipoDiReato}
            </Text>
        </View>

        <View className="flex-row items-center mb-6">
            <MaterialIcons name="description" size={22} color="#0AA696" className="mr-4"/>
            <Text className="text-white text-base font-GothamBold">
            {segnalazione?.descrizione}
            </Text>
        </View>

        <View className="flex-row items-center mb-6">
            <MaterialIcons name="location-on" size={22} color="#0AA696" className="mr-4"/>
            <Text className="text-white text-base font-GothamBold">
            {segnalazione?.tappa.nome}
            </Text>
        </View>
        </View>
        </View>
      </View>
        </ScrollView>
    </SafeAreaView>
  )
}

export default details

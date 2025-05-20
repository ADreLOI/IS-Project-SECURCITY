import { StyleSheet, Text, TouchableOpacity, View, Modal, TextInput, Alert } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState } from 'react'
import Animated, { FadeIn, SlideInLeft } from 'react-native-reanimated';
import { useCittadino } from '../context/cittadinoContext';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { JWTPayload, ContattoEmergenza } from '../types/index';

const home = () => {

  const { cittadino } = useCittadino();
  const [formVisible, setFormVisible] = useState(false);

 const [nominativo, setNominativo] = useState("");
  const [numeroTelefonico, setNumero] = useState("");
  const [contattiEmergenza, setContattiEmergenza] = useState<ContattoEmergenza[]>([]);
  const { setCittadino } = useCittadino();

  const addContattoEmergenza = async () =>
    {
      console.log("Aggiungo il contatto");

      if(!nominativo || !numeroTelefonico)
      {
        Alert.alert("All fields are required!");
        return;
      }
      const token = await AsyncStorage.getItem('jwtToken');
      if(token)
      {
        const decoded = jwtDecode<JWTPayload>(token);
        const nuovoContatto: ContattoEmergenza = 
        {
          id: "abchdadaidcdaojjjidajaijdajdoijadojada", // or use uuid()
          nominativo: nominativo,
          numeroTelefonico: numeroTelefonico,
        };

        contattiEmergenza.push(nuovoContatto)
        console.log("contatti:", contattiEmergenza)
        setContattiEmergenza(contattiEmergenza);

        try
        {
          const response = await axios.put(`http://localhost:3000/api/v1/cittadino/addContattiEmergenza/${decoded.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              contattiEmergenza
            });
            console.log("Cittadino:", response.data);
            setCittadino(response.data);
            
          //Set cittadino with contatti Emergenza
        }
        catch(error)
        {
           Alert.alert("Error", "Something went wrong. Please try again.");
          console.error(error);
        }
      }
      setFormVisible(false);
    }

  return (
  <SafeAreaView className="flex-1 bg-[#111126] px-6">
  <Modal
  visible={formVisible}
  animationType="slide"
  transparent={true}
  onRequestClose={() => setFormVisible(false)} // Android back button
  >
    <View className="flex-1 justify-center items-center bg-black/50 px-4">
      <View className="bg-[#111126] rounded-2xl p-6 w-full max-w-md border border-[#0AA696] border-[1.5px]">
      <Text className="text-xl font-GothamBold mb-4 text-white">Compila il form</Text>

        {/* Example form fields */}
        <TextInput
        className="border border-[#0AA696] border-[1.5px] rounded-3xl font-GothamBold px-4 py-4 mb-4 bg-gray-100 text-gray-800"
        placeholder="Nominativo"
        autoCapitalize="none"
        selectionColor="#0AA696"
        value={nominativo}
        onChangeText={setNominativo}
        />
        <TextInput
        keyboardType="phone-pad"
        className="border border-[#0AA696] border-[1.5px] rounded-3xl font-GothamBold px-4 py-4 mb-4 bg-gray-100 text-gray-800"
        placeholder="Numero telefonico"
        autoCapitalize="none"
        selectionColor="#0AA696"
        value={numeroTelefonico}
        onChangeText={setNumero}
        />

        {/* Submit & Cancel buttons */}
        <View className="flex-row justify-between">
        <TouchableOpacity onPress={() => setFormVisible(false)}>
        <Text className="text-red-500">Annulla</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {
        addContattoEmergenza(); // Your logic
        }}>
        <Text className="text-[#0AA696] font-bold">Salva</Text>
        </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
    <View className="flex-col">
      <Animated.View
      entering={SlideInLeft.duration(500)}
      className="top-20" >
        <View className="pb-9">
          <Text className="text-5xl font-GothamUltra flex-row">
            <Text className="text-white">SECUR</Text>
            <Text className="text-[#0AA696]">C</Text>
            <Text className="text-white">ITY</Text>
          </Text>
        </View>
      </Animated.View>

      {/* Centered content */}
      <View className="justify-left items-left">
        <Animated.View entering={FadeIn.duration(500)}>
          <Text className="text-2xl font-GothamBold text-white">
          Username
          </Text>
        </Animated.View>

        <TouchableOpacity className="border border-[#0AA696] border-[1.5px] rounded-3xl py-5">
          <Text className="text-1xl font-GothamBold text-white px-3">{cittadino?.username}</Text>
        </TouchableOpacity>

        <Animated.View entering={FadeIn.duration(500)}>
          <Text className="text-2xl font-GothamBold text-white">
          Email
          </Text>
        </Animated.View>

        <TouchableOpacity className="border border-[#0AA696] border-[1.5px] rounded-3xl py-5">
          <Text className="text-1xl font-GothamBold text-white px-3">{cittadino?.email}</Text>
        </TouchableOpacity>

        <View className="flex-row">
          <Animated.View entering={FadeIn.duration(500)}>
            <Text className="text-2xl font-GothamBold text-white">
            Contatti di emergenza
            </Text>
          </Animated.View>

          <TouchableOpacity
            onPress={() => setFormVisible(true)}
            className="ml-auto"
            >
            <Ionicons name="add" size={24} color="#0AA696" />
        </TouchableOpacity>
        </View>

        <TouchableOpacity className="border border-[#0AA696] border-[1.5px] rounded-3xl py-5 px-4">
          {cittadino?.contattiEmergenza?.map((contatto, index) => (
          <View
          key={index}
          className="flex-row items-center justify-between mb-3">
            {/* Left side: contact info */}
            <View>
            <Text className="text-white font-GothamBold">👤 {contatto.nominativo}</Text>
            <Text className="text-white font-GothamBold">📞 {contatto.numeroTelefonico}</Text>
            </View>

            {/* Right side: Edit button */}
            <TouchableOpacity
            onPress={() => console.log('Edit', contatto)}
            className="ml-auto"
            >
            <Ionicons name="create-outline" size={24} color="#0AA696" />
            </TouchableOpacity>
          </View>
          ))}
        </TouchableOpacity>
      </View>
    </View>
  </SafeAreaView>
  )
}

export default home

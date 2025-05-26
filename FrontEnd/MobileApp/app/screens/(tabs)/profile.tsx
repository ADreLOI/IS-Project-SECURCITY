import { StyleSheet, Text, TouchableOpacity, View, Modal, TextInput, Alert, ScrollView } from 'react-native'
import React, { use } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState } from 'react'
import Animated, { FadeIn, SlideInLeft } from 'react-native-reanimated';
import { useCittadino } from '../../context/cittadinoContext';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { JWTPayload, ContattoEmergenza } from '../../types/index';
import { useRouter } from 'expo-router';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';

const profile = () => {

  const { cittadino } = useCittadino();
  const [formVisible, setFormVisible] = useState(false);
  const [tfUsername, setTfUsername] = useState(false);
  const [tfEmail, setTfEmail] = useState(false);

  const [username, setUsername] = useState(cittadino?.username);
  const [email, setEmail] = useState(cittadino?.email);
  const [nominativo, setNominativo] = useState("");
  const [numeroTelefonico, setNumero] = useState("");
  let [contattiEmergenza, setContattiEmergenza] = useState<ContattoEmergenza[]>([]);
  const { setCittadino } = useCittadino();
  const router = useRouter();

  const addContattoEmergenza = async () =>
    {
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
          _id: generateMongoObjectId(), // or use uuid()
          nominativo: nominativo,
          numeroTelefonico: numeroTelefonico,
        };

        if(cittadino?.contattiEmergenza.length == 0)
        {
          contattiEmergenza.push(nuovoContatto);
          setContattiEmergenza(contattiEmergenza);
        }
        else
        {
            //Push existing contatti in the contattiEmergenza
            contattiEmergenza = cittadino?.contattiEmergenza ?? [];
            contattiEmergenza.push(nuovoContatto);
        }
        try
        {
          const response = await axios.put(
            `http://localhost:3000/api/v1/cittadino/addContattiEmergenza/${decoded.id}`,
            { contattiEmergenza },
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );

            //console.log("Cittadino:", response.data);
            setCittadino(response.data);
            
          //Set cittadino with contatti Emergenza
        }
        catch(error: any)
        {
           Alert.alert("Error", error.response.data.message);
          console.error(error);
          cittadino?.contattiEmergenza.pop();
        }
      }
      setFormVisible(false);
    }

  const editContattoEmergenza = async () =>
    {
      //console.log("Modifico il contatto");

      if(!nominativo || !numeroTelefonico)
      {
        Alert.alert("All fields are required!");
        return;
      }

      const token = await AsyncStorage.getItem('jwtToken');
      if(token)
      {
        const decoded = jwtDecode<JWTPayload>(token);

      
        //Push existing contatti in the contattiEmergenza
        const contattoToEdit = cittadino?.contattiEmergenza.find(
          (contatto) => contatto.nominativo === nominativo || contatto.numeroTelefonico === numeroTelefonico
        );  

        console.log(contattoToEdit)
        if (contattoToEdit)
        {
          //Contatto exists and has to be updated
          //console.log("Sto per inviare..")
          contattoToEdit.nominativo = nominativo;
          contattoToEdit.numeroTelefonico = numeroTelefonico;
          try
          {
            const response = await axios.put(
              `http://localhost:3000/api/v1/cittadino/editContattiEmergenza/${decoded.id}`,
              {  contattoId: contattoToEdit._id,
                nominativo: contattoToEdit.nominativo,
                numeroTelefonico: contattoToEdit.numeroTelefonico,
               },
              {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              }
            );

              //console.log("Cittadino:", response.data);
              setCittadino(response.data);
              
            //Set cittadino with contatti Emergenza
          }
          catch(error: any)
          {
              Alert.alert("Error", error.response.data.message);
            console.error(error);
          }
        }
        else
        {
          //Contatto non esiste e deve essere creato, mentre quello precedente eliminato
          deleteContattoEmergenza();
          addContattoEmergenza();
        }
      }
      setFormVisible(false);
    }
  const deleteContattoEmergenza = async () =>
    {
      const token = await AsyncStorage.getItem('jwtToken');
      if(token)
      {
        const decoded = jwtDecode<JWTPayload>(token);
        //console.log(nominativo)
        const contattoToDelete = cittadino?.contattiEmergenza.find(
          (contatto) => contatto.nominativo === nominativo || contatto.nominativo === numeroTelefonico
        );  
       
        if(contattoToDelete)
        {
          const idContatto = contattoToDelete._id
          //console.log(idContatto)
          try
          {
            const response = await axios.put(
              `http://localhost:3000/api/v1/cittadino/deleteContattiEmergenza/${decoded.id}`,
              { idContatto },
              {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              }
            );

              //console.log("Cittadino:", response.data);
              setCittadino(response.data);              
          }
          catch(error: any)
          {
            Alert.alert("Error", error.response.data.message);
            console.error(error);
          }
        }
        else
        {
          console.log("Contatto does not exist")
        }
      }
      setFormVisible(false);
    }

    const generateMongoObjectId = () => {
      const hex = 'abcdef0123456789';
      let objectId = '';
      for (let i = 0; i < 24; i++) {
        objectId += hex[Math.floor(Math.random() * hex.length)];
      }
      return objectId;
    };
   

  const editProfile = async (usernameToSend: string, emailToSend: string) =>
  {
      //console.log(usernameToSend)
      //console.log(emailToSend)
    
    //Check if the username and email are the same as the current ones to avoid unnecessary API calls
    if(usernameToSend==cittadino?.username && emailToSend==cittadino?.email)
    {
      Alert.alert("No changes made");
      return;
    }
  
    const token = await AsyncStorage.getItem('jwtToken');
    if(token)
    {
      const decoded = jwtDecode<JWTPayload>(token);
      try
      {
        
        const response = await axios.put(
          `http://localhost:3000/api/v1/cittadino/editProfile/${decoded.id}`,
          { username,
            email
          },
          {
            headers: 
            {
              Authorization: `Bearer ${token}`
            }
          }
        );

          //console.log("Cittadino:", response.data);
          setCittadino(response.data);    
                  
      }
      catch(error: any)
      {
        Alert.alert("Error", error.response.data.message);
        console.error(error);
      }
        
    }
  }  

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

          <TouchableOpacity onPress={() => {deleteContattoEmergenza();}}>
          <Text className="text-red-500">Elimina</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => {
          editContattoEmergenza(); // Your logic
          }}>
          <Text className="text-[#0AA696] font-bold">Modifica</Text>
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
      className="top-4" >
        <View className="pb-9 relative">
            {/* Icon Positioned Absolutely */}
            <TouchableOpacity
             onPress={() => console.log("Edit Profile Pressed")}    className="absolute right-0 top-0 p-2 z-10">
            <Ionicons
              name="create-outline"
              size={24}
              color="#0AA696"
            />
          </TouchableOpacity>

            {/* Icon Positioned Absolutely */}
            <TouchableOpacity
             onPress={() => console.log("Logout Profile Pressed")}    className="absolute right-10 top-0 p-2 z-5">
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
        <Text className="text-xs text-white mb-1">{label}</Text>
        <Text className="text-base text-white">{value}</Text>
      </View>
    </View>
  );
}
}

export default profile

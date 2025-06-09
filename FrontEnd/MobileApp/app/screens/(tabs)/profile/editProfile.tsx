import { StyleSheet, Text, TouchableOpacity, View, Modal, TextInput, Alert, ScrollView } from 'react-native'
import React, { use } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState } from 'react'
import Animated, { FadeIn, SlideInLeft, SlideInRight } from 'react-native-reanimated';
import { useCittadino } from '../../../context/cittadinoContext';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { JWTPayload, ContattoEmergenza } from '../../../types/index';
import { useRouter } from 'expo-router';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';

const { apiUrl } = Constants.expoConfig?.extra ?? {};

export default function EditProfile() 
{

  const { setCittadino } = useCittadino();
  const router = useRouter();
  const { cittadino } = useCittadino()
  const [formVisible, setFormVisible] = useState(false);
  const [saveButtonVisible, setSaveButton] = useState(false);
  const [username, setUsername] = useState(cittadino?.username);
  const [email, setEmail] = useState(cittadino?.email);
  const [nominativo, setNominativo] = useState("");
  const [numeroTelefonico, setNumero] = useState("");
  let [contattiEmergenza, setContattiEmergenza] = useState<ContattoEmergenza[]>([]);
  const [isAddingContatti, setFlagContatti] = useState(false);


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

        try
        {
          const response = await axios.put(
            `${apiUrl}/api/v1/cittadino/addContattiEmergenza/${decoded.id}`,
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
              `${apiUrl}/api/v1/cittadino/editContattiEmergenza/${decoded.id}`,
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
              `${apiUrl}/api/v1/cittadino/deleteContattiEmergenza/${decoded.id}`,
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
   

  const editProfile = async () =>
  {
      //console.log(usernameToSend)
      //console.log(emailToSend)
    console.log(isAddingContatti)
      //Check if the username and email are the same as the current ones to avoid unnecessary API calls
    if(username==cittadino?.username && email==cittadino?.email)
    {
      console.log("no changes in Username or Email")
    }
    else
    {
      const token = await AsyncStorage.getItem('jwtToken');
      if(token)
      {
        const decoded = jwtDecode<JWTPayload>(token);
        try
        {
          
          const response = await axios.put(
            `${apiUrl}/api/v1/cittadino/editProfile/${decoded.id}`,
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
   if(isAddingContatti)
   {
      addContattoEmergenza();
      setFlagContatti(false);
   }
   else
   {
      console.log("no changes in contatti")
      console.log(contattiEmergenza);
   }

   setSaveButton(false);
  }  

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
              <TouchableOpacity onPress={() => 
                {
                setFormVisible(false)
                setNominativo("")
                setNumero("")
                } 
              }>
              <Text className="text-red-500">Annulla</Text>
              </TouchableOpacity>
  
             <TouchableOpacity onPress={deleteContattoEmergenza}>
              <Text className="text-red-500">Elimina</Text>
              </TouchableOpacity>
  

              <TouchableOpacity onPress={() => 
              {
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
                  setSaveButton(true);
                }
                else
                {
                    //Push existing contatti in the contattiEmergenza
                    contattiEmergenza = cittadino?.contattiEmergenza ?? [];
                    contattiEmergenza.push(nuovoContatto);
                    setContattiEmergenza(contattiEmergenza);
                    setSaveButton(true);
                }
                setFlagContatti(true);
                setFormVisible(false);
              }}>
              <Text className="text-[#0AA696] font-bold">Salva</Text>
              </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
    <View className="flex-col">
      <Animated.View
      entering={SlideInRight.duration(500)}
      className="top-4" >
        <View className="pb-9 relative">

            {/* Icon Positioned Absolutely */}
            <TouchableOpacity
             onPress={() => router.back()}    className="absolute left-0 top-0 p-2 z-10">
            <Ionicons
              name="chevron-back"
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

      {/* Centered content */}
        {/* Username */}
      <View className="flex-row items-start mb-6">
      <View className="w-6 mt-1 mr-4 items-center">{<FontAwesome name="user" size={20} color="#0AA696" />}</View>
      <View className="flex-1 border-b border-[#0AA696] pb-3">
        <Text className="text-xs text-white mb-1 font-GothamBold">Username</Text>
        <TextInput className="text-base text-white font-GothamBold"
        value={username}
        onChangeText={setUsername}
        onSubmitEditing={() => 
        {
          if(username != cittadino?.username)
          {
            setSaveButton(true);
          }
          else
          {
            setSaveButton(false);
          }
        }}
        />
      </View>
    </View>

  {/* Email */}
       <View className="flex-row items-start mb-6">
      <View className="w-6 mt-1 mr-4 items-center">{<MaterialIcons name="email" size={20} color="#0AA696" />}</View>
      <View className="flex-1 border-b border-[#0AA696] pb-3">
        <Text className="text-xs text-white mb-1 font-GothamBold">Email</Text>
        <TextInput className="text-base text-white font-GothamBold"
        value={email}
        onChangeText={setEmail}
        onSubmitEditing={() => 
        {
          if(email != cittadino?.email)
          {
            setSaveButton(true);
          }
          else
          {
            setSaveButton(false);
          }
        }}
        />
      </View>
    </View>
        
 {/* Contatti di Emergenza */}
 {cittadino?.contattiEmergenza?.map((contatto, index) => (
        <InfoRow
          key={index}
          icon={<Ionicons name="call" size={20} color="#0AA696" />}
          label={`Contatto ${index + 1}`}
          value={`${contatto.nominativo} - ${contatto.numeroTelefonico}`}
        />
      ))}
{/* Add contatti di emergenza button */}

    <TouchableOpacity
        className="border border-[#0AA696] border-[1.5px] rounded-3xl py-2 px-2"
       onPress={() => setFormVisible(true)}
      >
        <Text className="text-center font-GothamBold text-xs text-white mb-1">Aggiungi contatti di emergenza</Text>
      </TouchableOpacity>

{/* Salvataggio modifiche button */}
    <TouchableOpacity
        className="border border-[#0AA696] border-[1.5px] rounded-3xl py-2 px-2 mt-4"
      onPress={editProfile}
      style={{ display: saveButtonVisible ? 'flex' : 'none' }}
      >
        <Text className="text-center font-GothamBold text-xs text-white mb-1">Aggiorna Profilo</Text>
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
               <Ionicons
            name="create-outline"
            onPress={() => 
            { 
              setFormVisible(true);
              const [name, phone] = value.split("-").map(part => part.trim());

              console.log(name);  // "Ciro Immobile"
              console.log(phone); // "3920013154"
              setNumero(name);
              setNominativo(phone);
            }}
            size={24}
            color="#0AA696"
          />
    </View>
  );
  }

  
}
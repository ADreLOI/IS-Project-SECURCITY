import { StyleSheet, Text, TouchableOpacity, View, Modal, TextInput, Alert, ScrollView } from 'react-native'
import React, { use } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState } from 'react'
import Animated, { FadeIn, SlideInLeft } from 'react-native-reanimated';
import { useCittadino } from '../context/cittadinoContext';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { JWTPayload, ContattoEmergenza } from '../types/index';

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

      {/* Sezione Username*/}
      
        <Animated.View entering={FadeIn.duration(500)}>
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-2xl font-GothamBold text-white">
          Username
          </Text>

          {/* Right side: Edit button */}
          <TouchableOpacity
            onPress={() => 
            { //Set textinput on
              if (cittadino?.username) 
              {
                setUsername(cittadino.username);
                setTfUsername(true)
              }

            }}
            className="ml-auto"
            >
            <Ionicons name="create-outline" size={24} color="#0AA696" />
            </TouchableOpacity>

          </View>
        </Animated.View>

        <TouchableOpacity className="border border-[#0AA696] border-[1.5px] rounded-3xl py-5 " disabled style={{ display: tfUsername ? 'none' : 'flex' }} >
          <View className="flex-row items-center justify-between mb-3">
          <Text className="text-1xl font-GothamBold text-white px-3">{cittadino?.username} </Text>
            </View>
        </TouchableOpacity>


        <TextInput
          className="border border-[#0AA696] border-[1.5px] rounded-3xl font-GothamBold px-4 py-4 mb-4 bg-gray-100 text-gray-800"
          placeholder="Nominativo"
          autoCapitalize="none"
          selectionColor="#0AA696"
          value={username}
          onChangeText={setUsername} 
          onSubmitEditing={() => 
            {
              setTfUsername(false)

              let finalUsername = username;
              let finalEmail = email
  
              //Send change to API
              if(finalUsername && finalEmail)
              editProfile(finalUsername, finalEmail);
            }}
          style={{ display: tfUsername ? 'flex' : 'none' }}
          />

        {/* Sezione Email*/}

        <Animated.View entering={FadeIn.duration(500)}>
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-2xl font-GothamBold text-white">
          Email
          </Text>

            {/* Right side: Edit button */}
            <TouchableOpacity
            onPress={() => 
            { //Set textinput on
              if (cittadino?.email) {
                setEmail(cittadino.email);
                setTfEmail(true)
              }
            }}
            className="ml-auto"
            >
            <Ionicons name="create-outline" size={24} color="#0AA696" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        <TouchableOpacity className="border border-[#0AA696] border-[1.5px] rounded-3xl py-5" disabled style={{ display: tfEmail ? 'none' : 'flex' }}>
          <Text className="text-1xl font-GothamBold text-white px-3">{cittadino?.email}</Text>
        </TouchableOpacity>

        <TextInput
          className="border border-[#0AA696] border-[1.5px] rounded-3xl font-GothamBold px-4 py-4 mb-4 bg-gray-100 text-gray-800"
          placeholder="Nominativo"
          autoCapitalize="none"
          selectionColor="#0AA696"
          value={email}
          onChangeText={setEmail} 
          onSubmitEditing={() => 
            {
              setTfEmail(false)

              let finalUsername = username;
              let finalEmail = email
  
              //Send change to API
              if(finalUsername && finalEmail)
              editProfile(finalUsername, finalEmail);
            }}
          style={{ display: tfEmail ? 'flex' : 'none' }}
          />

        <View className="flex-row">
          <Animated.View entering={FadeIn.duration(500)}>
            <Text className="text-2xl font-GothamBold text-white">
            Contatti di emergenza
            </Text>
          </Animated.View>

          <TouchableOpacity
            onPress={() => setFormVisible(true)}
            className="ml-auto">
            <Ionicons name="add" size={24} color="#0AA696" />
        </TouchableOpacity>
        </View>

        <TouchableOpacity className="border border-[#0AA696] border-[1.5px] rounded-3xl py-5 px-4" disabled>
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
            onPress={() => 
            { setFormVisible(true);
              setNumero(contatto.numeroTelefonico);
              setNominativo(contatto.nominativo);
            }}
            className="ml-auto"
            >
            <Ionicons name="create-outline" size={24} color="#0AA696" />
            </TouchableOpacity>

          
          </View>
          ))}
        </TouchableOpacity>

        <TouchableOpacity
              className="border border-[#0AA696] border-[1.5px] rounded-3xl py-3 mt-10"
              onPress={() => console.log("logut")}
            >
              <Text className="text-center text-white font-GothamBold">Log Out</Text>
        </TouchableOpacity>

          <TouchableOpacity
            className="border border-[#0AA696] border-[1.5px] rounded-3xl py-3 mt-4"
            onPress={() => console.log("Resend token")}
          >
            <Text className="text-center text-white font-GothamBold">Re-send Token</Text>
          </TouchableOpacity>
      </View>
    </View>
    </ScrollView>
  </SafeAreaView>
  )
}

export default profile

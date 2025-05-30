import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";

export default function CreaSegnalazione() {
  const router = useRouter();

  const [selectedReato, setSelectedReato] = useState<string>("");
  const [descrizione, setDescrizione] = useState<string>("");
  const [lat, setLat] = useState<string>("");
  const [lng, setLng] = useState<string>("");

  const reatiDisponibili = [
    "Molestia",
    "Furto",
    "Aggressione",
    "Minacce",
    "Pedinamento",
    "Altro",
    ];

  const handleSubmit = async (): Promise<void> => {
    if (!selectedReato || !descrizione || !lat || !lng) {
      Alert.alert("Tutti i campi sono obbligatori!");
      return;
    }

    try {
      const response = await axios.post("http://localhost:3000/api/v1/segnalazioni", {
         // Manca parametro id utente
        tipoDiReato: selectedReato,
        descrizione,
        tappa: {
          nome: "Luogo segnalato",
          coordinate: [parseFloat(lng), parseFloat(lat)],
        },
      });

      if (response.status === 201) {
        Alert.alert("Segnalazione inviata con successo!");
        setSelectedReato("");
        setDescrizione("");
        setLat("");
        setLng("");
      } else {
        Alert.alert("Errore", "Impossibile inviare la segnalazione.");
      }
    } catch (err: any) {
      Alert.alert("Errore", err.message || "Errore durante l'invio.");
      console.log(JSON.stringify(err, null, 2));
    }
  };

  return (
    <ScrollView className="flex-1 bg-[#011126] px-6 pt-12">
      <View className="mb-6">
        <Text className="text-2xl font-GothamUltra text-white text-center">
          Nuova <Text className="text-[#0AA696]">Segnalazione</Text>
        </Text>
      </View>

      <View className="flex-row flex-wrap justify-center mb-4 ">
        {reatiDisponibili.map((reato) => (
        <TouchableOpacity
          key={reato}
          onPress={() => setSelectedReato(reato)}
          className={`px-4 py-2 m-1 rounded-full ${
          selectedReato === reato ? 'bg-[#0AA696]' : 'bg-gray-300'
        }`}
      >
        <Text
          className={`font-GothamBold ${
            selectedReato === reato ? 'text-white' : 'text-gray-800'
          }`}
        >
          {reato}
        </Text>
        </TouchableOpacity>
        ))}
      </View>


      <Text className="text-white font-GothamBold mb-1">Descrizione</Text>
      <TextInput
        className="border border-[#0AA696] rounded-3xl px-4 py-3 mb-4 bg-gray-100 text-gray-800"
        placeholder="Descrivi l'accaduto"
        multiline
        numberOfLines={4}
        value={descrizione}
        onChangeText={setDescrizione}
      />

      <Text className="text-white font-GothamBold mb-1">Latitudine</Text>
      <TextInput
        className="border border-[#0AA696] rounded-3xl px-4 py-3 mb-4 bg-gray-100 text-gray-800"
        placeholder="Es. 45.4642"
        keyboardType="numeric"
        value={lat}
        onChangeText={setLat}
      />

      <Text className="text-white font-GothamBold mb-1">Longitudine</Text>
      <TextInput
        className="border border-[#0AA696] rounded-3xl px-4 py-3 mb-6 bg-gray-100 text-gray-800"
        placeholder="Es. 9.19"
        keyboardType="numeric"
        value={lng}
        onChangeText={setLng}
      />

      <TouchableOpacity
        className="bg-[#0AA696] rounded-3xl py-4"
        onPress={handleSubmit}
      >
        <Text className="text-center text-white font-GothamBold">Invia Segnalazione</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

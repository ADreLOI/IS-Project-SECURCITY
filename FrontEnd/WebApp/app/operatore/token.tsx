import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";

export default function TokenGenerator() {
  const [durataMinuti, setDurataMinuti] = useState("");
  const [tokenGenerato, setTokenGenerato] = useState("");

  const generaToken = async () => {
    const minuti = parseInt(durataMinuti);
    if (!minuti || minuti <= 0) {
      Alert.alert("Errore", "Inserisci una durata valida in minuti");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:3000/api/v1/token/genera",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ durataMinuti: minuti }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setTokenGenerato(data.token);
        Alert.alert("Token generato", `Token: ${data.token}`);
      } else {
        Alert.alert("Errore", data.error || "Generazione fallita");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Errore", "Qualcosa è andato storto");
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-[#011126] px-6">
      <Text className="text-3xl text-white font-GothamUltra mb-8">
        Genera Token Comune
      </Text>

      <TextInput
        className="w-full max-w-md border border-[#0AA696] rounded-3xl px-4 py-4 mb-4 bg-gray-100 text-gray-800 font-GothamBold"
        placeholder="Durata (minuti)"
        keyboardType="numeric"
        value={durataMinuti}
        onChangeText={setDurataMinuti}
      />

      <TouchableOpacity
        className="bg-[#0AA696] rounded-3xl py-4 w-full max-w-md mb-6"
        onPress={generaToken}
      >
        <Text className="text-center text-white font-GothamBold">
          Genera Token
        </Text>
      </TouchableOpacity>

      {tokenGenerato !== "" && (
        <Text className="text-white text-xl font-GothamBold">
          Token generato:{" "}
          <Text className="text-[#0AA696]">{tokenGenerato}</Text>
        </Text>
      )}
    </View>
  );
}

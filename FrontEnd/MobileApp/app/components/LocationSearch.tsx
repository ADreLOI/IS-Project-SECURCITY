import React, { useState } from "react";
import { TextInput, FlatList, TouchableOpacity, Text, View } from "react-native";
import axios from "axios";

interface Props {
  onSelectLocation: (data: { nome: string; lat: string; lng: string }) => void;
}

export default function LocationSearch({ onSelectLocation }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);

  const searchLocation = async (text: string) => {
    setQuery(text);
    if (text.length < 3) return;

    try {
      const response = await axios.get("https://nominatim.openstreetmap.org/search", {
        params: {
          q: text,
          format: "json",
          addressdetails: 1,
          limit: 5,
          countrycodes: "it", // Limita ai risultati in Italia 🇮🇹
        },
      });

      setResults(response.data);
    } catch (error) {
      console.error("Errore durante la geocodifica:", error);
    }
  };

  const handleSelect = (item: any) => {
    setQuery(item.display_name);
    setResults([]);
    onSelectLocation({
      nome: item.display_name,
      lat: item.lat,
      lng: item.lon,
    });
  };

  return (
    <View>
      <TextInput
        placeholder="Cerca indirizzo (es: Via Roma 10, Milano)"
        value={query}
        onChangeText={searchLocation}
        className="border border-[#0AA696] rounded-3xl px-4 py-3 mb-2 bg-gray-100 text-gray-800"
      />
      <FlatList
        data={results}
        keyExtractor={(item) => item.place_id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleSelect(item)} className="px-4 py-2 bg-white border-b border-gray-200">
            <Text>{item.display_name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

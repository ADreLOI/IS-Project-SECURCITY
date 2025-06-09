import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
} from "react-native";
import axios from "axios";

interface Props {
  placeholder?: string;
  onSelect: (data: { description: string; lat: number; lng: number }) => void;
}

const GOOGLE_MAPS_API_KEY = "AIzaSyDmym-f0vXx62WkOvhKLAjx2vNAUazdrb4";

export default function AddressAutocomplete({
  placeholder = "Cerca indirizzo",
  onSelect,
}: Props) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<
    { description: string; place_id: string }[]
  >([]);

  useEffect(() => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    const fetchAutocomplete = async () => {
      try {
        const res = await axios.get(
          "https://maps.googleapis.com/maps/api/place/autocomplete/json",
          {
            params: {
              input: query,
              key: GOOGLE_MAPS_API_KEY,
              language: "it",
              components: "country:it",
            },
          }
        );
        setSuggestions(res.data.predictions);
      } catch {
        setSuggestions([]);
      }
    };

    const timeout = setTimeout(fetchAutocomplete, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  const handleSelect = async (description: string, placeId: string) => {
    try {
      const res = await axios.get(
        "https://maps.googleapis.com/maps/api/place/details/json",
        {
          params: {
            place_id: placeId,
            key: GOOGLE_MAPS_API_KEY,
            language: "it",
          },
        }
      );
      const loc = res.data.result.geometry.location;
      onSelect({ description, lat: loc.lat, lng: loc.lng });
    } catch {
      onSelect({ description, lat: 0, lng: 0 });
    }
    setQuery(description);
    setSuggestions([]);
  };

  return (
    <View>
      <TextInput
        placeholder={placeholder}
        value={query}
        onChangeText={setQuery}
        className="border border-[#0AA696] rounded-3xl px-4 py-3 mb-2 bg-gray-100 text-gray-800"
      />
      {suggestions.length > 0 && (
        <FlatList
          data={suggestions}
          keyExtractor={(item) => item.place_id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleSelect(item.description, item.place_id)}
              className="px-4 py-2 bg-white border-b border-gray-200"
            >
              <Text>{item.description}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

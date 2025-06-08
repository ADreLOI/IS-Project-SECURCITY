// SearchBar.tsx
// Componente che rappresenta la barra di ricerca fissa nella parte alta della schermata,
// usata per inserire manualmente la destinazione dell’itinerario, con autocompletamento Google Places.

import React, { useState, useEffect } from "react";
import {
  KeyboardAvoidingView,
  View,
  TextInput,
  Platform,
  FlatList,
  TouchableOpacity,
  Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants/colors";
import axios from "axios";

// API Key di Google Maps (da proteggere in produzione)
const GOOGLE_MAPS_API_KEY = "AIzaSyDmym-f0vXx62WkOvhKLAjx2vNAUazdrb4";

// Proprietà accettate dal componente
interface Props {
  destination: string; // testo attuale inserito nel campo destinazione
  onChangeDestination: (text: string) => void; // funzione chiamata ad ogni modifica del testo
  onSubmit: (place: {
    description: string;
    location: { lat: number; lng: number } | null;
  }) => void;
  // funzione eseguita alla conferma della ricerca (invio o selezione)
}

// Componente principale con autocompletamento
export default function SearchBar({
  destination,
  onChangeDestination,
  onSubmit,
}: Props) {
  // Stato per memorizzare le predizioni di Google Places
  const [suggestions, setSuggestions] = useState<
    { description: string; place_id: string }[]
  >([]);

  // Effetto ogni volta che cambia il testo di ricerca
  useEffect(() => {
    // Se la lunghezza del testo è inferiore a 3 caratteri, non chiedere suggerimenti
    if (destination.length < 3) {
      setSuggestions([]);
      return;
    }

    // Funzione interna per chiamare l’API di autocomplete
    const fetchAutocomplete = async () => {
      try {
        const res = await axios.get(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json`,
          {
            params: {
              input: destination,
              key: GOOGLE_MAPS_API_KEY,
              language: "it",
            },
          }
        );
        // Salva le predizioni (descrizione + place_id) nello stato
        setSuggestions(res.data.predictions);
      } catch (err) {
        // In caso di errore, svuota i suggerimenti
        setSuggestions([]);
      }
    };

    // Debounce: aspetta 300ms prima di chiamare l’API per evitare troppe richieste
    const timeout = setTimeout(fetchAutocomplete, 300);
    return () => clearTimeout(timeout);
  }, [destination]);

  // Quando l’utente seleziona una voce, richiedi i dettagli per ottenere lat/lng
  const handleSelect = async (description: string, placeId: string) => {
    try {
      // Chiamata a Place Details API per ottenere la geometria del luogo
      const res = await axios.get(
        `https://maps.googleapis.com/maps/api/place/details/json`,
        {
          params: {
            place_id: placeId,
            key: GOOGLE_MAPS_API_KEY,
            language: "it",
          },
        }
      );
      const loc = res.data.result.geometry.location;
      // Esegui la callback onSubmit con descrizione e coordinate
      onSubmit({ description, location: { lat: loc.lat, lng: loc.lng } });
    } catch {
      // Se fallisce, invia la sola descrizione
      onSubmit({ description, location: null });
    }
    // Dopo la selezione, svuota i suggerimenti
    setSuggestions([]);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined} // gestione tastiera su iOS
      style={{
        position: "absolute", // fissa in alto
        top: 50,
        width: "100%",
        paddingHorizontal: 16,
      }}
    >
      <View
        style={{
          backgroundColor: "white",
          flexDirection: "row", // icona + input affiancati
          alignItems: "center",
          padding: 12,
          borderRadius: 16,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 6,
        }}
      >
        {/* Icona della lente di ingrandimento */}
        <Ionicons name="search" size={20} color={COLORS.primary} />

        {/* Campo di testo per la destinazione */}
        <TextInput
          style={{ flex: 1, marginLeft: 8, fontSize: 14 }}
          placeholder="Cerca destinazione..."
          returnKeyType="search" // tipo di tasto sulla tastiera
          onSubmitEditing={() =>
            // invia la stringa come fallback
            onSubmit({ description: destination, location: null })
          }
          value={destination} // valore attuale
          onChangeText={onChangeDestination} // modifica in tempo reale
        />
      </View>

      {/* Dropdown con suggerimenti di autocompletamento */}
      {suggestions.length > 0 && (
        <FlatList
          data={suggestions}
          keyExtractor={(item) => item.place_id}
          style={{
            backgroundColor: "white",
            maxHeight: 200,
            marginHorizontal: 16,
            borderRadius: 8,
            elevation: 5,
          }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleSelect(item.description, item.place_id)}
              style={{
                padding: 12,
                borderBottomWidth: 1,
                borderColor: "#eee",
              }}
            >
              <Text>{item.description}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </KeyboardAvoidingView>
  );
}

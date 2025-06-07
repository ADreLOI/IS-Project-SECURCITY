import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import axios from "axios";

const GOOGLE_MAPS_API_KEY = "AIzaSyDmym-f0vXx62WkOvhKLAjx2vNAUazdrb4";

type LatLng = { latitude: number; longitude: number };

export default function HomeScreen() {
  const [origin, setOrigin] = useState<LatLng | null>(null);
  const [destination, setDestination] = useState("");
  const [safeRoute, setSafeRoute] = useState<LatLng[] | null>(null);
  const [fastRoute, setFastRoute] = useState<LatLng[] | null>(null);
  const [selected, setSelected] = useState<"safe" | "fast">("safe");

  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permesso negato",
          "La posizione è necessaria per usare la mappa."
        );
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setOrigin(coords);

      mapRef.current?.animateToRegion({
        ...coords,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    })();
  }, []);

  const fetchRoute = async () => {
    if (!origin || !destination) return;

    try {
      // Percorso veloce (drive)
      const fastURL = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${encodeURIComponent(
        destination
      )}&mode=driving&key=${GOOGLE_MAPS_API_KEY}`;

      const fastRes = await axios.get(fastURL);
      const fastPoints = fastRes.data.routes?.[0]?.overview_polyline?.points;
      if (!fastPoints) {
        Alert.alert("Errore", "Percorso veloce non trovato");
        return;
      }
      setFastRoute(decodePolyline(fastPoints));

      // Percorso sicuro (walk)
      const safeURL = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${encodeURIComponent(
        destination
      )}&mode=walking&key=${GOOGLE_MAPS_API_KEY}`;

      const safeRes = await axios.get(safeURL);
      const safePoints = safeRes.data.routes?.[0]?.overview_polyline?.points;
      if (!safePoints) {
        Alert.alert(
          "Percorso sicuro non disponibile",
          "Nessun percorso pedonale trovato. Verrà mostrato solo quello veloce."
        );
        setSafeRoute(null);
        return;
      }
      setSafeRoute(decodePolyline(safePoints));
    } catch (err) {
      console.error("Errore nella richiesta del percorso:", err);
      Alert.alert("Errore", "Impossibile calcolare il percorso.");
    }
  };

  function decodePolyline(encoded: string) {
    let points = [];
    let index = 0,
      lat = 0,
      lng = 0;

    while (index < encoded.length) {
      let b,
        shift = 0,
        result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }

    return points;
  }

  const selectedRoute = selected === "safe" ? safeRoute : fastRoute;

  return (
    <View className="flex-1">
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {selectedRoute && selectedRoute.length > 0 && (
          <>
            <Marker
              coordinate={selectedRoute[selectedRoute.length - 1]}
              title="Destinazione"
            />
            <Polyline
              coordinates={selectedRoute as { latitude: number; longitude: number }[]}
              strokeColor={selected === "safe" ? "grey" : "blue"}
              strokeWidth={4}
            />
          </>
        )}
      </MapView>

      {/* Barra superiore con input + selezione */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="absolute top-10 w-full px-4 space-y-2"
      >
        <TextInput
          className="bg-white p-3 rounded-lg"
          placeholder="Es: Via Roma, Trento"
          value={destination}
          onChangeText={setDestination}
        />
        <View className="flex-row justify-between">
          <TouchableOpacity
            className={`${
              selected === "safe" ? "bg-green-700" : "bg-gray-300"
            } flex-1 mr-2 py-2 rounded-lg`}
            onPress={() => setSelected("safe")}
          >
            <Text className="text-white text-center">Percorso Sicuro</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`${
              selected === "fast" ? "bg-blue-700" : "bg-gray-300"
            } flex-1 py-2 rounded-lg`}
            onPress={() => setSelected("fast")}
          >
            <Text className="text-white text-center">Percorso Veloce</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          className="bg-blue-600 py-3 rounded-lg"
          onPress={fetchRoute}
        >
          <Text className="text-white text-center font-bold">
            Genera Percorsi
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
}

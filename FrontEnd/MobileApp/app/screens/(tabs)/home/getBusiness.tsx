/*
// HomeScreen con bottom sheet dinamico, tappe visibili e stile raffinato con font Gotham e traduzioni italiane
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  Alert,
  FlatList,
  ScrollView,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import axios from "axios";
import { Modalize } from "react-native-modalize";
import { Ionicons } from "@expo/vector-icons";

// ✅ Funzione locale per decodificare polylines (no pacchetti esterni)
function decodePolyline(
  encoded: string
): { latitude: number; longitude: number }[] {
  let index = 0,
    lat = 0,
    lng = 0,
    coordinates = [];

  while (index < encoded.length) {
    let b,
      shift = 0,
      result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    let deltaLat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += deltaLat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    let deltaLng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += deltaLng;

    coordinates.push({
      latitude: lat / 1e5,
      longitude: lng / 1e5,
    });
  }

  return coordinates;
}

const GOOGLE_MAPS_API_KEY = "AIzaSyDmym-f0vXx62WkOvhKLAjx2vNAUazdrb4";

type Coordinate = { latitude: number; longitude: number };
type Tappa = { nome: string; coordinate: [number, number] };

export default function HomeScreen() {
  const [origin, setOrigin] = useState<Coordinate | null>(null);
  const [originName, setOriginName] = useState("Partenza");
  const [destination, setDestination] = useState("");
  const [destinationName, setDestinationName] = useState("Destinazione");
  const [destinationCoords, setDestinationCoords] = useState<Coordinate | null>(
    null
  );

  const [safeRoute, setSafeRoute] = useState<Coordinate[] | null>(null);
  const [safeStops, setSafeStops] = useState<Tappa[]>([]);
  const [safeDuration, setSafeDuration] = useState<string | null>(null);
  const [fastRoute, setFastRoute] = useState<Coordinate[] | null>(null);
  const [fastStops, setFastStops] = useState<string[]>([]);

  const [selectedRoute, setSelectedRoute] = useState<"safe" | "fast">("safe");
  const [fastDuration, setFastDuration] = useState<string | null>(null);
  const [safetyLevel, setSafetyLevel] = useState<string | null>(null);
  const [fallbackReason, setFallbackReason] = useState<string | null>(null);

  const mapRef = useRef<MapView>(null);
  const bottomSheetRef = useRef<Modalize>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permesso negato",
          "La posizione è necessaria per usare la mappa."
        );
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setOrigin(coords);
      const reverseGeocode = await Location.reverseGeocodeAsync(coords);
      if (reverseGeocode[0]) {
        const { street, name, city } = reverseGeocode[0];
        setOriginName(`${street || name}, ${city}`);
      }
      mapRef.current?.animateToRegion({
        ...coords,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    })();
  }, []);

  const fetchRoutes = async () => {
    if (!origin || !destinationCoords) return;
    try {
      const safeRes = await axios.post(
        "http://10.0.2.2:3000/api/v1/itinerario/percorso-sicuro",
        {
          partenza: {
            nome: originName,
            coordinate: [origin.longitude, origin.latitude],
          },
          destinazione: {
            nome: destinationName,
            coordinate: [
              destinationCoords.longitude,
              destinationCoords.latitude,
            ],
          },
        }
      );

      if (!safeRes.data.itinerario) {
        setSafeRoute(null);
        setFallbackReason(safeRes.data.message);
        setSafeStops([]);
        bottomSheetRef.current?.open();
        return;
      }

      const itinerario = safeRes.data.itinerario;
      const tappe = itinerario.tappe;
      setSafetyLevel(itinerario.gradoSicurezzaTotale);
      setFallbackReason(null);
      setSafeStops(tappe);

      const originStr = `${tappe[0].coordinate[1]},${tappe[0].coordinate[0]}`;
      const destinationStr = `${tappe[tappe.length - 1].coordinate[1]},${tappe[tappe.length - 1].coordinate[0]}`;
      const waypointsStr = tappe
        .slice(1, -1)
        .map((t: any) => `${t.coordinate[1]},${t.coordinate[0]}`)
        .join("|");

      const safeURL = `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destinationStr}&mode=walking&waypoints=${encodeURIComponent(waypointsStr)}&key=${GOOGLE_MAPS_API_KEY}`;
      const safeResGoogle = await axios.get(safeURL);
      const safePolyline =
        safeResGoogle.data.routes?.[0]?.overview_polyline?.points;
      const safeDur = safeResGoogle.data.routes?.[0]?.legs?.[0]?.duration?.text;
      if (safePolyline) setSafeRoute(decodePolyline(safePolyline));
      if (safeDur) setSafeDuration(safeDur);

      const fastURL = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destinationCoords.latitude},${destinationCoords.longitude}&mode=walking&key=${GOOGLE_MAPS_API_KEY}`;
      const fastRes = await axios.get(fastURL);
      const fastPolyline = fastRes.data.routes?.[0]?.overview_polyline?.points;
      if (fastPolyline) setFastRoute(decodePolyline(fastPolyline));

      const fastDur = fastRes.data.routes?.[0]?.legs?.[0]?.duration?.text;
      const fastSteps =
        fastRes.data.routes?.[0]?.legs?.[0]?.steps?.map((s: any) =>
          s.html_instructions.replace(/<[^>]+>/g, "")
        ) || [];
      setFastDuration(fastDur || null);
      setFastStops(fastSteps);

      mapRef.current?.fitToCoordinates([origin, destinationCoords], {
        edgePadding: { top: 100, bottom: 300, left: 50, right: 50 },
        animated: true,
      });
      bottomSheetRef.current?.open();
    } catch (err) {
      console.error("Errore nel calcolo percorsi:", err);
      Alert.alert("Errore", "Impossibile calcolare i percorsi.");
    }
  };

  const handleDestinationSubmit = async () => {
    if (!destination) return;
    try {
      const res = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(destination)}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const result = res.data.results[0];
      const location = result?.geometry?.location;
      if (!location) return Alert.alert("Errore", "Indirizzo non trovato.");

      const coords = { latitude: location.lat, longitude: location.lng };
      setDestinationCoords(coords);
      setDestinationName(result.formatted_address);

      mapRef.current?.animateToRegion({
        ...coords,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      fetchRoutes();
    } catch (err) {
      console.error("Errore nel geocoding:", err);
      Alert.alert("Errore", "Indirizzo non valido.");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        showsUserLocation
        showsMyLocationButton
      >
        {selectedRoute === "safe" && safeRoute && (
          <Polyline
            coordinates={safeRoute}
            strokeColor="#01261C"
            strokeWidth={4}
          />
        )}
        {selectedRoute === "fast" && fastRoute && (
          <Polyline
            coordinates={fastRoute}
            strokeColor="gray"
            strokeWidth={3}
          />
        )}
        {destinationCoords && (
          <Marker coordinate={destinationCoords} title={destinationName} />
        )}
      </MapView>

      //Barra di ricerca
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{
          position: "absolute",
          top: 50,
          width: "100%",
          paddingHorizontal: 16,
        }}
      >
        <View
          style={{
            backgroundColor: "white",
            flexDirection: "row",
            alignItems: "center",
            padding: 12,
            borderRadius: 16,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 6,
          }}
        >
          <Ionicons name="search" size={20} color="#888" />
          <TextInput
            style={{ flex: 1, marginLeft: 8, fontSize: 14 }}
            placeholder="Cerca destinazione..."
            returnKeyType="search"
            onSubmitEditing={handleDestinationSubmit}
            value={destination}
            onChangeText={setDestination}
          />
        </View>
      </KeyboardAvoidingView>

      //Bottom sheet per i percorsi
      <Modalize
        ref={bottomSheetRef}
        modalHeight={420}
        handleStyle={{ backgroundColor: "#ccc" }}
      >
        <ScrollView style={{ padding: 16 }}>
          <Text style={{ fontWeight: "bold", fontSize: 16 }}>
            {selectedRoute === "safe"
              ? `Percorso Sicuro`
              : `Percorso Veloce a piedi ${fastDuration ? `(${fastDuration})` : ""}`}
          </Text>

          {safetyLevel && selectedRoute === "safe" && (
            <Text style={{ fontStyle: "italic", fontSize: 12, color: "gray" }}>
              Grado sicurezza: {safetyLevel}
            </Text>
          )}

          {fallbackReason && (
            <Text
              style={{ color: "red", fontWeight: "500", textAlign: "center" }}
            >
              {fallbackReason}
            </Text>
          )}

          //Pulsanti percorso
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              marginVertical: 20,
            }}
          >
            <TouchableOpacity
              onPress={() => setSelectedRoute("safe")}
              style={{
                backgroundColor:
                  selectedRoute === "safe" ? "#065f46" : "#e5e7eb",
                padding: 10,
                paddingHorizontal: 20,
                borderRadius: 50,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Ionicons name="shield-checkmark" size={18} color="white" />
              <Text style={{ marginLeft: 8, color: "white" }}>Sicuro</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSelectedRoute("fast")}
              style={{
                backgroundColor:
                  selectedRoute === "fast" ? "#2563eb" : "#e5e7eb",
                padding: 10,
                paddingHorizontal: 20,
                borderRadius: 50,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Ionicons name="time" size={18} color="white" />
              <Text style={{ marginLeft: 8, color: "white" }}>Veloce</Text>
            </TouchableOpacity>
          </View>

          //Pulsante avvio
          <TouchableOpacity
            style={{
              backgroundColor: "#059669",
              opacity: 0.85,
              padding: 14,
              borderRadius: 20,
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>
              Avvia Navigazione
            </Text>
          </TouchableOpacity>

          //lista tappe
          {selectedRoute === "safe" && safeStops.length > 0 && (
            <FlatList
              data={safeStops.slice(1, -1)}
              keyExtractor={(_, idx) => idx.toString()}
              renderItem={({ item }) => (
                <Text style={{ fontSize: 13, paddingVertical: 2 }}>
                  • {item.nome}
                </Text>
              )}
            />
          )}
          {selectedRoute === "fast" && fastStops.length > 0 && (
            <FlatList
              data={fastStops}
              keyExtractor={(_, idx) => idx.toString()}
              renderItem={({ item }) => (
                <Text style={{ fontSize: 13, paddingVertical: 2 }}>
                  • {item}
                </Text>
              )}
            />
          )}
        </ScrollView>
      </Modalize>
    </View>
  );
}
*/
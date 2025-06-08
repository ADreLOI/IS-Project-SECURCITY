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

// Palette Securcity
const COLORS = {
  primary: "#01261C",
  accent: "#065F46",
  highlight: "#059669",
  secondary: "#2563EB",
  lightGray: "#E5E7EB",
};

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

  // navigation state
  const [isNavigating, setIsNavigating] = useState(false);
  const [headingAngle, setHeadingAngle] = useState(0);
  const locationSub = useRef<Location.LocationSubscription | null>(null);
  const headingSub = useRef<Location.LocationSubscription | null>(null);

  // turn-by-turn steps for 'safe' route
  const [safeSteps, setSafeSteps] = useState<
    { instruction: string; polyline: Coordinate[] }[]
  >([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [fastStepsNav, setFastStepsNav] = useState<
    { instruction: string; polyline: Coordinate[] }[]
  >([]);
  const [currentFastStep, setCurrentFastStep] = useState(0);

  const mapRef = useRef<MapView>(null);
  const bottomSheetRef = useRef<Modalize>(null);

  // helper per tagliare il percorso già fatto
  const findNearestIndex = (
    coords: Coordinate[],
    loc: { latitude: number; longitude: number }
  ) => {
    let minD = Infinity,
      idx = 0;
    coords.forEach((c, i) => {
      const d =
        (c.latitude - loc.latitude) ** 2 + (c.longitude - loc.longitude) ** 2;
      if (d < minD) {
        minD = d;
        idx = i;
      }
    });
    return idx;
  };

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

      // GOOGLE SAFE ROUTE
      const originStr = `${tappe[0].coordinate[1]},${tappe[0].coordinate[0]}`;
      const destinationStr = `${
        tappe[tappe.length - 1].coordinate[1]
      },${tappe[tappe.length - 1].coordinate[0]}`;
      const waypointsStr = tappe
        .slice(1, -1)
        .map((t: any) => `${t.coordinate[1]},${t.coordinate[0]}`)
        .join("|");

      const safeURL =
        `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}` +
        `&destination=${destinationStr}&mode=walking&waypoints=${encodeURIComponent(
          waypointsStr
        )}&key=${GOOGLE_MAPS_API_KEY}`;
      const safeResGoogle = await axios.get(safeURL);
      const route = safeResGoogle.data.routes[0];
      const poly = route.overview_polyline.points;
      const legs = route.legs[0];

      setSafeRoute(decodePolyline(poly));
      setSafeDuration(legs.duration.text);
      const steps = legs.steps.map((s: any) => ({
        instruction: s.html_instructions.replace(/<[^>]+>/g, ""),
        polyline: decodePolyline(s.polyline.points),
      }));
      setSafeSteps(steps);
      setCurrentStep(0);

      // GOOGLE FAST ROUTE
      const fastURL =
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}` +
        `&destination=${destinationCoords.latitude},${
          destinationCoords.longitude
        }&mode=walking&key=${GOOGLE_MAPS_API_KEY}`;
      const fastRes = await axios.get(fastURL);
      const fastPoly = fastRes.data.routes?.[0]?.overview_polyline?.points;
      if (fastPoly) setFastRoute(decodePolyline(fastPoly));
      const fastLeg = fastRes.data.routes[0].legs[0];
      setFastDuration(fastLeg.duration.text);
      const fastStepsArr =
        fastLeg.steps.map((s: any) =>
          s.html_instructions.replace(/<[^>]+>/g, "")
        ) || [];
      setFastStops(fastStepsArr);

      mapRef.current?.fitToCoordinates([origin, destinationCoords], {
        edgePadding: { top: 100, bottom: 300, left: 50, right: 50 },
        animated: true,
      });
      mapRef.current?.fitToCoordinates([origin, destinationCoords], {
        edgePadding: { top: 100, bottom: 300, left: 50, right: 50 },
        animated: true,
      });
      // piccoli ms di pausa per garantire il layout
      await new Promise((res) => setTimeout(res, 300));
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
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          destination
        )}&key=${GOOGLE_MAPS_API_KEY}`
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

  const startNavigation = async () => {
    if (!origin) return;
    // 1) chiudo subito la sheet
    bottomSheetRef.current?.close();
    // 2) inizio navigazione live…
    setIsNavigating(true);
    locationSub.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 1000,
        distanceInterval: 1,
      },
      (loc) => {
        const { latitude, longitude } = loc.coords;
        if (selectedRoute === "safe" && safeRoute) {
          const i = findNearestIndex(safeRoute, loc.coords);
          setSafeRoute(safeRoute.slice(i));
        } else if (selectedRoute === "fast" && fastRoute) {
          const i = findNearestIndex(fastRoute, loc.coords);
          setFastRoute(fastRoute.slice(i));
        }
        if (selectedRoute === "safe" && safeSteps[currentStep]) {
          const stepPoly = safeSteps[currentStep].polyline;
          const lastPt = stepPoly[stepPoly.length - 1];
          const dist =
            (lastPt.latitude - latitude) ** 2 +
            (lastPt.longitude - longitude) ** 2;
          if (dist < 0.000001 && currentStep < safeSteps.length - 1) {
            setCurrentStep(currentStep + 1);
          }
        }
        mapRef.current?.animateCamera(
          {
            center: { latitude, longitude },
            heading: headingAngle,
            pitch: 60,
            zoom: 18,
          },
          { duration: 500 }
        );
      }
    );
    headingSub.current = await Location.watchHeadingAsync((heading) => {
      const newHeading = heading.trueHeading ?? heading.magHeading;
      setHeadingAngle(newHeading);
      mapRef.current?.animateCamera(
        { heading: newHeading, pitch: 60 },
        { duration: 300 }
      );
    });
  };

  useEffect(() => {
    return () => {
      locationSub.current?.remove();
      headingSub.current?.remove();
    };
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        showsUserLocation
        showsMyLocationButton
      >
        //{/* percorso con doppio bordo
        {selectedRoute === "safe" && safeRoute && (
          <>
            <Polyline
              coordinates={safeRoute}
              strokeColor={COLORS.primary}
              strokeWidth={10}
            />
            <Polyline
              coordinates={safeRoute}
              strokeColor={COLORS.highlight}
              strokeWidth={6}
            />
          </>
        )}
        {selectedRoute === "fast" && fastRoute && (
          <>
            <Polyline
              coordinates={fastRoute}
              strokeColor={COLORS.primary}
              strokeWidth={10}
            />
            <Polyline
              coordinates={fastRoute}
              strokeColor={COLORS.secondary}
              strokeWidth={6}
            />
          </>
        )}
        {destinationCoords && (
          <Marker coordinate={destinationCoords} title={destinationName} />
        )}
      </MapView>

      {/* overlay indicazione turno corrente
      {isNavigating && selectedRoute === "safe" && safeSteps[currentStep] && (
        <View
          style={{
            position: "absolute",
            bottom: 180, // poco sopra la bottom sheet
            left: 16,
            right: 16,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "rgba(1,38,28,0.9)",
            padding: 12,
            borderRadius: 8,
            shadowColor: "#000",
            shadowOpacity: 0.3,
            shadowRadius: 5,
            elevation: 5,
          }}
        >
          <Ionicons name="arrow-forward" size={20} color="white" />
          <Text
            style={{
              color: "white",
              fontSize: 16,
              marginLeft: 12,
              flex: 1,
              fontFamily: "Gotham",
            }}
            numberOfLines={2}
          >
            {safeSteps[currentStep].instruction}
          </Text>
        </View>
      )}
      {isNavigating &&
        selectedRoute === "fast" &&
        fastStepsNav[currentFastStep] && (
          <View
            style={{
              position: "absolute",
              bottom: 180,
              left: 16,
              right: 16,
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "rgba(1,38,28,0.9)",
              padding: 12,
              borderRadius: 8,
              shadowColor: "#000",
              shadowOpacity: 0.3,
              shadowRadius: 5,
              elevation: 5,
            }}
          >
            <Ionicons name="arrow-forward" size={20} color="white" />
            <Text
              style={{
                color: "white",
                fontSize: 16,
                marginLeft: 12,
                flex: 1,
                fontFamily: "Gotham",
              }}
              numberOfLines={2}
            >
              {fastStepsNav[currentFastStep].instruction}
            </Text>
          </View>
        )}

      {/* Barra di ricerca
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
          <Ionicons name="search" size={20} color={COLORS.primary} />
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

      {/* Bottom Sheet
      <Modalize
        ref={bottomSheetRef}
        modalHeight={420}
        withOverlay={false}
        overlayStyle={{ backgroundColor: "transparent" }}
        handleStyle={{ backgroundColor: COLORS.primary }}
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

          {/* Pulsanti percorso
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

          {/* Pulsante avvio
          <TouchableOpacity
            style={{
              backgroundColor: "#059669",
              opacity: 0.85,
              padding: 14,
              borderRadius: 20,
              alignItems: "center",
              marginBottom: 12,
            }}
            onPress={startNavigation} // ← qui colleghiamo la navigazione live
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>
              Avvia Navigazione
            </Text>
          </TouchableOpacity>

          {/* Lista tappe
          {selectedRoute === "safe" && safeStops.length > 2 && (
            <FlatList
              data={safeStops.slice(1, -1)}
              keyExtractor={(_, idx) => idx.toString()}
              style={{ marginTop: 8 }}
              renderItem={({ item }) => (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: COLORS.lightGray,
                    padding: 10,
                    borderRadius: 8,
                    marginBottom: 6,
                  }}
                >
                  <Ionicons name="ellipse" size={8} color={COLORS.primary} />
                  <Text
                    style={{
                      marginLeft: 8,
                      fontSize: 14,
                      fontFamily: "Gotham",
                      flexShrink: 1,
                    }}
                  >
                    {item.nome}
                  </Text>
                </View>
              )}
            />
          )}
          {selectedRoute === "fast" && fastStops.length > 0 && (
            <FlatList
              data={fastStops}
              keyExtractor={(_, idx) => idx.toString()}
              style={{ marginTop: 8 }}
              renderItem={({ item }) => (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: COLORS.lightGray,
                    padding: 10,
                    borderRadius: 8,
                    marginBottom: 6,
                  }}
                >
                  <Ionicons name="ellipse" size={8} color={COLORS.primary} />
                  <Text
                    style={{
                      marginLeft: 8,
                      fontSize: 14,
                      fontFamily: "Gotham",
                      flexShrink: 1,
                    }}
                  >
                    {item}
                  </Text>
                </View>
              )}
            />
          )}
        </ScrollView>
      </Modalize>
    </View>
  );
}


*/


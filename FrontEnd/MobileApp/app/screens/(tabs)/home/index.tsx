// screens/(tabs)/home/index.tsx

import React, { useEffect, useRef, useState } from "react";
import { View, Text, Alert, TouchableOpacity } from "react-native";
import MapView from "react-native-maps";
import * as Location from "expo-location";
import { Modalize } from "react-native-modalize";
import { Ionicons } from "@expo/vector-icons";

// Componenti modularizzati
import MapSection from "../../../components/MapSection";
import SearchBar from "../../../components/SearchBar";
import RouteBottomSheet from "../../../components/RouteBottomSheet";

// Hook personalizzati
import useRouteFetcher from "../../../hooks/useRouteFetcher";
import useLiveNavigation from "../../../hooks/useLiveNavigation";

import { COLORS } from "../../../constants/colors";

// Definizione dei tipi per coordinate e tappe
export type Coordinate = { latitude: number; longitude: number };
export type Tappa = { nome: string; coordinate: [number, number] };

export default function HomeScreen() {
  // Coordinate della posizione iniziale dell’utente
  const [origin, setOrigin] = useState<Coordinate | null>(null);
  const [originName, setOriginName] = useState("Partenza");

  // Selezione del tipo di percorso (sicuro o veloce)
  const [selectedRoute, setSelectedRoute] = useState<"safe" | "fast">("safe");

  // Riferimenti alla mappa e alla bottom sheet
  const mapRef = useRef<MapView>(null) as React.RefObject<MapView>;
  const bottomSheetRef = useRef<Modalize>(null) as React.RefObject<Modalize>;

  // Hook personalizzato per gestire il fetch dei percorsi e le info associate
  const {
    destination,
    setDestination,
    destinationCoords,
    destinationName,
    safeRoute,
    setSafeRoute,
    safeStops,
    safeDuration,
    fastRoute,
    setFastRoute,
    fastStops,
    fastDuration,
    fastStepsNav,
    currentFastStep,
    setCurrentFastStep,
    safetyLevel,
    fallbackReason,
    safeSteps,
    currentStep,
    setCurrentStep,
    handleDestinationSubmit,
    clearRoutes,
  } = useRouteFetcher(
    origin,
    originName,
    mapRef,
    bottomSheetRef as React.RefObject<any>
  );

  // Hook per la navigazione dinamica durante il tragitto
  const { startNavigation, stopNavigation, isNavigating, headingAngle } =
    useLiveNavigation(mapRef);

  // Funzione di supporto per trovare il punto più vicino alla posizione attuale
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

  // Al primo caricamento, ottiene la posizione dell’utente
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

      // Ottiene coordinate GPS
      const location = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setOrigin(coords);

      // Geocodifica inversa per mostrare un nome comprensibile
      const reverseGeocode = await Location.reverseGeocodeAsync(coords);
      if (reverseGeocode[0]) {
        const { street, name, city } = reverseGeocode[0];
        setOriginName(`${street || name}, ${city}`);
      }

      // Anima la mappa per centrarla sulla posizione
      mapRef.current?.animateToRegion({
        ...coords,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    })();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {/* Sezione mappa con i percorsi tracciati */}
      <MapSection
        mapRef={mapRef}
        selectedRoute={selectedRoute}
        safeRoute={safeRoute}
        fastRoute={fastRoute}
        destinationCoords={destinationCoords}
        destinationName={destinationName}
        onMapPress={!isNavigating ? clearRoutes : undefined}
      />

      {/* Pulsante per annullare la navigazione */}
      {isNavigating && (
        <TouchableOpacity
          onPress={() => {
            stopNavigation();
            bottomSheetRef.current?.open();
          }}
          style={{
            position: "absolute",
            top: 80,
            right: 16,
            backgroundColor: "white",
            padding: 8,
            borderRadius: 20,
            elevation: 5,
          }}
        >
          <Ionicons name="close" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      )}

      {/* Indicazioni durante la navigazione per il percorso SICURO */}
      {isNavigating && selectedRoute === "safe" && safeSteps[currentStep] && (
        <View
          style={{
            position: "absolute",
            top: 130,
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

      {/* Indicazioni durante la navigazione per il percorso VELOCE */}
      {isNavigating &&
        selectedRoute === "fast" &&
        fastStepsNav[currentFastStep] && (
          <View
            style={{
              position: "absolute",
              top: 130,
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

      {/* Barra di ricerca per inserire destinazione */}
      <SearchBar
        destination={destination}
        onChangeDestination={setDestination}
        onSubmit={handleDestinationSubmit}
      />

      {/* Bottom sheet con riepilogo e opzioni di percorso */}
      <RouteBottomSheet
        bottomSheetRef={bottomSheetRef}
        selectedRoute={selectedRoute}
        setSelectedRoute={setSelectedRoute}
        safeDuration={safeDuration}
        fastDuration={fastDuration}
        startNavigation={() =>
          startNavigation({
            origin,
            selectedRoute,
            safeRoute,
            setSafeRoute,
            fastRoute,
            setFastRoute,
            safeSteps,
            currentStep,
            setCurrentStep,
            fastSteps: fastStepsNav,
            currentFastStep,
            setCurrentFastStep,
            findNearestIndex,
            bottomSheetRef,
            onArrive: () => bottomSheetRef.current?.open(),
          })
        }
        onClose={clearRoutes}
        safeStops={safeStops}
        fastStops={fastStops}
        safetyLevel={safetyLevel}
        fallbackReason={fallbackReason}
      />
    </View>
  );
}


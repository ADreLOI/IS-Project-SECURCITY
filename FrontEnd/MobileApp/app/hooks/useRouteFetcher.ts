// useRouteFetcher.ts
// Hook personalizzato per gestire la logica di fetch e gestione dei percorsi (sicuro e veloce),
// inclusa geocodifica della destinazione, chiamata all’API backend e Google Directions API.

import { useState } from "react";
import { Alert } from "react-native";
import axios from "axios";
import type MapView from "react-native-maps";
import { Modalize } from "react-native-modalize";
import { decodePolyline } from "../utils/map";
import Constants from 'expo-constants';
// API Key di Google Maps (da proteggere in produzione)
const { apiUrl, GOOGLE_MAPS_API_KEY } = Constants.expoConfig?.extra ?? {};

// Tipi personalizzati per coordinate e tappe
export type Coordinate = { latitude: number; longitude: number };
export type Tappa = { nome: string; coordinate: [number, number] };

// Hook principale che riceve coordinate iniziali, nomi e riferimenti alle componenti
export default function useRouteFetcher(
  origin: Coordinate | null,
  originName: string,
  mapRef: React.RefObject<MapView>,
  bottomSheetRef: React.RefObject<Modalize>
) {
  // Stato destinazione e relative coordinate
  const [destination, setDestination] = useState("");
  const [destinationName, setDestinationName] = useState("Destinazione");
  const [destinationCoords, setDestinationCoords] = useState<Coordinate | null>(
    null
  );

  // Stato per percorso sicuro
  const [safeRoute, setSafeRoute] = useState<Coordinate[] | null>(null);
  const [safeStops, setSafeStops] = useState<Tappa[]>([]);
  const [safeDuration, setSafeDuration] = useState<string | null>(null);
  const [safeSteps, setSafeSteps] = useState<
    { instruction: string; polyline: Coordinate[] }[]
  >([]);
  const [safetyLevel, setSafetyLevel] = useState<string | null>(null);
  const [fallbackReason, setFallbackReason] = useState<string | null>(null);

  // Stato per percorso veloce
  const [fastRoute, setFastRoute] = useState<Coordinate[] | null>(null);
  const [fastStops, setFastStops] = useState<string[]>([]);
  const [fastDuration, setFastDuration] = useState<string | null>(null);

  const [currentStep, setCurrentStep] = useState(0);

  // Funzione che chiama il backend e Google Directions API per calcolare entrambi i percorsi
  const fetchRoutes = async () => {
    if (!origin || !destinationCoords) return;
    try {
      // Chiamata al backend per ottenere percorso sicuro personalizzato
      const safeRes = await axios.post(
        `${apiUrl}/api/v1/itinerario/percorso-sicuro`,
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

      // Se non esiste un itinerario valido, mostra motivo e interrompe
      if (!safeRes.data.itinerario) {
        setSafeRoute(null);
        setFallbackReason(safeRes.data.message);
        setSafeStops([]);
        bottomSheetRef.current?.open();
        return;
      }

      // Parsing dei dati dell'itinerario sicuro
      const itinerario = safeRes.data.itinerario;
      const tappe = itinerario.tappe;
      setSafetyLevel(itinerario.gradoSicurezzaTotale);
      setFallbackReason(null);
      setSafeStops(tappe);

      // Prepara URL per Google Directions API (modo walking + tappe)
      const originStr = `${tappe[0].coordinate[1]},${tappe[0].coordinate[0]}`;
      const destinationStr = `${tappe[tappe.length - 1].coordinate[1]},${tappe[tappe.length - 1].coordinate[0]}`;
      const waypointsStr = tappe
        .slice(1, -1)
        .map((t: any) => `${t.coordinate[1]},${t.coordinate[0]}`)
        .join("|");

      const safeURL =
        `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}` +
        `&destination=${destinationStr}&mode=walking&waypoints=${encodeURIComponent(
          waypointsStr
        )}&key=${GOOGLE_MAPS_API_KEY}`;

      // Chiamata a Google Directions API per percorso sicuro
      const safeResGoogle = await axios.get(safeURL);
      const status = safeResGoogle.data.status;
      const route = safeResGoogle.data.routes[0];
      const poly = route.overview_polyline.points;
      const legs = route.legs[0];

      // Salva polyline decodificata e durata
      setSafeRoute(decodePolyline(poly));
      setSafeDuration(legs.duration.text);

      // Estrai indicazioni dettagliate per la navigazione
      const steps = legs.steps.map((s: any) => ({
        instruction: s.html_instructions.replace(/<[^>]+>/g, ""),
        polyline: decodePolyline(s.polyline.points),
      }));
      setSafeSteps(steps);
      setCurrentStep(0);

      // Preparazione e chiamata per percorso veloce (senza waypoints)
      const fastURL =
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}` +
        `&destination=${destinationCoords.latitude},${destinationCoords.longitude}&mode=walking&key=${GOOGLE_MAPS_API_KEY}`;
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

      // Centra la mappa tra origine e destinazione
      mapRef.current?.fitToCoordinates([origin, destinationCoords], {
        edgePadding: { top: 100, bottom: 300, left: 50, right: 50 },
        animated: true,
      });

      // Ritardo per garantire animazione fluida, poi mostra la bottom sheet
      await new Promise((res) => setTimeout(res, 300));
      bottomSheetRef.current?.open();
    } catch (err) {
      console.error("Errore nel calcolo percorsi:", err);
      Alert.alert("Errore", "Impossibile calcolare i percorsi.");
    }
  };

  // Geocodifica la destinazione inserita dall’utente e lancia fetchRoutes
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

      // Anima centramento sulla destinazione
      mapRef.current?.animateToRegion({
        ...coords,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      // Avvia fetch dei percorsi
      fetchRoutes();
    } catch (err) {
      console.error("Errore nel geocoding:", err);
      Alert.alert("Errore", "Indirizzo non valido.");
    }
  };

  // Esportazione di stati e funzioni utili al componente chiamante
  return {
    destination,
    setDestination,
    destinationName,
    destinationCoords,
    safeRoute,
    setSafeRoute,
    safeStops,
    safeDuration,
    fastRoute,
    setFastRoute,
    fastStops,
    fastDuration,
    safetyLevel,
    fallbackReason,
    safeSteps,
    setSafeSteps,
    currentStep,
    setCurrentStep,
    handleDestinationSubmit,
  };
}

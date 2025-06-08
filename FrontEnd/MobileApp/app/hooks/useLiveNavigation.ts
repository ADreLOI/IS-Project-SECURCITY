// useLiveNavigation.ts
// Hook personalizzato che gestisce la modalità di navigazione attiva con aggiornamento in tempo reale
// della posizione dell’utente e dell’orientamento sulla mappa.

import { useState, useRef, useEffect } from "react";
import * as Location from "expo-location";
import type MapView from "react-native-maps";
import type { Modalize } from "react-native-modalize";
import type { Coordinate } from "./useRouteFetcher";

// Ogni step rappresenta una tappa delle indicazioni dettagliate del percorso sicuro
interface Step {
  instruction: string;
  polyline: Coordinate[];
}

// Parametri richiesti per iniziare la navigazione
interface StartParams {
  origin: Coordinate | null; // punto di partenza
  selectedRoute: "safe" | "fast"; // tipo di percorso selezionato
  safeRoute: Coordinate[] | null;
  setSafeRoute: React.Dispatch<React.SetStateAction<Coordinate[] | null>>;
  fastRoute: Coordinate[] | null;
  setFastRoute: React.Dispatch<React.SetStateAction<Coordinate[] | null>>;
  safeSteps: Step[]; // elenco delle tappe del percorso sicuro
  currentStep: number; // step attuale
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  findNearestIndex: (
    coords: Coordinate[],
    loc: { latitude: number; longitude: number }
  ) => number; // funzione per trovare la coordinata più vicina alla posizione attuale
  bottomSheetRef: React.RefObject<Modalize>; // riferimento alla bottom sheet da chiudere
}

// Hook principale
export default function useLiveNavigation(mapRef: React.RefObject<MapView>) {
  const [isNavigating, setIsNavigating] = useState(false); // flag che indica se la navigazione è attiva
  const [headingAngle, setHeadingAngle] = useState(0); // angolo di orientamento del dispositivo
  const locationSub = useRef<Location.LocationSubscription | null>(null); // riferimento al listener sulla posizione
  const headingSub = useRef<Location.LocationSubscription | null>(null); // riferimento al listener sull’orientamento

  // Al dismount del componente: rimuove entrambi i listener per evitare memory leak
  useEffect(() => {
    return () => {
      locationSub.current?.remove();
      headingSub.current?.remove();
    };
  }, []);

  // Funzione che avvia la navigazione e aggiorna posizione/orientamento in tempo reale
  const startNavigation = async ({
    origin,
    selectedRoute,
    safeRoute,
    setSafeRoute,
    fastRoute,
    setFastRoute,
    safeSteps,
    currentStep,
    setCurrentStep,
    findNearestIndex,
    bottomSheetRef,
  }: StartParams) => {
    if (!origin) return;

    // Chiude la bottom sheet e attiva il flag di navigazione
    bottomSheetRef.current?.close();
    setIsNavigating(true);

    // Listener sulla posizione attuale dell’utente
    locationSub.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 1000, // aggiornamento ogni secondo
        distanceInterval: 1, // oppure ogni metro
      },
      (loc) => {
        const { latitude, longitude } = loc.coords;

        // Aggiorna la porzione residua del percorso (safe o fast)
        if (selectedRoute === "safe" && safeRoute) {
          const i = findNearestIndex(safeRoute, loc.coords);
          setSafeRoute(safeRoute.slice(i));
        } else if (selectedRoute === "fast" && fastRoute) {
          const i = findNearestIndex(fastRoute, loc.coords);
          setFastRoute(fastRoute.slice(i));
        }

        // Avanza allo step successivo del percorso sicuro se si è vicini al punto finale dello step attuale
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

        // Anima la mappa per seguire la posizione in tempo reale con orientamento
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

    // Listener sull’orientamento (bussola) del dispositivo
    headingSub.current = await Location.watchHeadingAsync((heading) => {
      const newHeading = heading.trueHeading ?? heading.magHeading;
      setHeadingAngle(newHeading);
      mapRef.current?.animateCamera(
        { heading: newHeading, pitch: 60 },
        { duration: 300 }
      );
    });
  };

  // Hook restituisce la funzione per avviare la navigazione, stato attivo e angolo attuale
  return { startNavigation, isNavigating, headingAngle };
}
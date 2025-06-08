// MapSection.tsx
// Componente responsabile della visualizzazione della mappa con percorsi e marker finali

import React from "react";
import MapView, { Marker, Polyline } from "react-native-maps";
import { COLORS } from "../constants/colors";

// Tipo per rappresentare una coordinata geografica (latitudine e longitudine)
export type Coordinate = { latitude: number; longitude: number };

// Proprietà accettate dal componente MapSection
interface Props {
  mapRef: React.RefObject<MapView>; // riferimento alla mappa, usato per animazioni e fit dinamico
  selectedRoute: "safe" | "fast"; // tipo di percorso selezionato: sicuro o veloce
  safeRoute: Coordinate[] | null; // array di coordinate per il percorso sicuro
  fastRoute: Coordinate[] | null; // array di coordinate per il percorso veloce
  destinationCoords: Coordinate | null; // coordinate della destinazione selezionata
  destinationName: string; // nome leggibile della destinazione
  onMapPress?: () => void; // callback per chiudere la ricerca se si tocca fuori
}

// Componente principale per il rendering della mappa e dei percorsi
export default function MapSection({
  mapRef,
  selectedRoute,
  safeRoute,
  fastRoute,
  destinationCoords,
  destinationName,
  onMapPress,
}: Props) {
  return (
    <MapView
      ref={mapRef}
      style={{ flex: 1 }}
      showsUserLocation // mostra la posizione attuale dell’utente
      showsMyLocationButton // mostra il pulsante per tornare alla posizione dell’utente
      onPress={onMapPress}
    >
      {/* Rendering del percorso SICURO (doppia linea: bordo esterno + colore primario) */}
      {selectedRoute === "safe" && safeRoute && (
        <>
          <Polyline
            coordinates={safeRoute}
            strokeColor={COLORS.primary} // bordo esterno più spesso
            strokeWidth={10}
          />
          <Polyline
            coordinates={safeRoute}
            strokeColor={COLORS.highlight} // linea principale più sottile sopra
            strokeWidth={6}
          />
        </>
      )}

      {/* Rendering del percorso VELOCE (doppia linea) */}
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

      {/* Marker sulla destinazione, se definita */}
      {destinationCoords && (
        <Marker coordinate={destinationCoords} title={destinationName} />
      )}
    </MapView>
  );
}

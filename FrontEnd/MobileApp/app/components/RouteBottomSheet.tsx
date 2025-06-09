// RouteBottomSheet.tsx
// Componente che rappresenta la bottom sheet contenente le informazioni sul percorso selezionato,
// i pulsanti per cambiare tipo di percorso, avviare la navigazione e visualizzare le tappe.

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from "react-native";
import { Modalize } from "react-native-modalize";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants/colors";
import { useRouter } from 'expo-router';
import AsyncStorage from "@react-native-async-storage/async-storage";
// Tipo che rappresenta una tappa intermedia del percorso sicuro
export type Tappa = { nome: string; coordinate: [number, number] };
  const router = useRouter();

// Proprietà accettate dal componente
interface Props {
  bottomSheetRef: React.RefObject<Modalize>; // riferimento alla bottom sheet per aprirla o chiuderla da fuori
  selectedRoute: "safe" | "fast"; // tipo di percorso attualmente selezionato
  setSelectedRoute: (route: "safe" | "fast") => void; // funzione per cambiare il tipo di percorso
  safeDuration: string | null; // durata stimata del percorso sicuro
  fastDuration: string | null; // durata stimata del percorso veloce
  startNavigation: () => void; // funzione per avviare la navigazione
  safeStops: Tappa[]; // elenco delle tappe intermedie del percorso sicuro
  fastStops: string[]; // descrizioni step del percorso veloce
  safetyLevel: string | null; // grado di sicurezza del percorso sicuro
  fallbackReason: string | null; // motivo del fallback (es. nessun percorso sicuro disponibile)
  onClose: () => void; // callback per chiudere la ricerca
}

// Componente principale
export default function RouteBottomSheet({
  bottomSheetRef,
  selectedRoute,
  setSelectedRoute,
  safeDuration,
  fastDuration,
  startNavigation,
  safeStops,
  fastStops,
  safetyLevel,
  fallbackReason,
  onClose,
}: Props) {
  return (
    <Modalize
      ref={bottomSheetRef}
      modalHeight={420}
      withOverlay={false}
      overlayStyle={{ backgroundColor: "transparent" }}
      handleStyle={{ backgroundColor: COLORS.primary }}
    >
      <ScrollView style={{ padding: 16 }}>
        <TouchableOpacity
          onPress={onClose}
          style={{ position: "absolute", right: 8, top: 8, padding: 4 }}
        >
          <Ionicons name="close" size={20} color={COLORS.primary} />
        </TouchableOpacity>
        {/* Titolo dinamico in base al tipo di percorso selezionato */}
        <Text style={{ fontWeight: "bold", fontSize: 16 }}>
          {selectedRoute === "safe"
            ? `Percorso Sicuro`
            : `Percorso Veloce a piedi ${
                fastDuration ? `(${fastDuration})` : ""
              }`}
        </Text>

        {/* Grado di sicurezza, solo per percorso sicuro */}
        {safetyLevel && selectedRoute === "safe" && (
          <Text style={{ fontStyle: "italic", fontSize: 12, color: "gray" }}>
            Grado sicurezza: {safetyLevel}
          </Text>
        )}

        {/* Motivo del fallback (es. percorso non disponibile) */}
        {fallbackReason && (
          <Text
            style={{ color: "red", fontWeight: "500", textAlign: "center" }}
          >
            {fallbackReason}
          </Text>
        )}

        {/* Pulsanti per selezionare il tipo di percorso */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            marginVertical: 20,
          }}
        >
          {/* Pulsante per selezionare il percorso sicuro */}
          <TouchableOpacity
            onPress={() => setSelectedRoute("safe")}
            style={{
              backgroundColor: selectedRoute === "safe" ? "#065f46" : "#e5e7eb",
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

          {/* Pulsante per selezionare il percorso veloce */}
          <TouchableOpacity
            onPress={() => setSelectedRoute("fast")}
            style={{
              backgroundColor: selectedRoute === "fast" ? "#2563eb" : "#e5e7eb",
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

        {/* Pulsante per avviare la navigazione */}
        <TouchableOpacity
          style={{
            backgroundColor: "#059669",
            opacity: 0.85,
            padding: 14,
            borderRadius: 20,
            alignItems: "center",
            marginBottom: 12,
          }}
          onPress={startNavigation}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>
            Avvia Navigazione
          </Text>
        </TouchableOpacity>

        {/* Elenco tappe del percorso sicuro */}
        {selectedRoute === "safe" && safeStops.length > 4 && (
          <FlatList
            data={safeStops}
            keyExtractor={(_, idx) => idx.toString()}
            style={{ marginTop: 8 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  router.push("/screens/home/getAutobus")

                  console.log(JSON.stringify(item));
                  AsyncStorage.setItem('tappa', JSON.stringify(item));
                }} // <-- qui definisci l'azione
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
              </TouchableOpacity>
            )}
          />
        )}

        {/* Elenco tappe del percorso veloce */}
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
  );
}

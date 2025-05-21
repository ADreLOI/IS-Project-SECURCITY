import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, TouchableOpacity, Modal, ScrollView } from "react-native";
import axios from "axios";
import Animated, { FadeIn, SlideInLeft } from "react-native-reanimated";

// Component for displaying the details of a single report
export default function DettaglioSegnalazione() {
  const { id } = useLocalSearchParams(); // Get dynamic route param
  const router = useRouter();

  // State to hold the current report data
  const [segnalazione, setSegnalazione] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false); // Modal for delete confirmation

  // Fetch report on mount or when ID changes
  useEffect(() => {
    if (id) {
      fetchSegnalazione(id);
    }
  }, [id]);

  // API call to fetch the selected report
  const fetchSegnalazione = async (id: string | string[]) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/v1/operatoreComunale/segnalazione/${id}`
      );
      setSegnalazione(response.data);
    } catch (error) {
      console.error("Errore nel recupero segnalazione:", error);
    } finally {
      setLoading(false);
    }
  };

  // API call to update the report status (Confirm or Reject)
  const aggiornaStatus = async (nuovoStato: string) => {
    try {
      await axios.put(
        `http://localhost:3000/api/v1/operatoreComunale/segnalazione/stato/${id}`,
        { nuovoStato }
      );
      fetchSegnalazione(id); // Refresh data after update
    } catch (error) {
      console.error("Errore aggiornamento stato:", error);
    }
  };

  // API call to delete the report
  const eliminaSegnalazione = async () => {
    try {
      await axios.delete(
        `http://localhost:3000/api/v1/operatoreComunale/segnalazione/delete/${id}`
      );
      setShowModal(false);
      setTimeout(() => {
        router.push("/operatore/dashboard"); // Navigate back after short delay
      }, 400);
    } catch (error) {
      console.error("Errore eliminazione:", error);
    }
  };

  // Show loading screen if data is still being fetched
  if (loading || !segnalazione) {
    return (
      <View className="flex-1 justify-center items-center bg-[#011126]">
        <Text className="text-white text-xl font-GothamBold">
          Caricamento...
        </Text>
      </View>
    );
  }

  // Styling for the status tag
  const statusColor: Record<"Confermata" | "Pendente" | "Rigettata", string> = {
    Confermata: "text-green-400",
    Pendente: "text-yellow-400",
    Rigettata: "text-red-400",
  };

  return (
    <View className="flex-1 bg-[#011126]">
      {/* Floating back button */}
      <View className="absolute top-6 left-6 z-10">
        <TouchableOpacity
          onPress={() => router.push("/operatore/dashboard")}
          className="bg-[#0AA696] px-4 py-2 rounded-xl shadow-md"
        >
          <Text className="text-white font-GothamBold">← Dashboard</Text>
        </TouchableOpacity>
      </View>

      {/* Scrollable content */}
      <ScrollView contentContainerStyle={{ paddingTop: 100 }} className="px-6">
        {/* Title */}
        <Animated.Text
          entering={SlideInLeft.duration(400)}
          className="text-white text-4xl font-GothamUltra mb-8 text-center"
        >
          Dettaglio Segnalazione
        </Animated.Text>

        {/* Card with full report info */}
        <View className="items-center">
          <Animated.View
            entering={FadeIn.delay(150)}
            className="bg-[#0A1C2E] rounded-2xl p-6 mb-6 shadow-md w-full max-w-xl"
          >
            <Text className="text-white mb-2">
              <Text className="font-GothamBold">Tipo:</Text>{" "}
              {segnalazione.tipoDiReato}
            </Text>
            <Text className="text-white mb-2">
              <Text className="font-GothamBold">Descrizione:</Text>{" "}
              {segnalazione.descrizione}
            </Text>
            <Text className="text-white mb-2">
              <Text className="font-GothamBold">Luogo:</Text>{" "}
              {segnalazione.tappa?.nome} (
              {segnalazione.tappa?.coordinate?.join(", ")})
            </Text>
            <Text className="text-white mb-2">
              <Text className="font-GothamBold">Data:</Text>{" "}
              {new Date(segnalazione.data).toLocaleString()}
            </Text>
            <Text
              className={`mt-2 font-GothamBold ${statusColor[segnalazione.status as "Confermata" | "Pendente" | "Rigettata"]}`}
            >
              Stato: {segnalazione.status}
            </Text>
          </Animated.View>

          {/* Status buttons (only for pending) */}
          {segnalazione.status === "Pendente" && (
            <Animated.View
              entering={FadeIn.delay(300)}
              className="flex-row justify-between mb-6 w-full max-w-xl"
            >
              <TouchableOpacity
                onPress={() => aggiornaStatus("Confermata")}
                className="bg-green-600 px-5 py-3 rounded-xl w-[48%]"
              >
                <Text className="text-white text-center font-GothamBold">
                  Conferma
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => aggiornaStatus("Rigettata")}
                className="bg-red-600 px-5 py-3 rounded-xl w-[48%]"
              >
                <Text className="text-white text-center font-GothamBold">
                  Rigetta
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Delete button */}
          <TouchableOpacity
            onPress={() => setShowModal(true)}
            className="bg-gray-700 px-5 py-3 rounded-xl w-full max-w-xl"
          >
            <Text className="text-white text-center font-GothamBold">
              Elimina Segnalazione
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Confirmation modal */}
      <Modal transparent visible={showModal} animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/50 px-6">
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <Text className="text-gray-800 text-lg font-GothamBold mb-4 text-center">
              Sei sicuro di voler eliminare questa segnalazione?
            </Text>
            <View className="flex-row justify-between">
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                className="bg-gray-400 px-4 py-2 rounded-xl"
              >
                <Text className="text-white font-GothamBold">Annulla</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={eliminaSegnalazione}
                className="bg-red-600 px-4 py-2 rounded-xl"
              >
                <Text className="text-white font-GothamBold">Elimina</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

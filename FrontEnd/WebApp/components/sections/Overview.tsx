import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";
import API_BASE_URL from "@config";

interface Segnalazione {
  _id: string;
  tipoDiReato: string;
  descrizione: string;
  status: string;
  data: string;
}

export default function Overview() {
  const router = useRouter();
  const [recentSegnalazioni, setRecentSegnalazioni] = useState<Segnalazione[]>(
    []
  );

  useEffect(() => {
    const fetchSegnalazioni = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${API_BASE_URL}/api/v1/operatoreComunale/segnalazioni`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const sorted = res.data
          .sort(
            (a: Segnalazione, b: Segnalazione) =>
              new Date(b.data).getTime() - new Date(a.data).getTime()
          )
          .slice(0, 3);

        setRecentSegnalazioni(sorted);
      } catch (err) {
        console.error("Errore nel recupero segnalazioni:", err);
      }
    };

    fetchSegnalazioni();
  }, []);

  // Function to style status pills uniformly
  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Confermata":
        return {
          bgColor: "bg-green-600/20",
          textColor: "text-green-400",
          borderColor: "border-green-400",
        };
      case "Pendente":
        return {
          bgColor: "bg-yellow-500/20",
          textColor: "text-yellow-300",
          borderColor: "border-yellow-300",
        };
      case "Rigettata":
        return {
          bgColor: "bg-red-600/20",
          textColor: "text-red-400",
          borderColor: "border-red-400",
        };
      default:
        return {
          bgColor: "bg-gray-500/20",
          textColor: "text-gray-300",
          borderColor: "border-gray-400",
        };
    }
  };

  return (
    <ScrollView className="p-6 space-y-6">
      {/* Sezione Segnalazioni */}
      <View className="bg-[#0A1C2E] rounded-2xl p-5 shadow-md">
        <Text className="text-white font-GothamBold text-xl mb-4">
          Ultime Segnalazioni
        </Text>

        {recentSegnalazioni.map((s) => {
          const { bgColor, textColor, borderColor } = getStatusStyles(s.status);
          return (
            <TouchableOpacity
              key={s._id}
              className="bg-[#0D2639] rounded-xl p-4 mb-3 shadow-sm hover:bg-[#12354A]"
              onPress={() =>
                router.push({
                  pathname: "/operatore/segnalazioni/[id]",
                  params: { id: s._id },
                })
              }
            >
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="text-white font-GothamBold text-lg">
                    {s.tipoDiReato}
                  </Text>
                  <Text className="text-gray-300 text-sm">
                    {new Date(s.data).toLocaleDateString()}
                  </Text>
                </View>
                <View
                  className={`px-3 py-1 rounded-full border ${borderColor} ${bgColor}`}
                >
                  <Text className={`text-xs font-GothamBold ${textColor}`}>
                    {" "}
                    {s.status}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          className="mt-4 bg-[#0AA696] py-2 px-4 rounded-xl"
          //onPress={() => router.push("/operatore/segnalazioni")}
        >
          <Text className="text-white text-center font-GothamBold">
            Vai a Segnalazioni
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sezione Statistiche */}
      <View className="bg-[#0A1C2E] rounded-2xl p-5 shadow-md">
        <Text className="text-white font-GothamBold text-xl mb-3">
          Statistiche Recenti
        </Text>
        <Text className="text-white">• Incidenti: 35</Text>
        <Text className="text-white">• Furti: 22</Text>
        <TouchableOpacity
          className="mt-4 bg-[#0AA696] py-2 px-4 rounded-xl"
          //onPress={() => router.push("/operatore/statistiche")}
        >
          <Text className="text-white text-center font-GothamBold">
            Vai a Statistiche
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sezione Sensori Affollamento */}
      <View className="bg-[#0A1C2E] rounded-2xl p-5 shadow-md">
        <Text className="text-white font-GothamBold text-xl mb-3">
          Stato Sensori Affollamento
        </Text>
        <Text className="text-white">• Centro - Alto</Text>
        <Text className="text-white">• Stazione - Medio</Text>
        <TouchableOpacity
          className="mt-4 bg-[#0AA696] py-2 px-4 rounded-xl"
          //onPress={() => router.push("/operatore/sensori")}
        >
          <Text className="text-white text-center font-GothamBold">
            Vai a Sensori
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// components/sections/Segnalazioni.tsx
import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";

interface Segnalazione {
  _id: string;
  tipoDiReato: string;
  descrizione: string;
  status: string;
  data: string;
}

// Funzione per assegnare classi di colore in base allo stato
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

export default function Segnalazioni() {
  const [segnalazioni, setSegnalazioni] = useState<Segnalazione[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchSegnalazioni = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:3000/api/v1/operatoreComunale/segnalazioni",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setSegnalazioni(res.data);
      } catch (err) {
        console.error("Errore nel recupero segnalazioni:", err);
      }
    };

    fetchSegnalazioni();
  }, []);

  const confermate = segnalazioni.filter(s => s.status === "Confermata").length;
  const rigettate = segnalazioni.filter(s => s.status === "Rigettata").length;
  const pendenti = segnalazioni.filter(s => s.status === "Pendente").length;

  return (
    <ScrollView className="p-6 space-y-5">
      <Text className="text-white text-3xl font-GothamBold mb-4">
        Segnalazioni recenti
      </Text>

      <View className="mb-4 bg-[#0F2A3B] p-4 rounded-2xl">
        <Text className="text-white text-lg font-GothamBold mb-2"> Riepilogo</Text>
        <View className="flex-row justify-between">
          <Text className="text-green-400 font-GothamBold"> Confermate: {confermate}</Text>
          <Text className="text-yellow-300 font-GothamBold"> Pendenti: {pendenti}</Text>
          <Text className="text-red-400 font-GothamBold">Rigettate: {rigettate}</Text>
        </View>
      </View>


      {segnalazioni.map((s) => {
        const { bgColor, textColor, borderColor } = getStatusStyles(s.status);

        return (
          <TouchableOpacity
            key={s._id}
            activeOpacity={Platform.OS === "web" ? 0.8 : 1}
            onPress={() =>
              router.push({
                pathname: "/operatore/segnalazioni/[id]",
                params: { id: s._id },
              })
            }
            className={`mb-4 bg-[#0A1C2E] rounded-2xl p-5 shadow-md border border-[#0F2A3B] transition-all duration-200 ease-in-out hover:scale-[1.01]`}
            style={{ gap: 4 }}
          >
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-white font-GothamBold text-lg">
                  {s.tipoDiReato}
                </Text>
                <Text className="text-gray-400 text-sm font-GothamBold">
                  {new Date(s.data).toLocaleDateString()}
                </Text>
              </View>
              <View
                className={`px-3 py-1 rounded-full border ${bgColor} ${borderColor}`}
              >
                <Text className={`text-xs font-GothamBold ${textColor}`}>
                  {s.status}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

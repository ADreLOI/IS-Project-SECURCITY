// components/sections/Overview.tsx
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function Overview() {
  const router = useRouter();

  // Mock data per anteprima
  const mockSegnalazioni = [
    { id: 1, tipo: "Furto", data: "2025-05-01" },
    { id: 2, tipo: "Aggressione", data: "2025-05-03" },
  ];

  const mockStatistiche = [
    { id: 1, tipo: "Incidenti", valore: 35 },
    { id: 2, tipo: "Furti", valore: 22 },
  ];

  const mockSensori = [
    { id: 1, zona: "Centro", affollamento: "Alto" },
    { id: 2, zona: "Stazione", affollamento: "Medio" },
  ];

  return (
    <View className="p-6 space-y-6">
      {/* Sezione Segnalazioni */}
      <View className="bg-[#0A1C2E] rounded-2xl p-5 shadow-md">
        <Text className="text-white font-GothamBold text-xl mb-3">
          Ultime Segnalazioni
        </Text>
        {mockSegnalazioni.map((s) => (
          <Text key={s.id} className="text-white">
            • {s.tipo} - {s.data}
          </Text>
        ))}
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
        {mockStatistiche.map((s) => (
          <Text key={s.id} className="text-white">
            • {s.tipo}: {s.valore}
          </Text>
        ))}
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
        {mockSensori.map((s) => (
          <Text key={s.id} className="text-white">
            • {s.zona} - {s.affollamento}
          </Text>
        ))}
        <TouchableOpacity
          className="mt-4 bg-[#0AA696] py-2 px-4 rounded-xl"
          //onPress={() => router.push("/operatore/sensori")}
        >
          <Text className="text-white text-center font-GothamBold">
            Vai a Sensori
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// app/+not-found.tsx
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function NotFound() {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center bg-[#011126] px-6">
      {/* Logo tipografico */}
      <View className="mb-10">
        <Text className="text-5xl font-GothamUltra flex-row">
          <Text className="text-white">SECUR</Text>
          <Text className="text-[#0AA696]">C</Text>
          <Text className="text-white">ITY</Text>
        </Text>
      </View>

      {/* Titolo 404 */}
      <Text className="text-white text-6xl font-GothamUltra mb-4">404</Text>

      {/* Messaggio errore */}
      <Text className="text-white text-xl font-GothamBold mb-8 text-center">
        Pagina non trovata. Il percorso che hai inserito non esiste.
      </Text>

      {/* Pulsante ritorno */}
      <TouchableOpacity
        onPress={() => router.replace("/")}
        className="bg-[#0AA696] px-6 py-3 rounded-2xl"
      >
        <Text className="text-white text-lg font-GothamBold">
          Torna alla Home
        </Text>
      </TouchableOpacity>
    </View>
  );
}

import { useState } from "react";
import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";
import axios from "axios";
import {
  LayoutDashboard,
  ShieldAlert,
  ChartLine,
  Cctv,
  LogOut,
} from "lucide-react";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export default function Sidebar({
  onSelectSection,
}: {
  onSelectSection: (section: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();

  const width = useSharedValue(72);
  const animatedStyle = useAnimatedStyle(() => ({
    width: withTiming(width.value, {
      duration: 300,
      easing: Easing.out(Easing.exp),
    }),
  }));

  const toggleSidebar = () => {
    width.value = expanded ? 72 : 240;
    setExpanded(!expanded);
  };

  const MenuItem = ({ icon: Icon, label, section }: any) => (
    <TouchableOpacity
      onPress={() => onSelectSection(section)}
      className="flex-row items-center py-3 px-4 hover:bg-[#094A57] rounded-xl mt-1"
    >
      <Icon color="#0AA696" size={26} />
      {expanded && (
        <Text className="text-white ml-4 font-GothamBold text-base">
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );

  const handleLogout = async () => {
    console.log("🔴 Logout button pressed"); // VERIFICA VISIVA

    const token = localStorage.getItem("token");

    if (!token) {
      console.error("Token non trovato. Impossibile eseguire il logout.");
      return;
    }

    try {
      const response = await axios({
        method: "post",
        url: "http://localhost:3000/api/v1/operatoreComunale/logout-operatore",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        data: {}, // necessario per POST vuota
      });

      if (response.status === 200) {
        console.log("✅ Logout effettuato con successo");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/";
      } else {
        console.error("❌ Logout fallito:", response.data);
      }
    } catch (error: any) {
      console.error("🔥 Errore durante il logout:", error.message);
      console.error("Dettagli completi:", error);
    }
  };  

  return (
    <Animated.View
      style={[animatedStyle]}
      className="bg-[#0B1E2A] h-screen justify-between p-3 shadow-md border"
    >
      <View>
        {/* Logo Toggle */}
        <TouchableOpacity
          onPress={toggleSidebar}
          className={`mb-6 items-center ${expanded ? "flex-row" : "justify-center"}`}
        >
          {expanded ? (
            <Text className="text-white text-3xl font-GothamUltra flex-row">
              SECUR
              <Text className="text-[#0AA696]">C</Text>
              ITY
            </Text>
          ) : (
            <Text className="text-3xl font-GothamUltra text-[#0AA696]">C</Text>
          )}
        </TouchableOpacity>

        {/* Menu Items */}
        <MenuItem icon={LayoutDashboard} label="Overview" section="overview" />
        <MenuItem
          icon={ShieldAlert}
          label="Segnalazioni"
          section="segnalazioni"
        />
        <MenuItem icon={ChartLine} label="Statistiche" section="statistiche" />
        <MenuItem icon={Cctv} label="Sensori" section="sensori" />
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        className="flex-row items-center py-3 px-4 hover:bg-[#094A57] rounded-xl mt-4 border border-red-500"
        onPress={handleLogout}
      >
        <LogOut color="#F87171" size={26} />
        {expanded && (
          <Text className="text-red-400 ml-4 font-GothamBold text-base border">
            Logout
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

import { useState } from "react";
import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";
import axios from "axios";
import API_BASE_URL from "@config";
import {
  LayoutDashboard,
  ShieldAlert,
  ChartLine,
  Cctv,
  LogOut,
  Info
} from "lucide-react"; // Icon set
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Constants from 'expo-constants';

const { apiUrl } = Constants.expoConfig?.extra ?? {};

// Sidebar component for navigation
export default function Sidebar({
  onSelectSection,
}: {
  onSelectSection: (section: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();

  // Sidebar width animation using Reanimated
  const width = useSharedValue(72);
  const animatedStyle = useAnimatedStyle(() => ({
    width: withTiming(width.value, {
      duration: 300,
      easing: Easing.out(Easing.exp),
    }),
  }));

  // Toggle sidebar between expanded and collapsed
  const toggleSidebar = () => {
    width.value = expanded ? 72 : 240;
    setExpanded(!expanded);
  };

  // Reusable sidebar menu item component
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

  // Handles logout and resets user session
  const handleLogout = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("Token not found. Cannot logout.");
      return;
    }

    try {
      // Backend call to logout endpoint with token in Authorization header
      const response = await axios({
        method: "post",
        url: `${apiUrl}/api/v1/operatoreComunale/logout-operatore`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        data: {}, // Required for POST with no body
      });

      if (response.status === 200) {
        console.log("✅ Logout successful");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/";
      } else {
        console.error("❌ Logout failed:", response.data);
      }
    } catch (error: any) {
      console.error("❌ Error during logout:", error.message);
      console.error("Full details:", error);
    }
  };

  return (
    <Animated.View
      style={[animatedStyle]}
      className="bg-[#0B1E2A] h-screen justify-between p-3 shadow-md border"
    >
      <View>
        {/* Top logo section - toggles on click */}
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

        {/* Navigation items */}
        <MenuItem icon={LayoutDashboard} label="Overview" section="overview" />
        <MenuItem
          icon={ShieldAlert}
          label="Segnalazioni"
          section="segnalazioni"
        />
        <MenuItem icon={ChartLine} label="Statistiche" section="statistiche" />
        <MenuItem icon={Cctv} label="Sensori" section="sensori" />
        <MenuItem icon={Info} label="Informazioni" section="informazioni" />
      </View>

      {/* Logout item */}
      <TouchableOpacity
        onPress={handleLogout}
        className="flex-row items-center py-3 px-4 hover:bg-[#094A57] rounded-xl mt-4 border border-red-500"
      >
        <LogOut color="#F87171" size={26} />
        {expanded && (
          <Text className="text-red-400 ml-4 font-GothamBold ">
            Logout
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

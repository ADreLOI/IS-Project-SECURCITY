// app/operatore/dashboard.tsx

import { useEffect, useState } from "react";
import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { jwtDecode } from "jwt-decode";
import Sidebar from "@/components/Sidebar";
import DashboardContent from "@/components/DashboardContent";

// Define the valid dashboard sections
export type Section =
  | "overview"
  | "segnalazioni"
  | "statistiche"
  | "sensori"
  | "informazioni";

// Define the expected structure of the JWT payload
interface JWTPayload {
  exp: number; // Expiration timestamp
  id: string; // User ID
  email: string; // User email
  [key: string]: any; // Allow additional fields
}

export default function DashboardPage() {
  const { section } = useLocalSearchParams<{ section?: string }>();
  const [selectedSection, setSelectedSection] = useState<Section>("overview");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);

  // Update selected section when query param changes
  useEffect(() => {
    const validSections: Section[] = [
      "overview",
      "segnalazioni",
      "statistiche",
      "sensori",
      "informazioni",
    ];
    if (section && validSections.includes(section as Section)) {
      setSelectedSection(section as Section);
    }
  }, [section]);

  // On mount: verify token validity and extract user info
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode<JWTPayload>(token);
        const now = Math.floor(Date.now() / 1000);
        if (decoded.exp > now) {
          setUser({ id: decoded.id, email: decoded.email });
          setIsAuthenticated(true);
        } else {
          // Token expired
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/";
        }
      } catch {
        // Token decoding failed
        window.location.href = "/";
      }
    } else {
      // No token found
      window.location.href = "/";
    }
  }, []);

  // Prevent rendering until authentication is verified
  if (!isAuthenticated || !user) return null;

  // Wrapper to handle valid section changes
  const handleSelectSection = (section: string) => {
    const validSections: Section[] = [
      "overview",
      "segnalazioni",
      "statistiche",
      "sensori",
      "informazioni",
    ];
    if (validSections.includes(section as Section)) {
      setSelectedSection(section as Section);
    }
  };

  // Main dashboard layout: sidebar on the left, dynamic content on the right
  return (
    <View className="flex flex-row h-screen w-screen bg-[#011126]">
      <Sidebar onSelectSection={handleSelectSection} />
      <View className="flex-1 overflow-y-auto">
        <DashboardContent activeSection={selectedSection} />
      </View>
    </View>
  );
}

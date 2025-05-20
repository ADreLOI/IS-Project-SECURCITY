// app/operatore/dashboard.tsx
import { useEffect, useState } from "react";
import { View } from "react-native";
import { jwtDecode } from "jwt-decode";
import Sidebar from "@/components/Sidebar";
import DashboardContent from "@/components/DashboardContent";

// Tipo specifico per le sezioni supportate
export type Section = "overview" | "segnalazioni" | "statistiche" | "sensori";

interface JWTPayload {
  exp: number;
  id: string;
  email: string;
  [key: string]: any;
}

export default function DashboardPage() {
  const [selectedSection, setSelectedSection] = useState<Section>("overview");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);

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
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/";
        }
      } catch {
        window.location.href = "/";
      }
    } else {
      window.location.href = "/";
    }
  }, []);

  if (!isAuthenticated || !user) return null;

  // Wrapper con validazione del tipo di sezione
  const handleSelectSection = (section: string) => {
    const validSections: Section[] = [
      "overview",
      "segnalazioni",
      "statistiche",
      "sensori",
    ];
    if (validSections.includes(section as Section)) {
      setSelectedSection(section as Section);
    }
  };

  return (
    <View className="flex flex-row h-screen w-screen bg-[#011126]">
      <Sidebar onSelectSection={handleSelectSection} />
      <View className="flex-1 overflow-y-auto">
        <DashboardContent activeSection={selectedSection} />
      </View>
    </View>
  );
}

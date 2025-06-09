// Import the section components that make up each part of the dashboard
import { View, Text } from "react-native";
import Segnalazioni from "./sections/Segnalazioni";
import Statistiche from "./sections/Statistiche";
import Sensori from "./sections/Sensori";
import Overview from "./sections/Overview";
import Informazioni from "./sections/Informazioni";

// Define a type-safe interface for the props this component will receive
interface Props {
  // The currently active dashboard section
  activeSection: "overview" | "segnalazioni" | "statistiche" | "sensori" | "informazioni";
}

// Main component that decides which section to render based on the active selection
export default function DashboardContent({ activeSection }: Props) {
  // Render the appropriate section component based on the active section name
  switch (activeSection) {
    case "segnalazioni":
      return <Segnalazioni />;
    case "statistiche":
      return <Statistiche />;
    case "sensori":
      return <Sensori />;
    case "informazioni":
      return <Informazioni />;
    case "overview":
    default:
      // Fallback case: if the section name is unrecognized, default to overview
      return <Overview />;
  }
}

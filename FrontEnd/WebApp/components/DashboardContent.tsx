// components/DashboardContent.tsx

// Importiamo i componenti che rappresentano le sezioni della dashboard
import { View, Text } from "react-native";
import Segnalazioni from "./sections/Segnalazioni";
import Statistiche from "./sections/Statistiche";
import Sensori from "./sections/Sensori";
import Overview from "./sections/Overview";

// Definiamo un'interfaccia per descrivere i "props" che questo componente riceve
interface Props {
  // Questo prop indica quale sezione è attualmente attiva e visibile
  activeSection: "overview" | "segnalazioni" | "statistiche" | "sensori";
}

// Il componente principale che decide quale contenuto mostrare in base alla sezione attiva
export default function DashboardContent({ activeSection }: Props) {
  // In base al valore di activeSection, viene restituito il componente corrispondente
  switch (activeSection) {
    case "segnalazioni":
      return <Segnalazioni />;
    case "statistiche":
      return <Statistiche />;
    case "sensori":
      return <Sensori />;
    case "overview":
    default:
      // Se per qualche motivo arriva una sezione non valida
      return <Overview />;
  }
}

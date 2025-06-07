import React from "react";
import { View, TouchableOpacity, Text } from "react-native";

interface RouteSelectorProps {
  selected: "sicuro" | "veloce";
  onSelect: (value: "sicuro" | "veloce") => void;
  isSafeAvailable: boolean;
  isFastAvailable: boolean;
}

const RouteSelector: React.FC<RouteSelectorProps> = ({
  selected,
  onSelect,
  isSafeAvailable,
  isFastAvailable,
}) => {
  return (
    <View className="flex-row justify-center space-x-4 mt-4">
      <TouchableOpacity
        className={`px-4 py-2 rounded-full border-2 ${
          selected === "sicuro"
            ? "bg-green-600 border-green-700"
            : "border-gray-300"
        } ${!isSafeAvailable ? "opacity-50" : ""}`}
        onPress={() => isSafeAvailable && onSelect("sicuro")}
        disabled={!isSafeAvailable}
      >
        <Text className="text-white font-bold">Percorso Sicuro</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className={`px-4 py-2 rounded-full border-2 ${
          selected === "veloce"
            ? "bg-blue-600 border-blue-700"
            : "border-gray-300"
        } ${!isFastAvailable ? "opacity-50" : ""}`}
        onPress={() => isFastAvailable && onSelect("veloce")}
        disabled={!isFastAvailable}
      >
        <Text className="text-white font-bold">Percorso Veloce</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RouteSelector;

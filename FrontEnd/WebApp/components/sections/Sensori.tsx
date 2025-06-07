// components/Sensori.tsx
import React from "react";
import { View, Text } from "react-native";
import { Platform } from "react-native";

const Sensori = () => {
  return (
    <View className="p-6">
      <Text className="text-white text-2xl font-GothamBold mb-4">
        Sensori di Affollamento
      </Text>
      
      {Platform.OS === "web" && (
        <View style={{ position: "relative", paddingTop: "56.25%", borderRadius: 12, overflow: "hidden" }}>
          <iframe 
          frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
            title="Live Streaming"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              border: "none",
            }}
          src="https://www.youtube.com/embed/UGBfH55InbQ?si=Kqy_OKoDV_c4lCYD" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
        </View>
      )

      }
    </View>
  );
};

export default Sensori;

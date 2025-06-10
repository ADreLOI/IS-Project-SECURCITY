import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";
import { VictoryPie } from "victory";
import Svg from "react-native-svg";
import API_BASE_URL from "@config";

interface Segnalazione {
  _id: string;
  tipoDiReato: string;
  descrizione: string;
  status: string;
  data: string;
}

export default function Overview() {
  const router = useRouter();
  const [recentSegnalazioni, setRecentSegnalazioni] = useState<Segnalazione[]>(
    []
  );
  const [statisticheReati, setStatisticheReati] = useState<{
    [key: string]: number;
  }>({});
  const [sensori, setSensori] = useState<any[]>([]);

  useEffect(() => {
    const fetchSegnalazioni = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${API_BASE_URL}/api/v1/operatoreComunale/segnalazioni`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const sorted = res.data
          .sort(
            (a: Segnalazione, b: Segnalazione) =>
              new Date(b.data).getTime() - new Date(a.data).getTime()
          )
          .slice(0, 3);

        setRecentSegnalazioni(sorted);

        // Calcola statistiche degli ultimi 7 giorni includendo tutte le segnalazioni
        const today = new Date();
        const countsByType: { [key: string]: number } = {};
        res.data.forEach((s: Segnalazione) => {
          const d = new Date(s.data);
          const diff = Math.floor(
            (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
          );
          if (diff <= 6) {
            countsByType[s.tipoDiReato] =
              (countsByType[s.tipoDiReato] || 0) + 1;
          }
        });
        setStatisticheReati(countsByType);

        // Recupera sensori di affollamento
        try {
          const sensoriRes = await axios.get(
            `${API_BASE_URL}/api/v1/operatoreComunale/sensori`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setSensori(sensoriRes.data);
        } catch (err) {
          console.error("Errore nel recupero sensori:", err);
        }
      } catch (err) {
        console.error("Errore nel recupero segnalazioni:", err);
      }
    };

    fetchSegnalazioni();
  }, []);

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Confermata":
        return {
          bgColor: "bg-green-600/20",
          textColor: "text-green-400",
          borderColor: "border-green-400",
        };
      case "Pendente":
        return {
          bgColor: "bg-yellow-500/20",
          textColor: "text-yellow-300",
          borderColor: "border-yellow-300",
        };
      case "Rigettata":
        return {
          bgColor: "bg-red-600/20",
          textColor: "text-red-400",
          borderColor: "border-red-400",
        };
      default:
        return {
          bgColor: "bg-gray-500/20",
          textColor: "text-gray-300",
          borderColor: "border-gray-400",
        };
    }
  };

  return (
    <ScrollView className="p-6 space-y-6">
      {/* Sezione Segnalazioni */}
      <View className="bg-[#0A1C2E] rounded-2xl p-5 shadow-md mb-4">
        <Text className="text-white font-GothamBold text-xl mb-4">
          Ultime Segnalazioni
        </Text>

        {recentSegnalazioni.map((s) => {
          const { bgColor, textColor, borderColor } = getStatusStyles(s.status);
          return (
            <TouchableOpacity
              key={s._id}
              className="bg-[#0D2639] rounded-xl p-4 mb-3 shadow-sm hover:bg-[#12354A]"
              onPress={() =>
                router.push({
                  pathname: "/operatore/segnalazioni/[id]",
                  params: { id: s._id },
                })
              }
            >
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="text-white font-GothamBold text-lg">
                    {s.tipoDiReato}
                  </Text>
                  <Text className="text-gray-300 text-sm">
                    {new Date(s.data).toLocaleDateString()}
                  </Text>
                </View>
                <View
                  className={`px-3 py-1 rounded-full border ${borderColor} ${bgColor}`}
                >
                  <Text className={`text-xs font-GothamBold ${textColor}`}>
                    {s.status}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Sezione Statistiche */}
      <View className="bg-[#0A1C2E] rounded-2xl p-5 shadow-md mb-4">
        <Text className="text-white font-GothamBold text-xl mb-3">
          Segnalazioni Ultima Settimana
        </Text>
        {Object.keys(statisticheReati).length === 0 ? (
          <Svg width={200} height={200} className="self-center">
            <VictoryPie
              standalone={false}
              width={200}
              height={200}
              data={[{ x: "Nessuna segnalazione", y: 1 }]}
              colorScale={["#6B7280"]}
              labels={({ datum }) => datum.x}
              style={{ labels: { fill: "white", fontSize: 12 } }}
              innerRadius={30}
              labelRadius={70}
            />
          </Svg>
        ) : (
          <View className="flex-row justify-center gap-4">
            <Svg width={200} height={200}>
              <VictoryPie
                standalone={false}
                width={200}
                height={200}
                data={Object.entries(statisticheReati).map(([x, y]) => ({
                  x,
                  y,
                }))}
                innerRadius={30}
                labelRadius={70}
                style={{ labels: { display: "none" } }}
                colorScale={[
                  "#34D399",
                  "#FBBF24",
                  "#F87171",
                  "#60A5FA",
                  "#A78BFA",
                  "#F472B6",
                ]}
              />
            </Svg>
            <View className="justify-center">
              {Object.entries(statisticheReati).map(([type, count], index) => {
                const total = Object.values(statisticheReati).reduce(
                  (acc, cur) => acc + cur,
                  0
                );
                const percent =
                  total > 0 ? ((count / total) * 100).toFixed(1) : "0.0";
                const colors = [
                  "#34D399",
                  "#FBBF24",
                  "#F87171",
                  "#60A5FA",
                  "#A78BFA",
                  "#F472B6",
                ];
                return (
                  <View key={type} className="flex-row items-center mb-1">
                    <View
                      style={{
                        width: 12,
                        height: 12,
                        backgroundColor: colors[index % colors.length],
                        borderRadius: 4,
                        marginRight: 6,
                      }}
                    />
                    <Text className="text-white font-GothamBold text-sm">
                      {type}: {percent}%
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </View>

      {/* Sezione Sensori Affollamento */}
      <View className="bg-[#0A1C2E] rounded-2xl p-5 shadow-md mb-4">
        <Text className="text-white font-GothamBold text-xl mb-3">
          Stato Sensori Affollamento
        </Text>
        {sensori.length === 0 ? (
          <Text className="text-gray-400">Nessun sensore disponibile.</Text>
        ) : (
          sensori.map((s) => (
            <View
              key={s._id}
              className="bg-[#0D2639] rounded-xl p-4 mb-3 shadow-sm hover:bg-[#12354A]"
            >
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="text-white font-GothamBold text-lg">
                    {s.location}
                  </Text>
                  <Text className="text-gray-300 text-sm">
                    Affollamento stimato
                  </Text>
                </View>
                <Text className="text-white font-GothamBold">
                  {s.affollamentoCalcolato}%
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

import React, { useState, useEffect } from "react";
import axios from "axios";
import { GoogleMap, LoadScript, Marker, MarkerClusterer  } from "@react-google-maps/api";
import { AntDesign } from "@expo/vector-icons";
import { VictoryPie } from "victory";
import { VictoryChart, VictoryBar, VictoryAxis } from "victory";
import Svg from "react-native-svg"; 
import { View, Text } from "react-native";

const REATI = ["Molestia", "Furto", "Aggressione", "Minacce", "Pedinamento", "Altro"];
const STATI = ["Confermata", "Pendente", "Rigettata"];

interface Segnalazione {
  _id: string;
  tipoDiReato: string;
  descrizione: string;
  status: string;
  data: string;
  tappa: {
    nome: string;
    coordinate: [number, number];
  };
}

const containerStyle = {
  width: "100%",
  maxWidth: "700px",
  height: "300px",
  borderRadius: "12px",
  overflow: "hidden",
  marginLeft: 30
};

const legendaStyle: React.CSSProperties = {
  width: "100%",
  height: 250,
  maxWidth: "300px",
  color: "white",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  fontFamily: "GothamBold, sans-serif",
  backgroundColor: "#011126",
  borderRadius: 8,
  marginRight: 30
};

const getMarkerColor = (status: string) => {
  switch (status) {
    case "Confermata":
      return "http://maps.google.com/mapfiles/ms/icons/green-dot.png";
    case "Pendente":
      return "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
    case "Rigettata":
      return "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
    default:
      return "";
  }
};

const Statistiche = () => {
  const [segnalazioni, setSegnalazioni] = useState<Segnalazione[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchSegnalazioni = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("Token mancante.");
        return;
      }
      try {
        const res = await axios.get(
          "http://localhost:3000/api/v1/operatoreComunale/segnalazioni",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setSegnalazioni(res.data);
      } catch (err) {
        console.error("Errore nel recupero segnalazioni:", err);
      }
    };
    fetchSegnalazioni();
  }, []);

  const toggleExpanded = (reato: string) => {
    setExpanded((prev) => ({ ...prev, [reato]: !prev[reato] }));
  };

  const segnalazioniPerReato = (reato: string) => {
    return segnalazioni
      .filter((s) => s.tipoDiReato === reato && s.status === "Confermata")
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
      .slice(0, 20);
  };

  const getConfirmedByType = () => {
    const counts: Record<string, number> = {};
    segnalazioni.forEach((s) => {
      if (s.status === "Confermata") {
        counts[s.tipoDiReato] = (counts[s.tipoDiReato] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([key, value]) => ({ x: key, y: value }));
  };

  const getBarDataByHour = (reato: string) => {
  const hoursCount = Array(24).fill(0);

  const filtered = segnalazioni.filter(
    (s) => s.tipoDiReato === reato && s.status === "Confermata"
  );

  filtered.forEach((s) => {
    const date = new Date(s.data);
    const hour = date.getHours();
    hoursCount[hour]++;
  });

  const total = hoursCount.reduce((acc, val) => acc + val, 0);

  return hoursCount.map((count, hour) => ({
    x: hour,
    y: total > 0 ? (count / total) * 100 : 0, // % rispetto al totale
  }));
};


  const getCenter = (items: Segnalazione[]) => {
    if (items.length === 0) return { lat: 45.4642, lng: 9.19 };
    const avgLat = items.reduce((acc, s) => acc + s.tappa.coordinate[1], 0) / items.length;
    const avgLng = items.reduce((acc, s) => acc + s.tappa.coordinate[0], 0) / items.length;
    return { lat: avgLat, lng: avgLng };
  };

  const getStatsForReato = (reato: string) => {
    const segnalazioniTipo = segnalazioni.filter(s => s.tipoDiReato === reato);
    const totale = segnalazioniTipo.length;
    const counts: Record<string, number> = { Confermata: 0, Pendente: 0, Rigettata: 0 };
    segnalazioniTipo.forEach(s => {
      if (counts[s.status] !== undefined) counts[s.status]++;
    });
    const percentuali: Record<string, number> = {};
    STATI.forEach(stato => {
      percentuali[stato] = totale > 0 ? Math.round((counts[stato] / totale) * 100) : 0;
    });
    return { counts, percentuali };
  };

  return (
    <div style={{ padding: 24, backgroundColor: "#011126", minHeight: "100vh"}}>
      <h1 style={{
        color: "white",
        fontSize: 30,
        fontWeight: "bold",
        marginBottom: 28,
        fontFamily: "GothamBold, sans-serif"
      }}>
        Statistiche
      </h1>

      <View className="bg-[#0A1C2E] rounded-2xl p-5 shadow-md mb-4">
  <Text className="text-white font-GothamBold text-xl mb-3 " style={{ fontSize:25 }}>
    Segnalazioni Confermate per Tipo
  </Text>

  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 20 }}>
    {/* Grafico a torta */}
    <Svg width={350} height={350}>
      <VictoryPie
        standalone={false}
        width={350}
        height={350}
        data={getConfirmedByType()}
        innerRadius={50}
        labelRadius={70}
        style={{
          labels: { display:"none"},
        }}
        colorScale={["#34D399", "#FBBF24", "#F87171", "#60A5FA", "#A78BFA"]}
      />
    </Svg>

    {/* Legenda */}
    <View style={{ flexDirection: "column", justifyContent: "center" }}>
      {getConfirmedByType().map((slice, index) => {
        // Calcola percentuale totale
        const total = getConfirmedByType().reduce((acc, cur) => acc + cur.y, 0);
        const percent = total > 0 ? ((slice.y / total) * 100).toFixed(1) : "0.0";

        return (
          <View key={index} style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
            {/* Box colore */}
            <View
              style={{
                width: 20,
                height: 20,
                backgroundColor: ["#34D399", "#FBBF24", "#F87171", "#60A5FA", "#A78BFA"][index],
                borderRadius: 4,
                marginRight: 8,
              }}
            />
            {/* Testo */}
            <Text style={{ color: "white", fontSize: 16, fontWeight: "bold" }}>
              {slice.x}: {percent}%
            </Text>
          </View>
        );
      })}
    </View>
  </View>
</View>


      <View className="bg-[#0A1C2E] rounded-2xl p-5 shadow-md "  style={{ marginBottom: 64 }}>
      <LoadScript googleMapsApiKey="AIzaSyA_HYPztvPp_5YmMFUzc1DiV7RsmE0qYB0">
        {REATI.map((reato) => {
          const datiReato = segnalazioniPerReato(reato);
          const isExpanded = !!expanded[reato];
          const center = getCenter(datiReato);
          const { counts, percentuali } = getStatsForReato(reato);

          return (
          <div key={reato} style={{ marginBottom: 32 }}>
            <button onClick={() => toggleExpanded(reato)} style={{
              background: "none",
              border: "none",
              color: "white",
              fontSize: 20,
              fontWeight: "bold",
              cursor: "pointer",
              fontFamily: "GothamBold, sans-serif",
              display: "flex",
              alignItems: "center",
            }}>
              <span style={{ marginRight: 8 }}>
                {reato} - {datiReato.length}
              </span>
              <AntDesign
                name={expanded[reato] ? "upcircleo" : "downcircleo"}
                size={20}
                color="#0AA696"
              />
            </button>

      {isExpanded && datiReato.length > 0 && (
        <>
          <div style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            
            marginTop: "16px",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            {/* Mappa */}
            <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={13}>
              {datiReato.map((s) => {
                const coords = s.tappa?.coordinate;
                if (!coords || coords.length !== 2 || typeof coords[0] !== "number" || typeof coords[1] !== "number") {
                  console.warn(`Coordinate non valide per segnalazione ${s._id}:`, coords);
                  return null;
                }
                const [lng, lat] = coords;
                return (
                  <Marker
                    key={s._id}
                    position={{ lat, lng }}
                    title={`${s.tipoDiReato} - ${s.status} - ${new Date(s.data).toLocaleDateString()}`}
                    icon={getMarkerColor(s.status)}
                  />
                );
              })}
            </GoogleMap>

            {/* Legenda */}
            <div style={legendaStyle}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: 8, justifyContent: "center" }}>
                <AntDesign name="checkcircle" size={20} color="#4ade80" style={{ marginRight: 8 }} />
                <span style={{ color: "#4ade80", fontWeight: "bold", fontSize: 20 }}>
                  Confermate: {counts.Confermata} ({percentuali.Confermata}%)
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", marginBottom: 8, justifyContent: "center" }}>
                <AntDesign name="clockcircle" size={20} color="#fbbf24" style={{ marginRight: 8 }} />
                <span style={{ color: "#fbbf24", fontWeight: "bold", fontSize: 20 }}>
                  Pendenti: {counts.Pendente} ({percentuali.Pendente}%)
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <AntDesign name="closecircle" size={20} color="#f87171" style={{ marginRight: 8 }} />
                <span style={{ color: "#f87171", fontWeight: "bold", fontSize: 20 }}>
                  Rigettate: {counts.Rigettata} ({percentuali.Rigettata}%)
                </span>
              </div>
            </div>
          </div>

          {/* Grafico a barre ore */}
          <div style={{ marginTop: 40 }}>
          <p style={{ color: "white", fontWeight: "bold", margin: "0 0 4px 0", fontSize: 25 }}>
            Segnalazioni confermate per ora
          </p>

          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 20 }}>
            <VictoryChart domainPadding={{ x:15 }} height={80} width={150} padding={{ top: 10, bottom: 10, left: 30, right: 10 }}>
              <VictoryAxis
                tickValues={[0, 4, 8, 12, 16, 20, 23]}
                tickFormat={(t) => `${t}:00`}
                style={{ 
                  tickLabels: { fill: "white", fontSize: 3, padding: 1 }, 
                  axis: { stroke: "white" },
                  ticks: { stroke: "white" }
                }}
              />
              <VictoryAxis
                dependentAxis
                tickFormat={(t) => `${Math.round(t)}%`}
                style={{ 
                  tickLabels: { fill: "white", fontSize: 3, padding: 4 },
                
                }}
              />
              <VictoryBar
                data={getBarDataByHour(reato)}
                style={{ data: { fill: "#0AA696" } }}
                barRatio={0.4}
                barWidth={3}
              />
            </VictoryChart>

            {/* Legenda barre */}
            <div style={{ color: "white", fontSize: 20, width: 600 }}>
              <p><strong>Legenda:</strong></p>
              <p>• Asse X: ore del giorno</p>
              <p>• Asse Y: % di segnalazioni confermate</p>
            </div>
          </div>
        </div>
        </>
      )}

      {isExpanded && datiReato.length === 0 && (
        <p style={{ color: "#aaa", marginLeft: 8 }}>
          Nessuna segnalazione per questo reato.
        </p>
      )}
    </div>
  );
})}

      </LoadScript>
      </View>
      <div style={{ height: 80 }} />
    </div>
  );
};

export default Statistiche;

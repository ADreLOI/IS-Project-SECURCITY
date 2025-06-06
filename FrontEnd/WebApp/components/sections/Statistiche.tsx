
import React, { useState, useEffect } from "react";
import axios from "axios";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { AntDesign } from "@expo/vector-icons"; // Se usi React Web con expo vector icons, assicurati sia supportato

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
    coordinate: [number, number]; // [lon, lat]
  };
}

const containerStyle = {
  width: "100%",
  maxWidth: "600px",
  height: "300px",
  borderRadius: "12px",
  overflow: "hidden",
};

const legendaStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "300px",
  marginLeft: "24px",
  color: "white",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  fontFamily: "GothamBold, sans-serif",
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


  const getCenter = (items: Segnalazione[]) => {
    if (items.length === 0) return { lat: 45.4642, lng: 9.19 }; // fallback: Milano
    const avgLat = items.reduce((acc, s) => acc + s.tappa.coordinate[1], 0) / items.length;
    const avgLng = items.reduce((acc, s) => acc + s.tappa.coordinate[0], 0) / items.length;
    return { lat: avgLat, lng: avgLng };
  };

  const getStatsForReato = (reato: string) => {
    const segnalazioniTipo = segnalazioni.filter(s => s.tipoDiReato === reato);
    const totale = segnalazioniTipo.length;
    const counts: Record<string, number> = {
      Confermata: 0,
      Pendente: 0,
      Rigettata: 0,
    };
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
    <div style={{ padding: 24, backgroundColor: "#011126", minHeight: "100vh" }}>
      <h1 style={{
        color: "white",
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 24,
        fontFamily: "GothamBold, sans-serif"
      }}>
        Statistiche
      </h1>

      <LoadScript googleMapsApiKey="AIzaSyA_HYPztvPp_5YmMFUzc1DiV7RsmE0qYB0">
        {REATI.map((reato) => {
          const datiReato = segnalazioniPerReato(reato);
          const isExpanded = !!expanded[reato];
          const center = getCenter(datiReato);
          const { counts, percentuali } = getStatsForReato(reato);

          return (
            <div key={reato} style={{ marginBottom: 32 }}>
              <button onClick={() => toggleExpanded(reato)}
                style={{
                  background: "none",
                  border: "none",
                  color: "white",
                  fontSize: 20,
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontFamily: "GothamBold, sans-serif",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span style={{ marginRight: 8 }}>
                  {reato} ({datiReato.length})
                </span>
                <AntDesign
                name={expanded[reato] ? "upcircleo" : "downcircleo"}
                size={20}
                color="#0AA696"
                />
              </button>

              {isExpanded && datiReato.length > 0 && (
                <div style={{
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: "16px",
                  marginTop: "16px"
                }}>
                  {/* Mappa */}
                  <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={center}
                    zoom={13}
                  >
                    {datiReato.map((s) => {
                      const coords = s.tappa?.coordinate;
                      if (
                        !coords ||
                        coords.length !== 2 ||
                        typeof coords[0] !== "number" ||
                        typeof coords[1] !== "number"
                      ) {
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
                    <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                      <AntDesign name="checkcircle" size={20} color="#4ade80" style={{ marginRight: 8 }} />
                      <span style={{ color: "#4ade80", fontWeight: "bold" }}>
                        Confermate: {counts.Confermata} ({percentuali.Confermata}%)
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                      <AntDesign name="clockcircle" size={20} color="#fbbf24" style={{ marginRight: 8 }} />
                      <span style={{ color: "#fbbf24", fontWeight: "bold" }}>
                        Pendenti: {counts.Pendente} ({percentuali.Pendente}%)
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <AntDesign name="closecircle" size={20} color="#f87171" style={{ marginRight: 8 }} />
                      <span style={{ color: "#f87171", fontWeight: "bold" }}>
                        Rigettate: {counts.Rigettata} ({percentuali.Rigettata}%)
                      </span>
                    </div>
                  </div>
                </div>
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
    </div>
  );
};

export default Statistiche;

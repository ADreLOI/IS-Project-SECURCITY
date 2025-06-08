import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert, TextInput } from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";
import Modal from "react-native-modal";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const livelliSicurezza = ["Alto", "Medio", "Basso", "Nullo"];

export default function Informazioni() {

    const [informazione, setInformazione] = useState("");
    const [tappaNome, setTappaNome] = useState("");
    const [coordinateLong, setCoordinateLong] = useState("");
    const [coordinateLat, setCoordinateLat] = useState("");
    const [gradoSicurezzaAssegnato, setGradoSicurezzaAssegnato] = useState("Medio");
    const [loading, setLoading] = useState(false);
    const [informazioniList, setInformazioniList] = useState<any[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedInfo, setSelectedInfo] = useState<any>(null);
    

    const getToken = async () => {
        return await AsyncStorage.getItem("token");
    };

    const fetchInformazioni = async () => {
    try {
        const token = await getToken();

        const res = await axios.get("http://localhost:3000/api/v1/operatoreComunale/informazioni", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        setInformazioniList(res.data);
    } catch (err: any) {
        console.error("Errore nel caricamento", err);
    }
    };

    useEffect(() => {
    fetchInformazioni();
    }, []);

    const handleCreateInformazione = async () => {
        if(!informazione || !tappaNome || !coordinateLong || !coordinateLat) {
            Alert.alert("Compila tutti i campi");
            return;
        }

        const data = {
            informazione,
            tappa: {
                nome: tappaNome,
                coordinate: [parseFloat(coordinateLong), parseFloat(coordinateLat)],

            },
            gradoSicurezzaAssegnato,
        };

        try {
            setLoading(true);
            const res = await axios.post("http://localhost:3000/api/v1/operatoreComunale/informazioni", data, {
                headers: {
                    Authorization: 'Bearer ${token}',
                    "Content-Type": "application/json",
                },
            });

            Alert.alert("Informazione Comunale creata con successo");
            setInformazione("");
            setTappaNome("");
            setCoordinateLat("");
            setCoordinateLong("");
            setGradoSicurezzaAssegnato("Medio");
            fetchInformazioni();
        } catch (err: any) {
            Alert.alert("Errore durante la creazione.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
    try {
        const token = await getToken();

        await axios.delete(`http://localhost:3000/api/v1/operatoreComunale/informazioni/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        Alert.alert("Informazione eliminata correttamente");
        fetchInformazioni();
    } catch (err) {
        console.error("Errore durante l'eliminazione", err);
        Alert.alert("Errore durante l'eliminazione");
    }
    };

    return (
    <ScrollView className="p-6 bg-[#011126] min-h-screen">
        <Text className="text-white text-2xl font-bold mb-4 font-GothamBold">Crea nuova informazione</Text>
        <View className="flex-1 items-center justify-center">
        <View className="w-[90%] max-w-[400px] bg-[#112233] rounded-2xl p-6 shadow-lg mb-6">
          <TextInput
            placeholder="Informazione"
            placeholderTextColor="#999"
            value={informazione}
            onChangeText={setInformazione}
            className="bg-[#1f2a37] text-white p-3 rounded-lg mb-3 font-GothamBold"
          />
          <TextInput
            placeholder="Nome tappa"
            placeholderTextColor="#999"
            value={tappaNome}
            onChangeText={setTappaNome}
            className="bg-[#1f2a37] text-white p-3 rounded-lg mb-3 font-GothamBold"
          />
          <TextInput
            placeholder="Coordinate longitudine"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={coordinateLong}
            onChangeText={setCoordinateLong}
            className="bg-[#1f2a37] text-white p-3 rounded-lg mb-3 font-GothamBold"
          />
          <TextInput
            placeholder="Coordinate latitudine"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={coordinateLat}
            onChangeText={setCoordinateLat}
            className="bg-[#1f2a37] text-white p-3 rounded-lg mb-4 font-GothamBold"
          />

          
          <Text className="text-white font-bold mb-2 text-center font-GothamBold">Grado di sicurezza</Text>
          <View className="flex-row flex-wrap justify-center mb-4">
            {livelliSicurezza.map((livello) => (
              <TouchableOpacity
                key={livello}
                onPress={() => setGradoSicurezzaAssegnato(livello)}
                className={`px-4 py-2 rounded-full mr-2 mb-2 ${
                  gradoSicurezzaAssegnato === livello ? "bg-[#0AA696]" : "bg-[#374151]"
                }`}
              >
                <Text className="text-white font-GothamBold">{livello}</Text>
              </TouchableOpacity>
            ))}
          </View>

          
          <TouchableOpacity
            onPress={handleCreateInformazione}
            disabled={loading}
            className="bg-[#0AA696] p-3 rounded-lg items-center"
          >
            <Text className="text-white font-bold font-GothamBold">
              {loading ? "Invio in corso..." : "Crea Informazione"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text className="text-white text-xl font-bold mb-2 font-GothamBold">Informazioni esistenti</Text>

      {informazioniList.map((info) => (
        <TouchableOpacity
            key={info._id}
            onPress={() => {
                setSelectedInfo(info);
                setModalVisible(true);
            }}
            className="bg-[#1f2a37] p-4 rounded-lg mb-3 flex-row justify-between items-center"
        >
            <View>
                <Text className="text-white font-bold font-GothamBold">{info.informazione}</Text>
            </View>
            <Text className="text-white font-bold font-GothamBold">{info.gradoSicurezzaAssegnato}</Text>
        </TouchableOpacity>
      ))}

      {modalVisible && selectedInfo && (
        <div
            style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            }}
            onClick={() => setModalVisible(false)}
        >
            <div
            onClick={(e) => e.stopPropagation()}
            style={{
                backgroundColor: "#112233",
                borderRadius: 20,
                padding: 20,
                maxWidth: 900,
                width: "90%",
                display: "flex",
                flexWrap: "wrap",
                gap: 20,
            }}
            >
            <div style={{ flex: 1, minWidth: 250 }}>
                <h2 style={{ color: "white", fontFamily: "GothamBold, sans-serif", fontSize: 25}}>Dettagli informazione</h2>
                <p style={{ color: "white", fontFamily: "GothamBold, sans-serif" }}>Informazione: {selectedInfo.informazione}</p>
                <p style={{ color: "white", fontFamily: "GothamBold, sans-serif" }}>Tappa: {selectedInfo.tappa?.nome}</p>
                <p style={{ color: "white", fontFamily: "GothamBold, sans-serif" }}>
                Coordinate: {selectedInfo.tappa?.coordinate?.join(", ")}
                </p>
                <p style={{ color: "white", fontFamily: "GothamBold, sans-serif" }}>
                Grado sicurezza: {selectedInfo.gradoSicurezzaAssegnato}
                </p>
                <div style={{width:"100%", display:"flex", justifyContent: "center"}}>
                <button
                    style={{ backgroundColor: "#DC2626", color: "white", padding: 10, borderRadius: 8, marginTop: 20, paddingLeft: 20, paddingRight: 20, fontFamily: "GothamBold, sans-serif"}}
                    onClick={async () => {
                        await handleDelete(selectedInfo._id);
                        setModalVisible(false);
                    }}
                    >
                Elimina
                </button>
                </div>
            </div>

            <div style={{ width: 400, height: 300, borderRadius: 5 }}>
                <LoadScript googleMapsApiKey="AIzaSyA_HYPztvPp_5YmMFUzc1DiV7RsmE0qYB0">
                <GoogleMap
                    mapContainerStyle={{ width: "100%", height: "100%", borderRadius: 8 }}
                    zoom={14}
                    center={{
                    lat: selectedInfo.tappa.coordinate[1],
                    lng: selectedInfo.tappa.coordinate[0],
                    }}
                >
                    <Marker
                    position={{
                        lat: selectedInfo.tappa.coordinate[1],
                        lng: selectedInfo.tappa.coordinate[0],
                    }}
                    />
                </GoogleMap>
                </LoadScript>
            </div>
            </div>
        </div>
        )}
    </ScrollView>
  );
}
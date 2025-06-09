import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
} from "react-native";
import axios from "axios";
import Modal from "react-native-modal";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AddressAutocomplete from "../AddressAutocomplete";

const livelliSicurezza = ["Alto", "Medio", "Basso", "Nessuno"];

export default function Informazioni() {
  const [informazione, setInformazione] = useState("");
  const [indirizzo, setIndirizzo] = useState("");
  const [coordinateLong, setCoordinateLong] = useState("");
  const [coordinateLat, setCoordinateLat] = useState("");
  const [gradoSicurezzaAssegnato, setGradoSicurezzaAssegnato] =
    useState("Medio");
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

      const res = await axios.get(
        "http://localhost:3000/api/v1/operatoreComunale/informazioni",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setInformazioniList(res.data);
    } catch (err: any) {
      console.error("Errore nel caricamento", err);
    }
  };

  useEffect(() => {
    fetchInformazioni();
  }, []);

  const handleCreateInformazione = async () => {
    if (!informazione || !indirizzo || !coordinateLong || !coordinateLat) {
      Alert.alert("Compila tutti i campi");
      return;
    }

    const data = {
      informazione,
      tappa: {
        nome: indirizzo,
        coordinate: [parseFloat(coordinateLong), parseFloat(coordinateLat)],
      },
      gradoSicurezzaAssegnato,
    };

    try {
      const token = await getToken();
      setLoading(true);
      await axios.post(
        "http://localhost:3000/api/v1/operatoreComunale/informazioni",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      Alert.alert("Informazione Comunale creata con successo");
      setInformazione("");
      setIndirizzo("");
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

      await axios.delete(
        `http://localhost:3000/api/v1/operatoreComunale/informazioni/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      Alert.alert("Informazione eliminata correttamente");
      fetchInformazioni();
    } catch (err) {
      console.error("Errore durante l'eliminazione", err);
      Alert.alert("Errore durante l'eliminazione");
    }
  };

  return (
    <ScrollView className="p-6 bg-[#011126] min-h-screen">
      <Text className="text-white text-2xl font-bold mb-4 font-GothamBold">
        Crea nuova informazione
      </Text>
      <View className="flex-1 items-center justify-center">
        <View className="w-[90%] max-w-[400px] bg-[#112233] rounded-2xl p-6 shadow-lg mb-6">
          <TextInput
            placeholder="Informazione"
            placeholderTextColor="#999"
            value={informazione}
            onChangeText={setInformazione}
            className="bg-[#1f2a37] text-white p-3 rounded-lg mb-3 font-GothamBold"
          />
          <AddressAutocomplete
            placeholder="Indirizzo"
            onSelect={({ description, lat, lng }) => {
              setIndirizzo(description);
              setCoordinateLat(lat.toString());
              setCoordinateLong(lng.toString());
            }}
          />

          <Text className="text-white font-bold mb-2 text-center font-GothamBold">
            Grado di sicurezza
          </Text>
          <View className="flex-row flex-wrap justify-center mb-4">
            {livelliSicurezza.map((livello) => (
              <TouchableOpacity
                key={livello}
                onPress={() => setGradoSicurezzaAssegnato(livello)}
                className={`px-4 py-2 rounded-full mr-2 mb-2 ${
                  gradoSicurezzaAssegnato === livello
                    ? "bg-[#0AA696]"
                    : "bg-[#374151]"
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

      <Text className="text-white text-xl font-bold my-4 font-GothamBold">
        Informazioni esistenti
      </Text>

      {informazioniList.map((info) => (
        <TouchableOpacity
          key={info._id}
          onPress={() => {
            setSelectedInfo(info);
            setModalVisible(true);
          }}
          className="bg-[#1f2a37] p-4 rounded-lg mb-3 flex-row justify-between items-center border border-[#0AA696] shadow"
        >
          <View>
            <Text className="text-white font-GothamBold">
              {info.informazione}
            </Text>
          </View>
          <Text className="text-white font-GothamBold">
            {info.gradoSicurezzaAssegnato}
          </Text>
        </TouchableOpacity>
      ))}

      {modalVisible && selectedInfo && (
        <Modal
          isVisible={modalVisible}
          onBackdropPress={() => setModalVisible(false)}
        >
          <View className="bg-[#112233] rounded-2xl p-6 w-full max-w-3xl mx-auto">
            <Text className="text-2xl font-GothamBold mb-4 text-center">
              <Text className="text-[#0BBFA6]">Dettagli informazione</Text>
            </Text>

            {/* Righe di dettaglio */}
            <Text className="mb-1 text-base font-GothamBold">
              <Text className="text-[#0BBFA6]">Informazione: </Text>
              <Text className="text-white">{selectedInfo.informazione}</Text>
            </Text>

            <Text className="mb-1 text-base font-GothamBold">
              <Text className="text-[#0BBFA6]">Indirizzo: </Text>
              <Text className="text-white">{selectedInfo.tappa?.nome}</Text>
            </Text>

            <Text className="mb-1 text-base font-GothamBold">
              <Text className="text-[#0BBFA6]">Coordinate: </Text>
              <Text className="text-white">
                {selectedInfo.tappa?.coordinate?.join(", ")}
              </Text>
            </Text>

            <Text className="mb-3 text-base font-GothamBold">
              <Text className="text-[#0BBFA6]">Grado sicurezza: </Text>
              <Text className="text-white">
                {selectedInfo.gradoSicurezzaAssegnato}
              </Text>
            </Text>
            <View className="items-center mb-4">
              <View
                style={{
                  width: 400,
                  height: 300,
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                <LoadScript
                  googleMapsApiKey="AIzaSyA_HYPztvPp_5YmMFUzc1DiV7RsmE0qYB0"
                  libraries={["marker"]}
                >
                  <GoogleMap
                    mapContainerStyle={{
                      width: "100%",
                      height: "100%",
                      borderRadius: 8,
                    }}
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
              </View>
            </View>
            <TouchableOpacity
              onPress={async () => {
                await handleDelete(selectedInfo._id);
                setModalVisible(false);
              }}
              className="bg-red-600 px-4 py-3 rounded-lg items-center mt-2"
            >
              <Text className="text-white font-GothamBold">Elimina</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
}

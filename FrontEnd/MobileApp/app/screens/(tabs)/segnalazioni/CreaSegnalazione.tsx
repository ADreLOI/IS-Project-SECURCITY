import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Pressable,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";
import DateTimePicker from "@react-native-community/datetimepicker";
import AddressAutocomplete from "../../../components/addressAutocomplete"
import { jwtDecode } from "jwt-decode";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { JWTPayload } from "../../../types/index";
import { useCittadino } from "../../../context/cittadinoContext";
import { API_BASE_URL } from "../../../../config"; //

export default function CreaSegnalazione() {
  const router = useRouter();
  const { cittadino } = useCittadino();
  const { setCittadino } = useCittadino();

  const [selectedReato, setSelectedReato] = useState<string>("");
  const [descrizione, setDescrizione] = useState<string>("");
  const [lat, setLat] = useState<string>("");
  const [lng, setLng] = useState<string>("");

  const [dateEvent, setDateEvent] = useState("");
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const [nomeLuogo, setNomeLuogo] = useState<string>("");

  const toggleDatepicker = () => {
    setShowPicker(!showPicker);
  };

  const onChange = (event: any, selectedDate?: Date) => {
    if (event.type == "set" && selectedDate) {
      const currentDate = selectedDate;
      setDate(currentDate);
      if (Platform.OS === "android") {
        toggleDatepicker();
        setDateEvent(currentDate.toDateString());
      }
    } else {
      toggleDatepicker();
    }
  };

  const confirmIOSDate = () => {
    setDateEvent(date.toDateString());
    setDate(date);
    toggleDatepicker();
  };

  const reatiDisponibili = [
    "Molestia",
    "Furto",
    "Aggressione",
    "Minacce",
    "Pedinamento",
    "Altro",
  ];

  const handleSubmit = async (): Promise<void> => 
  {
    if (!selectedReato || !descrizione || !lat || !lng) {
      Alert.alert("Tutti i campi sono obbligatori!");
      return;
    }

    const token = await AsyncStorage.getItem("jwtToken");
    if (token) {
      const decoded = jwtDecode<JWTPayload>(token);
      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/v1/cittadino/segnalazione`,
          {
            userID: decoded.id,
            tipoDiReato: selectedReato,
            descrizione,
            data: date,
            tappa: {
              nome: nomeLuogo || "Luogo segnalato",
              coordinate: [parseFloat(lng), parseFloat(lat)],
            },
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 201) {
          Alert.alert("Segnalazione inviata con successo!");
          setSelectedReato("");
          setDescrizione("");
          setLat("");
          setLng("");
        } else {
          Alert.alert("Errore", "Impossibile inviare la segnalazione.");
        }
      } catch (err: any) {
        Alert.alert("Errore", err.message || "Errore durante l'invio.");
        console.log(JSON.stringify(err, null, 2));
      }
    } else {
      Alert.alert("Errore", "Token non trovato. Effettua il login.");
      router.push("../login");
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-[#011126] px-6 pt-8"
      contentContainerStyle={{ alignItems: "center", paddingBottom: 20 }}
    >
      <View className="w-full max-w-xl space-y-4">
        <View className="flex-row flex-wrap justify-center gap-2">
          {reatiDisponibili.map((reato) => (
            <TouchableOpacity
              key={reato}
              onPress={() => setSelectedReato(reato)}
              className={`px-4 py-2 rounded-full ${
                selectedReato === reato ? "bg-[#0AA696]" : "bg-gray-300"
              }`}
            >
              <Text
                className={`font-GothamBold ${
                  selectedReato === reato ? "text-white" : "text-gray-800"
                }`}
              >
                {reato}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View>
          <Text className="text-white font-GothamBold mb-1">Data</Text>
          {showPicker && (
            <DateTimePicker
              mode="date"
              display="spinner"
              value={date}
              onChange={onChange}
              maximumDate={new Date()}
            />
          )}

          {showPicker && Platform.OS === "ios" && (
            <View
              style={{ flexDirection: "row", justifyContent: "space-around" }}
            >
              <TouchableOpacity
                style={{ paddingHorizontal: 20 }}
                onPress={toggleDatepicker}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ paddingHorizontal: 20 }}
                onPress={confirmIOSDate}
              >
                <Text>Confirm</Text>
              </TouchableOpacity>
            </View>
          )}

          {!showPicker && (
            <Pressable onPress={toggleDatepicker}>
              <TextInput
                placeholder="Seleziona data"
                value={dateEvent}
                editable={false}
                pointerEvents="none"
                className="border border-[#0AA696] rounded-3xl px-4 py-3 bg-gray-100 text-gray-800"
                onPressIn={toggleDatepicker}
              />
            </Pressable>
          )}
        </View>

        <View>
          <Text className="text-white font-GothamBold mb-1">Descrizione</Text>
          <TextInput
            className="border border-[#0AA696] rounded-3xl px-4 py-3 bg-gray-100 text-gray-800"
            placeholder="Descrivi l'accaduto"
            multiline
            numberOfLines={4}
            value={descrizione}
            onChangeText={setDescrizione}
          />
        </View>

        <View>
          <Text className="text-white font-GothamBold mb-1">
            Indirizzo del luogo
          </Text>
          <AddressAutocomplete
            onSelect={({ description, lat, lng }) => {
              setNomeLuogo(description);
              setLat(lat.toString());
              setLng(lng.toString());
            }}
          />
        </View>

        <TouchableOpacity
          className="bg-[#0AA696] rounded-3xl py-4"
          onPress={handleSubmit}
        >
          <Text className="text-center text-white font-GothamBold">
            Invia Segnalazione
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

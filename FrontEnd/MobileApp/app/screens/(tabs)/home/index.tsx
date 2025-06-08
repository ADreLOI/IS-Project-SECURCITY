import React, { useEffect, useState, useRef } from "react";
import MapView, { Marker } from "react-native-maps";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  Modal,
  FlatList,
} from "react-native";
import axios from "axios";
import { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { getDistance } from "geolib";
import { Modalize } from "react-native-modalize";

//250 meters as threshold for nearby stops

type StopTimes = {
  arrivalTime: string;
  departureTime: string;
  stopId: number;
  stopSequence: number;
  tripId: string;
  type: string;
};

type Corse = {
  cableway: string;
  corsaPiuVicinaADataRiferimento: boolean;
  delay: number;
  directionId: number;
  indiceCorsaInLista: number;
  lastEventRecivedAt: string;
  lastSequenceDetection: number;
  matricolaBus: number;
  oraArrivoEffettivaAFermataSelezionata: string;
  oraArrivoProgrammataAFermataSelezionata: string;
  routeId: number;
  stopLast: number;
  stopNext: number;
  stopTimes: [StopTimes];
  totaleCorseInLista: number;
  tripFlag: string;
  tripHeadsign: string;
  tripId: string;
  type: string;
  wheelchairAccessible: number;
};

type Routes = {
  areaId: 0;
  news: string;
  routeColor: string;
  routeId: number;
  routeLongName: string;
  routeShortName: string;
  routeType: number;
  type: string;
};

type AutobusStop = {
  stopCode: string;
  stopDesc: string;
  stopId: number;
  stopLat: number;
  stopLevel: number;
  stopLon: number;
  stopName: string;
  street: string;
  town: string;
  type: string;
  wheelchairBoarding: number;
  routes: Routes[];
};

type StopsNearbyUser = {
  stopId: number;
  stopName: string;
  stopLat: number;
  stopLon: number;
  stopDesc: string;
  street: string;
  town: string;
  routesArrival: routesArrival[];
};

type routesArrival = {
  routeId: number;
  routeShortName: string;
  routeLongName: string;
  routeColor: string;
  oraArrivoProgrammataAFermataSelezionata: string;
  delay: number;
  tripHeadsign: string;
};

export default function getBusiness() {
  const [autobusStops, setStops] = useState<AutobusStop[]>([]);
  const [StopsNearbyUser, setStopsNearbyUser] = useState<StopsNearbyUser[]>([]);
  const [stopInformation, setStopInformation] = useState<StopsNearbyUser>();
  const [loading, setLoading] = useState(false);
  const modalRef = useRef<Modalize>(null);

  useFocusEffect(
    useCallback(() => {
      const fetchStops = async () => {
        setLoading(true);

        // reset dei risultati a ogni chiamata
        const stopByUser: StopsNearbyUser[] = [];

        try {
          const response = await axios.get(
            "https://app-tpl.tndigit.it/gtlservice/stops",
            {
              auth: {
                username: "mittmobile",
                password: "ecGsp.RHB3",
              },
              params: {
                type: "u",
              },
            }
          );

          if (response.data.length === 0) {
            console.log("No results found");
          } else {
            console.log(`Results found: ${response.data.length}`);
            setStops(response.data);

            const referencePoint = {
              latitude: 46.068325,
              longitude: 11.121112,
            };

            for (const stop of response.data) {
              const distance = getDistance(referencePoint, {
                latitude: stop.stopLat,
                longitude: stop.stopLon,
              });

              if (distance < 400 && stop.town === "Trento") {
                console.log(
                  `Distance from user position to nearby stop: ${stop.stopName} - ${stop.stopId}: ${distance} m`
                );

                // per ogni fermata, creo un array nuovo per le corse
                let routesByStop: routesArrival[] = [];
                const now = new Date();
                await fetchCorse(
                  stop,
                  "2025-06-06T00:45:00Z",
                  routesByStop
                );

                stopByUser.push({
                  stopId: stop.stopId,
                  stopName: stop.stopName,
                  stopLat: stop.stopLat,
                  stopLon: stop.stopLon,
                  stopDesc: stop.stopDesc,
                  street: stop.street,
                  town: stop.town,
                  routesArrival: routesByStop,
                });
              }
            }

            setStopsNearbyUser(stopByUser);
          }
        } catch (error) {
          console.error("Error fetching places:", error);
        } finally {
          setLoading(false);
        }
      };


      const fetchCorse = async (
        stop: AutobusStop,
        date: string,
        routesByStop: routesArrival[]
      ) => {
        try {
          const response = await axios.get(
            "https://app-tpl.tndigit.it/gtlservice/trips_new",
            {
              auth: {
                username: "mittmobile",
                password: "ecGsp.RHB3",
              },
              params: {
                stopId: stop.stopId,
                type: "u",
                limit: 10,
                directionId: 0,
                refDateTime: date,
              },
            }
          );

          if (response.data.length > 0) {
            for (const corsa of response.data as Corse[]) {
              for (const linea of stop.routes) {
                if (corsa.routeId === linea.routeId) {
                  routesByStop.push({
                    routeId: linea.routeId,
                    routeShortName: linea.routeShortName,
                    routeLongName: linea.routeLongName,
                    routeColor: linea.routeColor,
                    oraArrivoProgrammataAFermataSelezionata:
                      corsa.oraArrivoProgrammataAFermataSelezionata,
                    delay: corsa.delay,
                    tripHeadsign: corsa.tripHeadsign,
                  });
                }
              }
            }
          }
        } catch (error) {
          console.error("Error fetching places:", error);
        }
      };

      fetchStops();
    }, [])
  );



 

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0AA696" />
      </View>
    );
  } else {
    return (
      <View style={styles.container}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 46.074779,
            longitude: 11.121749,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          {StopsNearbyUser.map((stop) => (
            <Marker
              key={stop.stopId}
              coordinate={{
                latitude: stop.stopLat,
                longitude: stop.stopLon,
              }}
              title={stop.stopName}
              onPress={() => {
                setStopInformation(stop);
                modalRef.current?.open();
              }}
            >
              <View style={{ alignItems: "center" }}>
                <FontAwesome5
                  name="bus"
                  size={30}
                  color={`#${stop.routesArrival[0]?.routeColor || "000"}`}
                />
                <View
                  style={{
                    width: 0,
                    height: 0,
                    borderLeftWidth: 5,
                    borderRightWidth: 5,
                    borderTopWidth: 10,
                    borderLeftColor: "transparent",
                    borderRightColor: "transparent",
                    borderTopColor: `#${stop.routesArrival[0]?.routeColor || "000"}`,
                    marginTop: -2,
                  }}
                />
              </View>
            </Marker>
          ))}
        </MapView>
        <Modalize
          ref={modalRef}
          modalHeight={500}
          handleStyle={{ backgroundColor: "#0AA696" }}
          modalStyle={{ backgroundColor: "#111126", padding: 16 }}
          flatListProps={{
            data: stopInformation?.routesArrival,
            keyExtractor: (item) =>
              `${item.routeId}-${item.tripHeadsign}-${item.oraArrivoProgrammataAFermataSelezionata}`,
            ListHeaderComponent: () => (
              <Text
                style={{
                  fontSize: 20,
                  color: "#fff",
                  fontWeight: "bold",
                  marginBottom: 16,
                  textAlign: "center",
                }}
              >
                {stopInformation?.stopName}
              </Text>
            ),
            renderItem: ({ item }) => (
              <View
                style={{
                  marginBottom: 16,
                  padding: 16,
                  borderRadius: 12,
                  backgroundColor: "#1a1a2e",
                  borderLeftWidth: 4,
                  borderColor: `#${item.routeColor}`,
                }}
              >
                <Text
                  style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}
                >
                  {item.routeShortName} - {item.routeLongName}
                </Text>
                <Text style={{ color: "#fff" }}>
                  Arrivo previsto:{" "}
                 {new Date(item.oraArrivoProgrammataAFermataSelezionata).toLocaleDateString('it-IT', {
                  weekday: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                </Text>
                <Text style={{ color: "#fff" }}>Ritardo: {item.delay} min</Text>
              </View>
            ),
            ListFooterComponent: () => (
              <View style={{ marginTop: 16, alignItems: "center" }}>
                <TouchableOpacity
                  onPress={() => modalRef.current?.close()}
                  style={{
                    backgroundColor: "#0AA696",
                    paddingHorizontal: 24,
                    paddingVertical: 12,
                    borderRadius: 12,
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "bold" }}>OK</Text>
                </TouchableOpacity>
              </View>
            ),
          }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});
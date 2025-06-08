import React, { useEffect, useState, useRef } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity, Text, Modal,FlatList } from 'react-native';
import axios from 'axios';
import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { getDistance } from 'geolib';
import { Modalize } from 'react-native-modalize';

//250 meters as threshold for nearby stops


type StopTimes =
{
  arrivalTime: string,
  departureTime: string,
  stopId: number,
  stopSequence: number,
  tripId: string,
  type: string
}

type Corse =
{
  cableway: string,
  corsaPiuVicinaADataRiferimento: boolean,
  delay: number,
  directionId: number,
  indiceCorsaInLista: number,
  lastEventRecivedAt: string,
  lastSequenceDetection: number,
  matricolaBus: number,
  oraArrivoEffettivaAFermataSelezionata: string,
  oraArrivoProgrammataAFermataSelezionata: string,
  routeId: number,
  stopLast: number,
  stopNext: number,
  stopTimes:[StopTimes],
  totaleCorseInLista: number,
  tripFlag: string,
  tripHeadsign: string,
  tripId: string,
  type: string,
  wheelchairAccessible: number
}


type Routes =
{
  areaId: 0,
  news: string,
  routeColor: string,
  routeId: number,
  routeLongName: string,
  routeShortName: string,
  routeType: number,
  type: string
}


type AutobusStop = 
{
  stopCode: string,
  stopDesc: string,
  stopId: number,
  stopLat: number,
  stopLevel: number,
  stopLon: number,
  stopName: string,
  street: string,
  town: string,
  type: string,
  wheelchairBoarding: number,
  routes: Routes[]
};



type StopsNearbyUser =
{
  stopId: number,
  stopName: string,
  stopLat: number,
  stopLon: number,
  stopDesc: string,
  street: string,
  town: string,
  routesArrival: routesArrival[]
}

type routesArrival =
{
  routeId: number,
  routeShortName: string,
  routeLongName: string,
  routeColor: string,
  oraArrivoProgrammataAFermataSelezionata: string,
  delay: number,
  tripHeadsign: string,
}
export default function getBusiness() {
  const [autobusStops, setStops] = useState<AutobusStop[]>([]);
  const [StopsNearbyUser, setStopsNearbyUser] = useState<StopsNearbyUser[]>([]);
  const [stopInformation, setStopInformation] = useState<StopsNearbyUser>();
  const [loading, setLoading] = useState(false);
  const stopByUser: StopsNearbyUser[] = []
  let routesByStop: routesArrival[] = [];
  const modalRef = useRef<Modalize>(null);

useFocusEffect(
  useCallback(() => 
    {
    const fetchStops= async () => 
      {
        setLoading(true);
      try 
      {
        const response = await axios.get('https://app-tpl.tndigit.it/gtlservice/stops', 
        {
          auth:
          {
            username: 'mittmobile',
            password: 'ecGsp.RHB3',
          },
          params:
          {
            type: 'u',
           
          }
        });

        if(response.data.length === 0)
        {
          console.log('No results found');
        } 
        else 
        {
            console.log(`Results found: ${response.data.length}`);
            setStops(response.data);
            setLoading(false);
            //Check distance from a specific point to each stop, town is Trento
            const referencePoint = { latitude: 46.068325, longitude: 11.121112 };

            for (const stop of response.data) {
              const stopLocation = { latitude: stop.stopLat, longitude: stop.stopLon };
              const distance = getDistance(referencePoint, stopLocation);
              if(distance < 400 && stop.town === 'Trento') // Check if the stop is within 250 meters and in Trento
              {
                console.log(`Distance from user position to nearby stop: ${stop.stopName} - ${stop.stopId}: ${distance} m`);
                //Once stops are rilevated, fetch the corse
                 //I can fetch the trips by stopId and date
                 const now = new Date();
                await fetchCorse(stop, "2025-06-06T00:45:00Z");
               //console.log("ITERATE")
                       
            }
          }
             
          setStopsNearbyUser(stopByUser);
        }
      } 
      catch (error) 
      {
        console.error('Error fetching places:', error);
        setLoading(false);
      }
    };


    const fetchLinee = async (lineaByStop: Routes): Promise<Routes[]> => 
    {
      const lineeByStop:Routes[] = []
      try 
      {
        const response = await axios.get('https://app-tpl.tndigit.it/gtlservice/routes', 
        {
          auth:
          {
            username: 'mittmobile',
            password: 'ecGsp.RHB3',
          },
          params:
          {
            areas: 23
          }
        });

        if(response.data.length === 0)
        {
          console.log('No results found');
        } 
        else 
        {
            console.log(`Results found: ${response.data.length}`);
            response.data.forEach((linea: Routes) =>
            {
              if(linea.routeId === lineaByStop.routeId)
              {
                //This line is one of the lines of the stop
                console.log(`Linea: ${linea.routeLongName}, ID: ${linea.routeId}, Color: #${linea.routeColor}`);
                lineeByStop.push(linea);
              }
            })
        }
      } 
      catch (error) 
      {
        console.error('Error fetching places:', error);
      }
                  return lineeByStop;
    };

    const fetchCorse = async (stop:AutobusStop, date:string) => 
    {
        try 
        {
          const response = await axios.get('https://app-tpl.tndigit.it/gtlservice/trips_new', 
          {
            auth:
            {
              username: 'mittmobile',
              password: 'ecGsp.RHB3',
            },
            params:
            {
              //Fetch trips by Linea
              stopId: stop.stopId,
              type: 'u',
              limit: 10,
              directionId: 0,
              refDateTime: date
            }
          });

          if(response.data.length === 0)
          {
            console.log('No results found');
          } 
          else 
          {

              console.log(`Results found: ${response.data.length}`);
              response.data.forEach((corsa: Corse) =>
              {
                //Check for the linee
                stop.routes.forEach((linea: Routes) =>
                {
                  if(corsa.routeId === linea.routeId)
                  {
                    //This linea is one of the lines of the corsa
                    //console.log(`Corsa: ${corsa.tripHeadsign}, ID: ${corsa.tripId}, Linea: ${linea.routeLongName}, Arrivo alla fermata: ${corsa.oraArrivoProgrammataAFermataSelezionata}, Ritardo: ${corsa.delay} seconds`);
                    const route: routesArrival =
                    {
                      routeId: linea.routeId,
                      routeShortName: linea.routeShortName,
                      routeLongName: linea.routeLongName,
                      routeColor: linea.routeColor,
                      oraArrivoProgrammataAFermataSelezionata: corsa.oraArrivoProgrammataAFermataSelezionata,
                      delay: corsa.delay,
                      tripHeadsign: corsa.tripHeadsign,
                    }
                    routesByStop.push(route);
                    //So i need the time of arrival at the stop
                  }
                })
              }); 

            // setCorse(response.data);
            stopByUser.push(
            {
              stopId: stop.stopId,
              stopName: stop.stopName,
              stopLat: stop.stopLat,
              stopLon: stop.stopLon,
              stopDesc: stop.stopDesc,
              street: stop.street,
              town: stop.town,
              routesArrival: routesByStop
            })
              routesByStop = [] //Reset the routesByStop for the next stop
          }
        } 
        catch (error) 
        {
          console.error('Error fetching places:', error);
        }
      };

    fetchStops();
  }, [])
);

 

  const handleStopPress = (stop: StopsNearbyUser) => {
  modalRef.current?.close(); // ensure it closes
  setTimeout(() => {
    setStopInformation(stop); // trigger re-open in useEffect
  }, 100); // give it time to unmount
};

useEffect(() => {
  if (stopInformation) {
    setTimeout(() => {
      modalRef.current?.open();
    }, 50); // Delay opening slightly
  }
}, [stopInformation]);


  if(loading)
  {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0AA696" />
      </View>
    );
  }
  else
  {

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
            onPress={ () => {
              stop.routesArrival.forEach((route) => 
              {
                console.log(`Route: ${route.routeShortName} - ${route.routeLongName}, Arrival Time: ${route.oraArrivoProgrammataAFermataSelezionata}, Delay: ${route.delay} seconds`);
              })
              //Show a modal with the routes and arrival times
              handleStopPress(stop);
            }} // Add your custom handler here
          >
            <View style={{ alignItems: 'center' }}>
              <FontAwesome5 name="bus" size={30} color={`#${stop.routesArrival[0].routeColor}`} />
              <View
                style={{
                  width: 0,
                  height: 0,
                  borderLeftWidth: 5,
                  borderRightWidth: 5,
                  borderTopWidth: 10,
                  borderLeftColor: 'transparent',
                  borderRightColor: 'transparent',
                  borderTopColor: `#${stop.routesArrival[0].routeColor}`,
                  marginTop: -2,
                }}
              />
            </View>
          </Marker>
        ))} 

  {/* 
   {autobusStops.map((stop) => (
          <Marker
            key={stop.stopId}
            coordinate={{
              latitude: stop.stopLat,
              longitude: stop.stopLon,
            }}
            title={stop.stopName}
            pinColor="#0AA696" // any CSS color: "red", "#00ff00", etc.
            >
              
            </Marker>
        ))}
            */}
      </MapView>

      <Modalize
        ref={modalRef}
        modalHeight={500}
        handleStyle={{ backgroundColor: '#0AA696' }}
        modalStyle={{ backgroundColor: '#111126', padding: 16 }}
        flatListProps={{
          data: stopInformation?.routesArrival,
          keyExtractor: (item) => `${item.routeId}-${item.tripHeadsign}-${item.oraArrivoProgrammataAFermataSelezionata}`,
          ListHeaderComponent: () => (
            <Text className="text-xl text-white font-bold mb-4 text-center">
              {stopInformation?.stopName}
            </Text>
          ),
          renderItem: ({ item }) => (
            <View
              className="mb-4 p-4 rounded-xl"
              style={{
                backgroundColor: '#1a1a2e',
                borderLeftWidth: 4,
                borderColor: `#${item.routeColor}`,
              }}
            >
              <Text className="text-white text-lg font-bold">
                {item.routeShortName} - {item.routeLongName}
              </Text>
              <Text className="text-white">
                Arrivo previsto: {item.oraArrivoProgrammataAFermataSelezionata}
              </Text>
              <Text className="text-white">Ritardo: {item.delay} min</Text>
            </View>
          ),
          ListFooterComponent: () => (
            <View className="mt-4 flex-row justify-center">
              <TouchableOpacity
                onPress={() => modalRef.current?.close()}
                className="bg-[#0AA696] px-6 py-2 rounded-xl"
              >
                <Text className="text-white font-bold">OK</Text>
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

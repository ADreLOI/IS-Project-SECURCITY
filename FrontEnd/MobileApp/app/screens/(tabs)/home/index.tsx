import React, { useEffect, useState } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { getDistance } from 'geolib';

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
  const [corse, setCorse] = useState<Corse[]>([]);
  const [loading, setLoading] = useState(true);
  const stopByUser: StopsNearbyUser[] = []
  let routesByStop: routesArrival[] = [];

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
              if(distance < 1000 && stop.town === 'Trento') // Check if the stop is within 250 meters and in Trento
              {
                console.log(`Distance from user position to nearby stop: ${stop.stopName} - ${stop.stopId}: ${distance} m`);
                //Once stops are rilevated, fetch the corse
                 //I can fetch the trips by stopId and date
                await fetchCorse(stop, new Date().toISOString());
                       console.log("ITERATE")
                       
            }
          }
    
        console.log("CIAOOO")
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
      let corsaByStop: StopsNearbyUser;    
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
                  console.log(`Corsa: ${corsa.tripHeadsign}, ID: ${corsa.tripId}, Linea: ${linea.routeLongName}, Arrivo alla fermata: ${corsa.oraArrivoProgrammataAFermataSelezionata}, Ritardo: ${corsa.delay} seconds`);
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
      {/* Floating Button */}
      <TouchableOpacity
        onPress={() => console.log(StopsNearbyUser)}
        className="absolute bottom-6 right-4 bg-[#0AA696] p-4 rounded-full shadow-lg"
      >
        <Ionicons name="bus" size={24} color="#fff" />
      </TouchableOpacity>

  {StopsNearbyUser.map((stop) => (
          <Marker
            key={stop.stopId}
            coordinate={{
              latitude: stop.stopLat,
              longitude: stop.stopLon,
            }}
            title={stop.stopName}
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
    </View>
  );
}
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});

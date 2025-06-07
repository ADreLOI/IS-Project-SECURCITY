import React, { useEffect, useState } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';

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

type AutobusLinee = 
{
  areaId: 23,
  news: [],
  routeColor: "C52720",
  routeId: 396,
  routeLongName: string,
  routeShortName: string,
  routeType: number,
  type: string
}

export default function getBusiness() {
  const [autobusStops, setStops] = useState<AutobusStop[]>([]);
  const [linee, setLinee] = useState<AutobusLinee[]>([]);
  const [loading, setLoading] = useState(true);

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
            size: 5
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
        }
      } 
      catch (error) 
      {
        console.error('Error fetching places:', error);
        setLoading(false);
      }
    };

    const fetchLinee= async () => 
      {
        setLoading(true);
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
            console.log(response.data[0]);
            setLinee(response.data);
            setLoading(false);
        }
      } 
      catch (error) 
      {
        console.error('Error fetching places:', error);
        setLoading(false);
      }
    };


    fetchLinee();
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
         <Marker
  key={linee[0].routeId}
  coordinate={{
    latitude: 46.068325,
    longitude: 11.121112,
  }}
  title={linee[0].routeLongName}
>
  <View style={{ alignItems: 'center' }}>
   
    <FontAwesome5 name="bus" size={30} color={`#${linee[0].routeColor}`} />

    {/* Optional pin shape below the icon (like a tip) */}
    <View
      style={{
        width: 0,
        height: 0,
        borderLeftWidth: 5,
        borderRightWidth: 5,
        borderTopWidth: 10,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: `#${linee[1].routeColor}`,
        marginTop: -2,
      }}
    />
  </View>
</Marker>
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

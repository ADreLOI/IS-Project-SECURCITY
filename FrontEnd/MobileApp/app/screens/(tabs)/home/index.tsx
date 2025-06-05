import React, { useEffect, useState } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';

type Place = {
  fsq_id: string;
  name: string;
  geocodes: {
    main: {
      latitude: number;
      longitude: number;
    }
  };
};

export default function Home() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

useFocusEffect(
  useCallback(() => 
    {
    const fetchPlaces = async () => 
      {
        setLoading(true);
      try 
      {
        const response = await axios.get('https://api.foursquare.com/v3/places/search', 
        {
          headers: {
            Authorization: 'fsq3NW+XqOLEuviTJfKPo/uxj3tY1iBBSKpblXa07ExIKRk=',
          },
          params: {
            ll: '46.068325,11.121112',
            radius: 50,
            limit: 20,
          },
        });

        if(response.data.results.length === 0)
        {
          console.log('No results found');
        } 
        else 
        {
        
            response.data.results.forEach(async (element: Place) => 
            {
             const details = await axios.get(
              `https://api.foursquare.com/v3/places/${element.fsq_id}`,
              {
                headers: 
                {
                Authorization: 'fsq3NW+XqOLEuviTJfKPo/uxj3tY1iBBSKpblXa07ExIKRk='
                }
              }
              );

              const hours = details.data.hours ? details.data.hours.display : 'No hours available';
              console.log(`Place: ${element.name}, Hours: ${hours}, Location: ${element.geocodes.main.latitude}, ${element.geocodes.main.longitude}`);
            });         
            setPlaces(response.data.results);
            setLoading(false);
       }
      } 
      catch (error) 
      {
        console.error('Error fetching places:', error);
        setLoading(false);
      }
    };

    fetchPlaces();
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
        {places.map((place) => (
          <Marker
            key={place.fsq_id}
            coordinate={{
              latitude: place.geocodes.main.latitude,
              longitude: place.geocodes.main.longitude,
            }}
            title={place.name}
            pinColor="#0AA696" // any CSS color: "red", "#00ff00", etc.
            >
              
            </Marker>
        ))}
  
      </MapView>
    </View>
  );
}
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});

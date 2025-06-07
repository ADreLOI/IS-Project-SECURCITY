import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { SlideInLeft } from 'react-native-reanimated';
import React, { useState, useEffect, useRef } from 'react';
import { JWTPayload, Segnalazione } from '../../../types/index';
import { useCittadino } from '../../../context/cittadinoContext';
import CreaSegnalazione from './CreaSegnalazione';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const { apiUrl } = Constants.expoConfig?.extra ?? {};

const HomeSegnalazioni = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'first' | 'second'>('first');
  const { cittadino, setCittadino } = useCittadino();
  const [loading, setLoading] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false; // Cleanup on unmount
    };
  }, []);

  useEffect(() => {
    if (activeTab === 'second') {
      fetchSegnalazioniByID();
    }
  }, [activeTab]);

  const fetchSegnalazioniByID = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      if (token) {
        const decoded = jwtDecode<JWTPayload>(token);

        try {
          const response = await axios.get(
            `${apiUrl}/api/v1/cittadino/getAllSegnalazioni/${decoded.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (isMounted.current) {
            if (cittadino) {
              // Avoid mutating state directly; create a new object
              setCittadino({
                ...cittadino,
                storico: response.data.segnalazioniUtente,
              });
            }
          }
        } catch (error: any) {
          Alert.alert('Error', error.response?.data?.message || 'Unknown error');
          console.error(error);
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  // Rest of your render function remains unchanged...

  return (
    <SafeAreaView className="flex-1 bg-[#111126] px-6">
      <ScrollView>
        <View className="flex-col">
          <Animated.View entering={SlideInLeft.duration(500)} className="top-4">
            <View className="pb-9 relative">
              {/* Icons and header text here */}
              <TouchableOpacity className="absolute right-10 top-0 p-2 z-10">
                <Ionicons
                  name="create-outline"
                  onPress={() => router.push('/screens/(tabs)/profile/editProfile')}
                  size={24}
                  color="#0AA696"
                />
              </TouchableOpacity>

              <TouchableOpacity className="absolute right-0 top-0 p-2 z-10">
                <Ionicons name="log-out-outline" size={24} color="#0AA696" />
              </TouchableOpacity>

              <Text className="text-5xl font-GothamUltra flex-row left-5">
                <Text className="text-white">SECUR</Text>
                <Text className="text-[#0AA696]">C</Text>
                <Text className="text-white">ITY</Text>
              </Text>
            </View>
          </Animated.View>

          <View className="flex-1 p-4">
            <Text className="text-xl font-GothamBold text-white mb-4">
              Gestisci le tue segnalazioni!
            </Text>

            {/* Tab Buttons */}
            <View className="flex-row mb-4 rounded-xl overflow-hidden border border-[#0AA696]">
              <TouchableOpacity
                className={`flex-1 py-2 items-center ${
                  activeTab === 'first' ? 'bg-[#0AA696]' : 'bg-[#111126]'
                }`}
                onPress={() => setActiveTab('first')}
              >
                <Text className={`font-GothamBold text-white`}>
                  Crea Segnalazione
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`flex-1 py-2 items-center ${
                  activeTab === 'second' ? 'bg-[#0AA696]' : 'bg-[#111126]'
                }`}
                onPress={() => setActiveTab('second')}
              >
                <Text className={`font-GothamBold text-white`}>
                  Visualizza Storico
                </Text>
              </TouchableOpacity>
            </View>

            {/* Content based on tab */}
            <View className="flex-1">
              {activeTab === 'first' ? (
                <CreaSegnalazione />
              ) : (
                <View className="p-4">
                  {loading ? (
                    <ActivityIndicator size="large" color="#0AA696" />
                  ) : (
                    <View>
                      {cittadino?.storico && cittadino.storico.length > 0 ? (
                        cittadino.storico.map((segnalazione, index) => (
                          <SegnalazioneRow
                            key={index}
                            label={
                              segnalazione?.data
                                ? new Date(segnalazione.data).toLocaleDateString()
                                : 'Data non disponibile'
                            }
                            value={`${segnalazione.tipoDiReato} (${segnalazione.tappa.nome})`}
                            statusIcon={
                              <MaterialIcons
                                name={
                                  segnalazione.status === 'Rigettata'
                                    ? 'cancel'
                                    : segnalazione.status === 'Confermata'
                                    ? 'check-circle'
                                    : 'hourglass-empty'
                                }
                                size={20}
                                color="#0AA696"
                              />
                            }
                            segnalazione={segnalazione}
                          />
                        ))
                      ) : (
                        <Text className="text-center text-gray-400 mt-4">
                          Nessuna segnalazione disponibile
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  type SegnalazioneRowProps = {
    label: string;
    value: string;
    statusIcon: React.ReactNode;
    segnalazione: Segnalazione;
  };

  function SegnalazioneRow({ label, value, statusIcon, segnalazione }: SegnalazioneRowProps) {
    return (
      <TouchableOpacity
        className="flex-row items-start mb-6"
        onPress={() => {
          console.log(JSON.stringify(segnalazione));
          AsyncStorage.setItem('segnalazione', JSON.stringify(segnalazione));
          router.push({ pathname: '/screens/(tabs)/segnalazioni/details' });
        }}
      >
        <View className="w-6 mt-1 mr-4 items-center">
          <Ionicons name="megaphone-outline" size={20} color="#0AA696" />
        </View>
        <View className="flex-1 border-b border-[#0AA696] pb-3">
          <Text className="text-xs text-white mb-1 font-GothamBold">{label}</Text>
          <Text className="text-base text-white font-GothamBold">{value}</Text>
        </View>
        {statusIcon}
      </TouchableOpacity>
    );
  }
};

export default HomeSegnalazioni;

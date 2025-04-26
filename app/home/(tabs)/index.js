
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, Dimensions
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref } from 'firebase/storage';
import axios from 'axios';
import { API_BASE_URL } from '@env';
import { useFonts } from 'expo-font';
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const auth = getAuth();
  const firestore = getFirestore();
  const storage = getStorage();
  const uid = auth.currentUser?.uid;

  const [fontsLoaded] = useFonts({
    Poppins: require('../../../assets/fonts/Poppins-Regular.ttf'),
    PoppinsBold: require('../../../assets/fonts/Poppins-Bold.ttf'),
  });

  useEffect(() => {
    if (uid) fetchUserData();
  }, [uid]);

  const fetchUserData = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/leaderboard?userId=${uid}`);
      const currentUser = res.data.currentUser;

      let avatarUrl = null;
      if (currentUser.avatarPath) {
        const storageRef = ref(storage, currentUser.avatarPath);
        avatarUrl = await getDownloadURL(storageRef);
      }

      setUserData({ ...currentUser, avatarUrl });
    } catch (err) {
      console.error('Błąd pobierania danych:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!fontsLoaded || loading || !userData) {
    return (
      <View style={[styles.center, { backgroundColor: '#FFEFE8' }]}>
        <ActivityIndicator size="large" color="#F67280" />
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.backgroundShape} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          {userData.avatarUrl && (
            <Image source={{ uri: userData.avatarUrl }} style={styles.avatar} />
          )}
          <View>
            <Text style={styles.greeting}>Witaj,</Text>
            <Text style={styles.name}>{userData.nick} 👋</Text>
          </View>
        </View>

        <View style={styles.quoteBox}>
          <Text style={styles.quote}>„Small progress is still progress.”</Text>
        </View>

        <View style={styles.progressBox}>
          <Text style={styles.progressLabel}>Twój dzisiejszy cel:</Text>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: '60%' }]} />
          </View>
          <Text style={styles.progressText}>60% ukończone</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.info}>🔥 Passa: {userData.streak} dni</Text>
          <Text style={styles.info}>🏆 {userData.points} pkt • #{userData.rank}</Text>
        </View>

        <View style={styles.tiles}>
          <Animated.View entering={ZoomIn.delay(100)} style={[styles.tile, styles.tileOne]}>
            <Text style={styles.icon}>📘</Text>
            <Text style={styles.title}>Ostatnia lekcja</Text>
            <Text style={styles.text}>{userData.lastLesson || 'Brak'}</Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(200)} style={[styles.tile, styles.tileTwo]}>
            <Text style={styles.icon}>🚀</Text>
            <Text style={styles.title}>Kontynuuj naukę</Text>
            <Text style={styles.text}>Kliknij aby rozpocząć</Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(300)} style={[styles.tile, styles.tileThree]}>
            <Text style={styles.icon}>📊</Text>
            <Text style={styles.title}>Twoje statystyki</Text>
            <Text style={styles.text}>Zobacz swój postęp</Text>
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#FFEFE8',
  },
  backgroundShape: {
    position: 'absolute',
    width,
    height: 300,
    backgroundColor: '#FFD5A5',
    transform: [{ skewY: '-10deg' }],
    borderBottomRightRadius: 60,
  },
  container: {
    padding: 24,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#fff',
  },
  greeting: {
    fontFamily: 'Poppins',
    fontSize: 16,
    color: '#333',
  },
  name: {
    fontSize: 22,
    fontFamily: 'PoppinsBold',
    color: '#2E2E2E',
  },
  quoteBox: {
    backgroundColor: '#fff6f0',
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
  },
  quote: {
    fontFamily: 'Poppins',
    fontSize: 16,
    color: '#2E2E2E',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  progressBox: {
    backgroundColor: '#F0F4F8',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  progressLabel: {
    fontFamily: 'PoppinsBold',
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  progressBarBackground: {
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ddd',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 12,
    borderRadius: 6,
    backgroundColor: '#6A5ACD',
  },
  progressText: {
    fontFamily: 'Poppins',
    fontSize: 12,
    color: '#444',
    marginTop: 6,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  info: {
    fontFamily: 'Poppins',
    fontSize: 14,
    color: '#444',
  },
  tiles: {
    gap: 20,
  },
  tile: {
    padding: 22,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  tileOne: {
    backgroundColor: '#FFE7D6',
  },
  tileTwo: {
    backgroundColor: '#D0F0E0',
  },
  tileThree: {
    backgroundColor: '#C6E2FF',
  },
  icon: {
    fontSize: 28,
    marginBottom: 8,
  },
  title: {
    fontFamily: 'PoppinsBold',
    fontSize: 16,
    color: '#2E2E2E',
  },
  text: {
    fontFamily: 'Poppins',
    fontSize: 14,
    color: '#333',
    marginTop: 2,
  },
});
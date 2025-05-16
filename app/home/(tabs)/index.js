import React, { useEffect, useState } from 'react';

import NotificationManager from '../../../src/components/NotificationManager';


import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator, Image,
  Dimensions, TouchableOpacity
} from 'react-native';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref } from 'firebase/storage';
import axios from 'axios';
import { API_BASE_URL } from '@env';
import { useFonts } from 'expo-font';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { PieChart } from 'react-native-chart-kit';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/pl';
dayjs.extend(relativeTime);
dayjs.locale('pl');

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const firestore = getFirestore();
  const storage = getStorage();
  const navigation = useNavigation();

  const quotes = [
    'Small progress is still progress.',
    'Practice makes progress.',
    'Jeden dzień, jedno słowo.',
    'Keep going, even slowly.',
    'Success is built on consistency.'
  ];
  const quoteOfTheDay = quotes[Math.floor(Math.random() * quotes.length)];

  const [fontsLoaded] = useFonts({
    Poppins: require('../../../assets/fonts/Poppins-Regular.ttf'),
    PoppinsBold: require('../../../assets/fonts/Poppins-Bold.ttf'),
  });

  useEffect(() => {
  const auth = getAuth();

  const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
    if (!user) {
      console.log('❌ Użytkownik niezalogowany – nie ładuję danych');
      setLoading(false);
      return;
    }

    let unsubscribeSnapshots;

    fetchAllUserData(user.uid).then((unsub) => {
      unsubscribeSnapshots = unsub;
    });

    return () => {
      if (unsubscribeSnapshots) unsubscribeSnapshots();
    };
  });

  return () => unsubscribeAuth();
}, []);


  const subscribeToUserStats = (uid, onStatsUpdate) => {
  const ref = doc(firestore, "userProgress", uid);

  const unsubscribe = onSnapshot(
    ref,
    (snapshot) => {
      if (!snapshot.exists()) {
        console.log('⚠️ Brak danych userProgress – snapshot.exists() === false');
        return;
      }
      const data = snapshot.data();
      const stats = data?.Stats ?? {};
      onStatsUpdate({
        stats: {
          Grammar: stats.Grammar ?? 0,
          Listening: stats.Listening ?? 0,
          Vocabulary: stats.Vocabulary ?? 0,
        },
        streak: data?.Streaks ?? 0,
        lastLesson: data?.lastLesson ?? null,
        updatedAt: data?.UpdatedAt ?? null
      });
    },
    (error) => {
      console.warn('🔥 Błąd snapshotu userProgress:', error.code);
    }
  );

  return unsubscribe;
};


 const subscribeToUserPoints = (uid, onUpdate) => {
  const ref = doc(firestore, 'users', uid);

  const unsubscribe = onSnapshot(
    ref,
    (snapshot) => {
      if (!snapshot.exists()) {
        console.log('⚠️ Brak danych users/{uid} – snapshot.exists() === false');
        return;
      }
      const data = snapshot.data();
      onUpdate({
        points: data?.points ?? 0,
      });
    },
    (error) => {
      console.warn('🔥 Błąd snapshotu users:', error.code);
    }
  );

  return unsubscribe;
};

  const fetchAllUserData = async (uid) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/leaderboard?userId=${uid}`);
      const currentUser = res.data.currentUser;

      let avatarUrl = null;
      if (currentUser.avatarPath) {
        const storageRef = ref(storage, currentUser.avatarPath);
        avatarUrl = await getDownloadURL(storageRef);
      }

      setUserData((prev) => ({
        ...currentUser,
        avatarUrl,
        stats: {},
        points: 0,
        streak: 0,
      }));

      const unsubscribeStats = subscribeToUserStats(uid, (progress) => {
        setUserData((prev) => ({
          ...prev,
          stats: progress.stats,
          streak: progress.streak,
          lastLesson: progress.lastLesson,
          updatedAt: progress.updatedAt
        }));
      });

      const unsubscribePoints = subscribeToUserPoints(uid, ({ points }) => {
        setUserData((prev) => ({
          ...prev,
          points,
        }));
      });

      return () => {
        unsubscribeStats();
        unsubscribePoints();
      };
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

  const statsData = userData.stats || {};
  const pieData = [
    { name: 'Słuchanie', value: statsData.Listening || 0, color: '#4A90E2' },
    { name: 'Gramatyka', value: statsData.Grammar || 0, color: '#F5A623' },
    { name: 'Słownictwo', value: statsData.Vocabulary || 0, color: '#50E3C2' },
  ];
  const topStat = pieData.reduce((prev, curr) => curr.value > prev.value ? curr : prev, { name: '', value: 0 });
  const commentText = topStat.value > 0 ? `📣 Widzę, że najczęściej robisz ${topStat.name.toLowerCase()}!` : '';

  return (
    <View style={styles.wrapper}>
      <NotificationManager /> 
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
          <Text style={styles.quote}>„{quoteOfTheDay}”</Text>
        </View>

        <View style={styles.statsCardRow}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🔥</Text>
            <Text style={styles.statValue}>{userData.streak} dni</Text>
            <Text style={styles.statLabel}>Passa</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🏆</Text>
            <Text style={styles.statValue}>{userData.points} pkt</Text>
            <Text style={styles.statLabel}>Punkty</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📈</Text>
            <Text style={styles.statValue}>#{userData.rank}</Text>
            <Text style={styles.statLabel}>Ranking</Text>
          </View>
        </View>

        <View style={styles.tiles}>
          <TouchableOpacity onPress={() => navigation.navigate('lesson')}>
            <Animated.View entering={ZoomIn.delay(100)} style={[styles.tile, styles.tileOne]}>
              <Text style={styles.icon}>📘</Text>
              <Text style={styles.title}>Ostatnia lekcja</Text>
              <Text style={styles.text}>
                {userData.lastLesson || 'Brak'}{"\n"}
                <Text style={{ fontSize: 12, color: '#888', fontFamily: 'Poppins' }}>
                  {userData.updatedAt ? dayjs(userData.updatedAt.toDate()).fromNow() : ''}
                </Text>
              </Text>
            </Animated.View>
          </TouchableOpacity>
        </View>

        <Text style={{ fontFamily: 'PoppinsBold', fontSize: 18, marginTop: 30, marginBottom: 10, color: '#2E2E2E', textAlign: 'center' }}>
          🧠 Statystyki typów lekcji
        </Text>

        <PieChart
          data={pieData.map(item => ({
            name: item.name,
            population: item.value,
            color: item.color,
            legendFontColor: '#2E2E2E',
            legendFontSize: 16,
            legendFontFamily: 'Poppins'
          }))}
          width={Dimensions.get('window').width - 32}
          height={220}
          chartConfig={{
            color: () => '#333',
            labelColor: () => '#333',
            propsForLabels: { fontFamily: 'Poppins', fontSize: 14 },
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="16"
          center={[0, 0]}
          absolute
          style={{ borderRadius: 16 }}
        />

        {commentText ? (
          <Text style={{ marginTop: 10, textAlign: 'center', fontSize: 16, color: '#333', fontFamily: 'PoppinsBold' }}>
            {commentText}
          </Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#FFEFE8' },
  backgroundShape: {
    position: 'absolute', width, height: 300, backgroundColor: '#FFD5A5',
    transform: [{ skewY: '-10deg' }], borderBottomRightRadius: 60,
  },
  container: { padding: 24, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 15, borderWidth: 2, borderColor: '#fff' },
  greeting: { fontFamily: 'Poppins', fontSize: 16, color: '#333' },
  name: { fontSize: 22, fontFamily: 'PoppinsBold', color: '#2E2E2E' },
  quoteBox: { backgroundColor: '#fff6f0', padding: 16, borderRadius: 14, marginBottom: 16 },
  quote: { fontFamily: 'PoppinsBold', fontSize: 18, color: '#2E2E2E', fontStyle: 'italic', textAlign: 'center' },
  statsCardRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 18,
    marginHorizontal: 6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  statIcon: { fontSize: 30, marginBottom: 6 },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#2E2E2E' },
  statLabel: { fontSize: 14, color: '#666' },
  tiles: { gap: 20 },
  tile: { padding: 22, borderRadius: 20, shadowColor: '#000', shadowOpacity: 0.07, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  tileOne: { backgroundColor: '#FFE7D6' },
  icon: { fontSize: 28, marginBottom: 8 },
  title: { fontFamily: 'PoppinsBold', fontSize: 16, color: '#2E2E2E' },
  text: { fontFamily: 'Poppins', fontSize: 14, color: '#333', marginTop: 2 },
});

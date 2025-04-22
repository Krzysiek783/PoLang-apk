import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image } from 'react-native';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref } from 'firebase/storage';
import axios from 'axios';
import { API_BASE_URL } from '@env';

const BASE_URL = API_BASE_URL;

export default function DashboardScreen() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const auth = getAuth();
  const firestore = getFirestore();
  const storage = getStorage();
  const uid = auth.currentUser?.uid;

  useEffect(() => {
    if (uid) fetchUserData();
  }, [uid]);

  const fetchUserData = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/leaderboard?userId=${uid}&limit=0&offset=0`);
      const currentUser = res.data.currentUser;
  
      if (!currentUser) throw new Error("Brak użytkownika w rankingu");
  
      let avatarUrl = null;
      if (currentUser.avatarPath) {
        const storageRef = ref(storage, currentUser.avatarPath);
        avatarUrl = await getDownloadURL(storageRef);
      }
  
      setUserData({ ...currentUser, avatarUrl });
    } catch (err) {
      console.error('Błąd pobierania danych z backendu:', err);
    } finally {
      setLoading(false);
    }
  };
  

  if (loading || !userData) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        {userData.avatarUrl && (
          <Image source={{ uri: userData.avatarUrl }} style={styles.avatar} />
        )}
        <Text style={styles.greeting}>Witaj ponownie, {userData.nick} 👋</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.info}>🔥 Passa: {userData.streak} dni</Text>
        <Text style={styles.info}>🏆 {userData.points} pkt | #{userData.rank}</Text>
      </View>

      <View style={styles.tiles}>
        <View style={styles.tile}>
          <Text style={styles.tileTitle}>📘 Ostatnia lekcja</Text>
          <Text style={styles.tileContent}>{userData.lastLesson || 'Brak'}</Text>
        </View>

        <View style={styles.tile}>
          <Text style={styles.tileTitle}>🚀 Kontynuuj naukę</Text>
          <Text style={styles.tileContent}>Kliknij aby rozpocząć</Text>
        </View>

        <View style={styles.tile}>
          <Text style={styles.tileTitle}>📊 Statystyki</Text>
          <Text style={styles.tileContent}>Zobacz swój postęp</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
  },
  header: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 20,
  },
  avatar: {
    width: 60, height: 60, borderRadius: 30, marginRight: 15,
  },
  greeting: {
    fontSize: 20, fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20,
  },
  info: {
    fontSize: 16,
  },
  tiles: {
    gap: 15,
  },
  tile: {
    backgroundColor: '#f2f2f2',
    padding: 15,
    borderRadius: 10,
  },
  tileTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  tileContent: {
    color: '#333',
  },
});

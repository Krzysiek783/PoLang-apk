import { View, Text, Button, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { useAuth } from '../../src/contexts/AuthContext';
import { fetchUserProfile } from '../../src/api/api';

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const [userData, setUserData] = useState(null);

  const fetchProfile = async () => {
    try {
      const data = await fetchUserProfile(); // zapytanie do backendu
      setUserData(data);
    } catch (err) {
      console.error('❌ Błąd przy pobieraniu danych profilu:', err);
    }
  };

  useEffect(() => {
    fetchProfile(); // uruchamia się automatycznie po załadowaniu ekranu
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👋 Witaj, {user?.email}!</Text>
      <Text style={styles.subtitle}>To Twój ekran główny</Text>

      {userData ? (
        <>
          <Text style={styles.info}>📛 UID z backendu: {userData.uid}</Text>
          <Text style={styles.info}>📩 Email z backendu: {userData.email}</Text>
        </>
      ) : (
        <Text style={styles.loading}>Ładowanie danych z backendu...</Text>
      )}

      <Button title="Odśwież dane profilu" onPress={fetchProfile} />
      <Button title="Wyloguj się" onPress={logout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#777',
    marginBottom: 10,
  },
  info: {
    fontSize: 14,
    color: '#333',
  },
  loading: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#aaa',
  },
});

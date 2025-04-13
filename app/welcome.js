import { View, Text, StyleSheet, Button } from 'react-native';
import { Link } from 'expo-router';
import { useEffect } from 'react';
import { db } from '../src/config/firebase';
import { doc, setDoc } from 'firebase/firestore';


export default function WelcomeScreen() {

  useEffect(() => {
    const checkConnection = async () => {
      try {
        await setDoc(doc(db, 'test', 'connectionCheck'), {
          timestamp: new Date(),
          message: 'Firestore działa 🚀',
        });
        console.log('✅ Połączono z Firestore (test zapisany)');
      } catch (error) {
        console.error('❌ Błąd połączenia z Firestore:', error.message);
      }
    };
  
    checkConnection();
  }, []);
  


  return (
    <View style={styles.container}>
      <Text style={styles.title}>👋 Witaj w PoLang!</Text>
      <Text style={styles.subtitle}>Nauka angielskiego zaczyna się tutaj</Text>

      <Link href="auth/login/loginScreen" asChild>
        <Button title="Zaloguj się" />
      </Link>

      <Link href="auth/register/step1-account" asChild>
        <Button title="Zarejestruj się" />
      </Link>
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
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#777',
    marginBottom: 30,
  },
});

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { db } from '../src/config/firebase';
import { doc, setDoc } from 'firebase/firestore';
import Animated, { FadeIn } from 'react-native-reanimated';
import { AntDesign } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';

export default function WelcomeScreen() {
  const [fontsLoaded] = useFonts({
    PoppinsBold: require('../assets/fonts/Poppins-Bold.ttf'),
    PoppinsRegular: require('../assets/fonts/Poppins-Regular.ttf'),
  });

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

  if (!fontsLoaded) return null;

  return (
    <LinearGradient
      colors={['#FDE3A7', '#F8B195', '#F67280']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.3, y: 1 }}
      style={styles.gradient}
    >
      <Animated.View style={styles.container} entering={FadeIn.duration(600)}>
        <Text style={styles.title}>
          Dlaczego{' '}
          <Text style={styles.po}>Po</Text>
          <Text style={styles.lang}>Lang</Text>
          ?
        </Text>

        <View style={styles.list}>
          <ListItem text="Nauka dostosowana dla ciebie" />
          <ListItem text="Regularnie zwiększaj swoje umiejętności" />
          <ListItem text="Po prostu ciesz się nauką" />
        </View>

        <Link href="auth/register/step1-account" asChild>
          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Rozpocznij</Text>
          </TouchableOpacity>
        </Link>

        <Text style={styles.or}>Lub</Text>

        <Link href="auth/login/loginScreen" asChild>
          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Mam już Konto</Text>
          </TouchableOpacity>
        </Link>
      </Animated.View>
    </LinearGradient>
  );
}

function ListItem({ text }) {
  return (
    <View style={styles.listItem}>
      <AntDesign name="check" size={20} color="#333" />
      <Text style={styles.listText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: 100,
    paddingBottom: 40,
    paddingHorizontal: 30,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontFamily: 'PoppinsBold',
    textAlign: 'center',
    marginBottom: 40,
  },
  po: {
    color: '#17D5FF',
    fontFamily: 'PoppinsBold',
  },
  lang: {
    color: '#FF7F50',
    fontFamily: 'PoppinsBold',
  },
  list: {
    gap: 25,
    marginBottom: 50,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    maxWidth: 300,
  },
  listText: {
    fontSize: 18,
    fontFamily: 'PoppinsRegular',
    color: '#222',
    flexShrink: 1,
  },
  primaryButton: {
    backgroundColor: '#333',
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 12,
    marginBottom: 10,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'PoppinsBold',
  },
  secondaryButton: {
    backgroundColor: '#17D5FF',
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 12,
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'PoppinsBold',
  },
  or: {
    marginVertical: 10,
    fontSize: 16,
    fontFamily: 'PoppinsRegular',
    color: '#444',
  },
});

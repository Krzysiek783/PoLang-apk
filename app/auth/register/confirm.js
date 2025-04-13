import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert, Button, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { auth, db } from '../../../src/config/firebase';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { uploadAvatarFromUri } from '../../../src/api/uploadAvatar';

export default function ConfirmScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const registerUser = async () => {
      try {
        // 🔐 Tworzymy użytkownika
        const userCred = await createUserWithEmailAndPassword(auth, params.email, params.password);
        const user = userCred.user;

        await sendEmailVerification(user);

        // 🖼️ Obsługa avatara
        let avatarUrl = params.avatarUri;

        // Sprawdź, czy to lokalny plik
        const isLocal = !avatarUrl.startsWith('http');
        if (isLocal) {
          const uploadedUrl = await uploadAvatarFromUri(avatarUrl); // ← używamy params.avatarUri
          if (!uploadedUrl) throw new Error('Błąd przy przesyłaniu avatara');
          avatarUrl = uploadedUrl;
        }

        // 💾 Zapis danych do Firestore
        await setDoc(doc(db, 'users', user.uid), {
          nick: params.nick,
          email: params.email,
          motivations: JSON.parse(params.motivations),
          age: parseInt(params.age),
          gender: params.gender,
          level: params.level,
          notifications: JSON.parse(params.notifications),
          avatarUrl, // ← tu już gotowy publiczny link
          createdAt: new Date(),
          points: 0,
          verified: false,
          firstLogin: true,
        });

        setSuccess(true);
      } catch (error) {
        console.error(error);
        Alert.alert('Błąd rejestracji', error.message);
        router.replace('./step1-account'); // wróć na start
      } finally {
        setLoading(false);
      }
    };

    registerUser();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 20 }}>Tworzymy Twoje konto...</Text>
      </View>
    );
  }

  if (success) {
    return (
      <View style={styles.center}>
        <Image
          source={{
            uri: 'https://firebasestorage.googleapis.com/v0/b/polang-app.appspot.com/o/images%2Fmail.png?alt=media',
          }}
          style={{ width: 120, height: 120, marginBottom: 20 }}
        />
        <Text style={styles.title}>📬 Sprawdź maila!</Text>
        <Text style={styles.text}>Wysłaliśmy link weryfikacyjny na adres:</Text>
        <Text style={styles.bold}>{params.email}</Text>
        <Text style={styles.text}>Po kliknięciu linka będziesz mógł się zalogować.</Text>

        <Button title="Powrót do logowania" onPress={() => router.replace('../login/loginScreen')} />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#fff',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  text: {
    textAlign: 'center',
    marginBottom: 5,
  },
  bold: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

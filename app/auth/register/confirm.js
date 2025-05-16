import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { auth, db } from '../../../src/config/firebase';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { uploadAvatarFromUri } from '../../../src/api/uploadAvatar';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';

export default function ConfirmScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  const [fontsLoaded] = useFonts({
    Poppins: require('../../../assets/fonts/Poppins-Regular.ttf'),
    PoppinsBold: require('../../../assets/fonts/Poppins-Bold.ttf'),
  });

  useEffect(() => {
    const registerUser = async () => {
      try {
        const userCred = await createUserWithEmailAndPassword(
          auth,
          params.email,
          params.password
        );
        const user = userCred.user;

        await sendEmailVerification(user);

        let avatarUrl = params.avatarUri;

        const isLocal = !avatarUrl.startsWith('http');
        if (isLocal) {
          const uploadedUrl = await uploadAvatarFromUri(avatarUrl);
          if (!uploadedUrl) throw new Error('Błąd przy przesyłaniu avatara');
          avatarUrl = uploadedUrl;
        }

        await Promise.all([
  setDoc(doc(db, 'users', user.uid), {
    nick: params.nick,
    email: params.email,
    motivations: JSON.parse(params.motivations),
    age: parseInt(params.age),
    gender: params.gender,
    level: params.level,
    notifications: JSON.parse(params.notifications),
    avatarUri: avatarUrl,
    createdAt: new Date(),
    points: 0,
    verified: false,
    firstLogin: true,
  }),

  setDoc(doc(db, 'userProgress', user.uid), {
    Stats: {
      Grammar: 0,
      Listening: 0,
      Vocabulary: 0,
    },
    Streaks: 0,
    lastLesson: null,
    UpdatedAt: new Date(),
  }),
]);

        setSuccess(true);
      } catch (error) {
        console.error(error);
        Alert.alert('Błąd rejestracji', error.message);
        router.replace('./step1-account');
      } finally {
        setLoading(false);
      }
    };

    registerUser();
  }, []);

  if (!fontsLoaded) return null;

  return (
    <LinearGradient
      colors={['#FDE3A7', '#F8B195', '#F67280']}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.3, y: 1 }}
    >
      <View style={styles.container}>
        {loading ? (
          <>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.text}>Tworzymy Twoje konto...</Text>
          </>
        ) : success ? (
          <>
            <Image
              source={{
                uri: 'https://firebasestorage.googleapis.com/v0/b/polang-app.appspot.com/o/images%2Fmail.png?alt=media',
              }}
              style={styles.image}
            />
            <Text style={styles.title}>📬 Sprawdź maila!</Text>
            <Text style={styles.text}>Wysłaliśmy link weryfikacyjny na adres:</Text>
            <Text style={styles.bold}>{params.email}</Text>
            <Text style={styles.text}>
              Po kliknięciu w link będziesz mógł się zalogować.
            </Text>

            <TouchableOpacity
              style={styles.button}
              onPress={() => router.replace('../login/loginScreen')}
            >
              <Text style={styles.buttonText}>Powrót do logowania</Text>
            </TouchableOpacity>
          </>
        ) : null}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  image: {
    width: 120,
    height: 120,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontFamily: 'PoppinsBold',
    color: '#222',
    textAlign: 'center',
  },
  text: {
    fontSize: 14,
    fontFamily: 'Poppins',
    color: '#333',
    textAlign: 'center',
  },
  bold: {
    fontSize: 14,
    fontFamily: 'PoppinsBold',
    color: '#000',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#17D5FF',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontFamily: 'PoppinsBold',
    fontSize: 16,
  },
});

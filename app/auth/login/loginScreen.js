import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth, db } from '../../../src/config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { syncVerificationWithFirestore } from '../../../src/services/syncVerification';
import { useFonts } from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';
import { useGoogleAuth } from '../../../src/config/googleAuth';


export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { promptAsync } = useGoogleAuth();


  const [fontsLoaded] = useFonts({
    Poppins: require('../../../assets/fonts/Poppins-Regular.ttf'),
    PoppinsBold: require('../../../assets/fonts/Poppins-Bold.ttf'),
  });

  if (!fontsLoaded) return null;

  const handleLogin = async () => {
    const cleanedEmail = email.trim().toLowerCase();
    if (!cleanedEmail || !password) {
      return Alert.alert('Błąd', 'Wprowadź email i hasło.');
    }

    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, cleanedEmail, password);
      await auth.currentUser.reload();

      if (!auth.currentUser.emailVerified) {
        Alert.alert(
          "🔒 Nie potwierdzono adresu email",
          "Musisz kliknąć w link aktywacyjny wysłany na Twój adres email. Czy chcesz, żebym wysłał go ponownie?",
          [
            { text: "Anuluj", style: "cancel" },
            {
              text: "Wyślij ponownie",
              onPress: async () => {
                try {
                  await sendEmailVerification(auth.currentUser);
                  Alert.alert("✅ Wysłano", "Nowy link został wysłany na Twój adres e-mail.");
                } catch (sendErr) {
                  if (sendErr.code === 'auth/too-many-requests') {
                    Alert.alert("Zbyt wiele prób", "Poczekaj kilka minut i spróbuj ponownie.");
                  } else {
                    Alert.alert("Błąd", "Nie udało się wysłać e-maila weryfikacyjnego.");
                  }
                }
              }
            }
          ]
        );
        return;
      }

      await syncVerificationWithFirestore();

      const uid = auth.currentUser.uid;
      const userRef = doc(db, 'users', uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const userData = snap.data();
        if (userData.firstLogin) {
          await updateDoc(userRef, { firstLogin: false });
          router.replace('/onboarding');
          return;
        }
      }

      router.replace('../../home/(tabs)');
    } catch (err) {
      console.error("❌ Błąd logowania:", err.message);
      Alert.alert('Błąd', 'Nieprawidłowy email lub hasło.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#FDE3A7', '#F8B195', '#F67280']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.3, y: 1 }}
      style={styles.gradient}
    >
      <View style={styles.container}>
        <Text style={styles.title}>🔐 Zaloguj się</Text>

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholderTextColor="#666"
          style={styles.input}
        />

        <TextInput
          placeholder="Hasło"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#666"
          style={styles.input}
        />

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.primaryButtonText}>
            {loading ? 'Logowanie...' : 'Zaloguj się'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.or}>Lub</Text>

        <TouchableOpacity
        style={styles.googleButton}
        onPress={() => promptAsync()}
        activeOpacity={0.8}
        >
        <View style={styles.googleContent}>
          <View style={styles.googleIconWrapper}>
            <Image
              source={require('../../../assets/logo/google-logo1.png')}
              style={styles.googleIcon}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.googleButtonText}>Zaloguj się z Google</Text>
        </View>
        </TouchableOpacity>



        <Text style={styles.or}>Nie masz konta?</Text>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('../register/step1-account')}
        >
          <Text style={styles.secondaryButtonText}>Zarejestruj się</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
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
    color: '#222',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    fontSize: 16,
    fontFamily: 'Poppins',
    marginBottom: 16,
    color: '#000',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  primaryButton: {
    backgroundColor: '#333',
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 12,
    marginTop: 10,
  },
  primaryButtonText: {
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
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  googleContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  googleIconWrapper: {
    backgroundColor: '#fff',
    padding: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  googleIcon: {
    width: 32,
    height: 32,
  },
  googleButtonText: {
    color: '#000',
    fontSize: 16,
    fontFamily: 'PoppinsBold',
  },
  
});

import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../src/config/firebase';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import ProgressDots from '../../../src/components/ProgressDots';

export default function Step1Account() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Poppins: require('../../../assets/fonts/Poppins-Regular.ttf'),
    PoppinsBold: require('../../../assets/fonts/Poppins-Bold.ttf'),
  });

  const [nick, setNick] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  if (!fontsLoaded) return null;

  const validateNick = async () => {
    const cleanNick = nick.trim();
    if (cleanNick.length < 3) return false;

    const q = query(collection(db, 'users'), where('nick', '==', cleanNick));
    const snapshot = await getDocs(q);
    return snapshot.empty;
  };

  const isEmailAvailable = async (email) => {
    const cleanedEmail = email.trim().toLowerCase();
    const q = query(collection(db, 'users'), where('email', '==', cleanedEmail));
    const snapshot = await getDocs(q);
    return snapshot.empty;
  };

  const handleNext = async () => {
    const cleanNick = nick.trim();
    const cleanedEmail = email.trim().toLowerCase();

    if (cleanNick.length < 3) {
      return Alert.alert('Błąd', 'Nick musi mieć co najmniej 3 znaki.');
    }

    if (!cleanedEmail.includes('@') || !cleanedEmail.includes('.')) {
      return Alert.alert('Błąd', 'Podaj poprawny adres e-mail.');
    }

    if (password.length < 6) {
      return Alert.alert('Błąd', 'Hasło musi mieć co najmniej 6 znaków.');
    }

    if (password !== confirm) {
      return Alert.alert('Błąd', 'Hasła nie są takie same.');
    }

    setLoading(true);

    try {
      const [nickFree, emailFree] = await Promise.all([
        validateNick(),
        isEmailAvailable(cleanedEmail),
      ]);

      if (!nickFree) {
        setLoading(false);
        return Alert.alert('Błąd', 'Ten nick jest już zajęty.');
      }

      if (!emailFree) {
        setLoading(false);
        return Alert.alert('Błąd', 'Ten adres e-mail jest już używany.');
      }

      router.push({
        pathname: './step2-motivation',
        params: {
          nick: cleanNick,
          email: cleanedEmail,
          password,
        },
      });
    } catch (err) {
      console.error('❌ Błąd sprawdzania danych:', err.message);
      Alert.alert('Błąd', 'Wystąpił problem przy sprawdzaniu danych.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#FDE3A7', '#F8B195', '#F67280']}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.3, y: 1 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.container}>
            <ProgressDots current={1} />

            <Text style={styles.title}>
              🧍‍♂️ Zakładamy <Text style={styles.accent}>konto</Text>
            </Text>

            <InputField
              icon="user"
              placeholder="Nick"
              value={nick}
              onChangeText={setNick}
              delay={100}
            />
            <InputField
              icon="mail"
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              delay={200}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <InputField
              icon="lock"
              placeholder="Hasło"
              value={password}
              onChangeText={setPassword}
              delay={300}
              secureTextEntry
            />
            <InputField
              icon="lock"
              placeholder="Powtórz hasło"
              value={confirm}
              onChangeText={setConfirm}
              delay={400}
              secureTextEntry
            />

            <TouchableOpacity
              onPress={handleNext}
              style={[styles.button, loading && { opacity: 0.6 }]}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Sprawdzanie...' : 'Dalej'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

function InputField({ icon, delay = 0, ...props }) {
  return (
    <Animated.View entering={FadeInUp.duration(400).delay(delay)} style={styles.inputWrapper}>
      <AntDesign name={icon} size={20} color="#333" />
      <TextInput
        style={styles.input}
        placeholderTextColor="rgba(0,0,0,0.4)"
        {...props}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scroll: {
    flexGrow: 1,
    padding: 30,
  },
  container: {
    gap: 22,
    paddingTop: 40,
    paddingBottom: 80,
  },
  title: {
    fontSize: 28,
    fontFamily: 'PoppinsBold',
    color: '#222',
    textAlign: 'center',
  },
  accent: {
    color: '#222',
    fontFamily: 'PoppinsBold',
  },
  inputWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins',
    color: '#111',
  },
  button: {
    backgroundColor: '#17D5FF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'PoppinsBold',
  },
});

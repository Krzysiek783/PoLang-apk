import { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../src/config/firebase';

export default function Step1Account() {
  const router = useRouter();

  const [nick, setNick] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const validateNick = async () => {
    const cleanNick = nick.trim();
    if (cleanNick.length < 3) return false;

    const q = query(collection(db, 'users'), where('nick', '==', cleanNick));
    const snapshot = await getDocs(q);
    console.log("📛 Nick count:", snapshot.size);
    return snapshot.empty;
  };

  const isEmailAvailable = async (email) => {
    const cleanedEmail = email.trim().toLowerCase();
    const q = query(collection(db, 'users'), where('email', '==', cleanedEmail));
    const snapshot = await getDocs(q);
    console.log("📧 Email count:", snapshot.size);
    return snapshot.empty;
  };

  const handleNext = async () => {
    const cleanNick = nick.trim();
    const cleanedEmail = email.trim().toLowerCase();

    if (cleanNick.length < 3) {
      return Alert.alert("Błąd", "Nick musi mieć co najmniej 3 znaki.");
    }

    if (!cleanedEmail.includes('@') || !cleanedEmail.includes('.')) {
      return Alert.alert("Błąd", "Podaj poprawny adres e-mail.");
    }

    if (password.length < 6) {
      return Alert.alert("Błąd", "Hasło musi mieć co najmniej 6 znaków.");
    }

    if (password !== confirm) {
      return Alert.alert("Błąd", "Hasła nie są takie same.");
    }

    setLoading(true);

    try {
      const [nickFree, emailFree] = await Promise.all([
        validateNick(),
        isEmailAvailable(cleanedEmail),
      ]);

      if (!nickFree) {
        setLoading(false);
        return Alert.alert("Błąd", "Ten nick jest już zajęty.");
      }

      if (!emailFree) {
        setLoading(false);
        return Alert.alert("Błąd", "Ten adres e-mail jest już używany.");
      }

      // ✅ przejście do kroku 2
      router.push({
        pathname: './step2-motivation',
        params: {
          nick: cleanNick,
          email: cleanedEmail,
          password,
        },
      });

    } catch (err) {
      console.error("❌ Błąd sprawdzania danych:", err.message);
      Alert.alert("Błąd", "Wystąpił problem przy sprawdzaniu danych.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧍 Załóż konto</Text>

      <TextInput
        placeholder="Nick"
        value={nick}
        onChangeText={setNick}
        autoCapitalize="none"
        style={styles.input}
      />

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />

      <TextInput
        placeholder="Hasło"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <TextInput
        placeholder="Powtórz hasło"
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry
        style={styles.input}
      />

      <Button
        title={loading ? "Sprawdzanie..." : "Dalej"}
        onPress={handleNext}
        disabled={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
    gap: 15,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
});

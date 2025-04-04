import { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth, db } from '../../../src/config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { syncVerificationWithFirestore } from '../../../src/services/syncVerification';


export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  

  const handleLogin = async () => {
    const cleanedEmail = email.trim().toLowerCase();

    if (!cleanedEmail || !password) {
      return Alert.alert('Błąd', 'Wprowadź email i hasło.');
    }

    setLoading(true);

    try {
      // 🔐 Logowanie
      await signInWithEmailAndPassword(auth, cleanedEmail, password);

      // 🔁 Odśwież dane użytkownika
      await auth.currentUser.reload();

      
      
      

      // 🛡️ Sprawdzanie weryfikacji
      if (!auth.currentUser.emailVerified) {
        Alert.alert(
          "🔒 Nie potwierdzono adresu email",
          "Musisz kliknąć w link aktywacyjny wysłany na Twój adres email. Czy chcesz, żebym wysłał go ponownie?",
          [
            {
              text: "Anuluj",
              style: "cancel"
            },
            {
              text: "Wyślij ponownie",
              onPress: async () => {
                try {
                  await sendEmailVerification(auth.currentUser);
                  Alert.alert("✅ Wysłano", "Nowy link został wysłany na Twój adres e-mail.");
                } catch (sendErr) {
                  console.error("❌ Błąd wysyłania:", sendErr.message);

                  if (sendErr.code === 'auth/too-many-requests') {
                    Alert.alert(
                      "Zbyt wiele prób",
                      "Wysłano zbyt wiele wiadomości. Poczekaj kilka minut i spróbuj ponownie."
                    );
                  } else {
                    Alert.alert("Błąd", "Nie udało się wysłać e-maila weryfikacyjnego.");
                  }
                }
              }
            }
          ]
        );

        return; // zatrzymaj logowanie
      }

      await syncVerificationWithFirestore(); // 🔄 aktualizuje verified i verifiedAt

      

      // ⬇️ TUTAJ WKLEJ KOD z onboardingiem:
      const uid = auth.currentUser.uid;
      const userRef = doc(db, 'users', uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const userData = snap.data();

        if (userData.firstLogin) {
          await updateDoc(userRef, { firstLogin: false });
          router.replace('/onboarding'); // 🔄 zmień jeśli chcesz
          return;
        }
      }
      
      
      
      // jeśli nie firstLogin → przejdź dalej
      // ✅ Wszystko OK → przejście dalej
      router.replace('../../home/homeScreen'); // Zmień ścieżkę według potrzeb

    } catch (err) {
      console.error("❌ Błąd logowania:", err.message);
      Alert.alert('Błąd', 'Nieprawidłowy email lub hasło.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔐 Zaloguj się</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />

      <TextInput
        placeholder="Hasło"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <Button
        title={loading ? "Logowanie..." : "Zaloguj się"}
        onPress={handleLogin}
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

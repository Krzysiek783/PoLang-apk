import { useEffect } from 'react';
import { getAuth, signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import { app, db } from './firebase';
import { query, collection, where, getDocs } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { useGoogleAuth } from './googleAuth';

export const useGoogleLogin = () => {
  const router = useRouter();
  const { response, promptAsync } = useGoogleAuth();

  useEffect(() => {
    if (response?.type === 'success') {
      handleGoogleLogin(response);
    }
  }, [response]);

  const handleGoogleLogin = async (response) => {
    try {
      const { id_token } = response.params;
      const auth = getAuth(app);
      const credential = GoogleAuthProvider.credential(id_token);
      const userCredential = await signInWithCredential(auth, credential);

      const uid = userCredential.user.uid;

      const q = query(collection(db, 'users'), where('uid', '==', uid));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        router.replace('../../home/(tabs)');
      } else {
        Alert.alert('Brak konta', 'To konto Google nie jest jeszcze zarejestrowane w PoLang.');
      }
    } catch (err) {
      console.error('❌ Logowanie Google:', err.message);
      Alert.alert('Błąd', 'Nie udało się zalogować przez Google.');
    }
  };

  return { promptAsync };
};

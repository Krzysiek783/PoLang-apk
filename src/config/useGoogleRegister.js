import { useEffect } from 'react';
import { getAuth, signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import { app, db } from './firebase';
import { query, collection, where, getDocs } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { useGoogleAuth } from './googleAuth';

export const useGoogleRegister = () => {
  const router = useRouter();
  const { response, promptAsync } = useGoogleAuth();

  useEffect(() => {
    if (response?.type === 'success') {
      handleGoogleRegister(response);
    }
  }, [response]);

  const handleGoogleRegister = async (response) => {
    try {
      const { id_token } = response.params;
      const auth = getAuth(app);
      const credential = GoogleAuthProvider.credential(id_token);
      const userCredential = await signInWithCredential(auth, credential);

      const user = userCredential.user;
      const email = user.email;
      const nick = user.displayName || email.split('@')[0];

      const nickFree = await isAvailable('nick', nick);
      const emailFree = await isAvailable('email', email);

      if (!nickFree) {
        Alert.alert('❌ Nick zajęty', 'Ten nick jest już używany.');
        return;
      }

      if (!emailFree) {
        Alert.alert('❌ Email zajęty', 'Ten email jest już używany.');
        return;
      }

      router.push({
        pathname: '../register/step2-motivation',
        params: {
          nick,
          email,
          password: 'google_user_placeholder',
        },
      });
    } catch (err) {
      console.error('❌ Rejestracja Google:', err.message);
      Alert.alert('Błąd', 'Nie udało się zarejestrować przez Google.');
    }
  };

  const isAvailable = async (field, value) => {
    const q = query(collection(db, 'users'), where(field, '==', value.trim().toLowerCase()));
    const snapshot = await getDocs(q);
    return snapshot.empty;
  };

  return { promptAsync };
};

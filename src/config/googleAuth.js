import { useEffect, useState } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import { getAuth, signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { app, db } from '../config/firebase';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();


export const useGoogleAuth = () => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: '991664220333-2769rq130h3aue9tgsqolbhu4kmc5r4t.apps.googleusercontent.com',
    webClientId: '991664220333-2769rq130h3aue9tgsqolbhu4kmc5r4t.apps.googleusercontent.com', 
    androidClientId: '991664220333-3en3lvdts1vun762rd4j0tnr4rbt4t70.apps.googleusercontent.com',
  });


  
  useEffect(() => {
    if (response?.type === 'success') {
      handleGoogleLogin();
    }
  }, [response]);

  const handleGoogleLogin = async () => {
    try {
      const { id_token } = response.params;
      const auth = getAuth(app);
      const credential = GoogleAuthProvider.credential(id_token);
      const userCredential = await signInWithCredential(auth, credential);

      const user = userCredential.user;
      const email = user.email;
      const displayName = user.displayName || email.split('@')[0];
      const password = 'google_user_placeholder';

      const nickFree = await validateNick(displayName);
      const emailFree = await isEmailAvailable(email);

      if (!nickFree) {
        alert('Nick jest już zajęty.');
        return;
      }
      if (!emailFree) {
        alert('Email jest już używany.');
        return;
      }

      router.push({
        pathname: 'auth/register/step2-motivation',
        params: {
          nick: displayName,
          email,
          password,
        },
      });

    } catch (error) {
      console.error('Błąd logowania Google:', error.message);
      alert('Wystąpił błąd podczas logowania przez Google.');
    }
  };

  const validateNick = async (nick) => {
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

  return {
    request,
    promptAsync,
  };
};
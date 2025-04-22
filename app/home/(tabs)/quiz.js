import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export default function QuizScreen() {
  const [level, setLevel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLevel = async () => {
      try {
        const auth = getAuth();
        const uid = auth.currentUser.uid;

        const db = getFirestore();
        const userDoc = await getDoc(doc(db, 'users', uid));

        if (userDoc.exists()) {
          const data = userDoc.data();
          setLevel(data.level || 'A1'); // domyślnie A1
        } else {
          console.warn('Brak użytkownika w bazie!');
          setLevel('A1');
        }
      } catch (err) {
        console.error('❌ Błąd pobierania levelu:', err);
        setLevel('A1');
      } finally {
        setLoading(false);
      }
    };

    fetchLevel();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <TouchableOpacity
        onPress={() => router.push({
          pathname: '/Quiz/TestScreen',
          params: { level },
        })}
        style={{
          backgroundColor: '#4CAF50',
          padding: 16,
          borderRadius: 10,
        }}
      >
        <Text style={{ fontSize: 18, color: '#fff' }}>Rozpocznij test ({level})</Text>
      </TouchableOpacity>
    </View>
  );
}

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Pressable, ActivityIndicator, Alert } from 'react-native';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db, auth } from '../../../src/config/firebase';
import { router } from 'expo-router';
import * as Speech from 'expo-speech';
import { API_BASE_URL } from '@env';

const BASE_URL = API_BASE_URL;

export default function FlashcardsScreen() {
  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const currentWord = words[currentIndex];

  useEffect(() => {
    const fetchWords = async () => {
      try {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const userSnap = await getDoc(userRef);
        const userLevel = userSnap.data()?.level || 'A1';

        const res = await fetch(`${BASE_URL}/api/flashcards?level=${userLevel}&limit=10`);
        const data = await res.json();

        setWords(data);
        setLoading(false);
      } catch (err) {
        console.error('❌ Błąd:', err);
        Alert.alert('Błąd', 'Nie udało się pobrać fiszek.');
      }
    };

    fetchWords();
  }, []);

  useEffect(() => {
    if (currentWord) {
      setSelected(null);
      speak(currentWord.word); // 🔊 auto-odsłuch
    }
  }, [currentIndex, currentWord]);

  const handleSelect = async (option) => {
    setSelected(option);
    const isCorrect = option === currentWord.correctAnswer;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setTimeout(() => {
      if (currentIndex + 1 < words.length) {
        setCurrentIndex(prev => prev + 1);
      } else {
        finishLesson();
      }
    }, 1000);
  };

  const speak = async (text) => {
    console.log('🗣️ próba wypowiedzenia:', text);
  
    if (!text || typeof text !== 'string') {
      console.warn('❌ Błąd: text nie jest poprawnym stringiem:', text);
      return;
    }
  
    try {
      await Speech.stop(); // zatrzymaj poprzednie mówienie
      console.time('TTS');
  
      Speech.speak(text, {
        language: 'en-US',
        rate: 0.85,
        onDone: () => {
          console.timeEnd('TTS');
          console.log('✅ zakończone mówienie');
        },
        onError: (e) => {
          console.warn('🛑 Błąd TTS:', e);
          console.timeEnd('TTS');
        },
      });
  
    } catch (err) {
      console.error('❌ Błąd w speak():', err);
    }
  };
  

  const finishLesson = async () => {
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        points: increment(score),
      });

      router.replace({
        pathname: '/lesson/summaryScreen',
        params: {
          score: score,
          total: words.length,
          returnPath: '/lesson/vocabulary/flashcards',
          type: 'flashcards',
        },
      });
      
    } catch (e) {
      console.error('Błąd przy zapisie punktów:', e);
      Alert.alert('Błąd', 'Nie udało się zapisać punktów.');
    }
  };

  if (loading || !currentWord) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 24, justifyContent: 'center' }}>
      <Text style={{ fontSize: 18, marginBottom: 10 }}>
        Pytanie {currentIndex + 1} / {words.length} | Punkty: {score}
      </Text>

      <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' }}>
        {currentWord.word}
      </Text>

      <View style={{ alignItems: 'center', marginBottom: 20 }}>   


{/* 
      <TouchableOpacity onPress={() => speak(currentWord.word)}>
  <Text style={{ fontSize: 22 }}>🔊 Odsłuchaj</Text>
</TouchableOpacity> */}


      <Pressable
  onPress={() => speak(currentWord.word)}
  style={({ pressed }) => ({
    opacity: pressed ? 0.5 : 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    marginBottom: 20,
    alignItems: 'center',
  })}
>
  <Text style={{ fontSize: 22 }}>🔊 Odsłuchaj</Text>
</Pressable>
      </View>

      {currentWord.options.map((option, index) => {
        let backgroundColor = '#f0f0f0';
        if (selected) {
          if (option === currentWord.correctAnswer) backgroundColor = '#b6e2b3'; // zielony
          else if (option === selected) backgroundColor = '#f7a4a4'; // czerwony
        }

        return (
          <TouchableOpacity
            key={index}
            disabled={!!selected}
            onPress={() => handleSelect(option)}
            style={{
              backgroundColor,
              padding: 20,
              borderRadius: 12,
              marginBottom: 15,
              alignItems: 'center',
              borderWidth: selected ? 1 : 0,
              borderColor: '#ccc',
            }}
          >
            <Text style={{ fontSize: 20 }}>{option}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

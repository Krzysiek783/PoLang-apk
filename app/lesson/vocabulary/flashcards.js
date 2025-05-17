import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, Pressable, Animated, ScrollView
} from 'react-native';
import { doc, getDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../../src/config/firebase';
import { router } from 'expo-router';
import * as Speech from 'expo-speech';
import { API_BASE_URL } from '@env';
import dayjs from 'dayjs';


export default function FlashcardsScreen() {
  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const progress = useRef(new Animated.Value(0)).current;

  const BASE_URL = API_BASE_URL;
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
      } catch (err) {
        Alert.alert('Błąd', 'Nie udało się pobrać fiszek.');
      } finally {
        setLoading(false);
      }
    };

    fetchWords();
  }, []);

  useEffect(() => {
    if (currentWord) {
      setSelected(null);
      speak(currentWord.word);
    }
  }, [currentIndex, currentWord]);

  useEffect(() => {
    Animated.timing(progress, {
      toValue: (currentIndex + 1) / words.length,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentIndex]);

  const speak = async (text) => {
    if (!text) return;
    try {
      await Speech.stop();
      Speech.speak(text, { language: 'en-US', rate: 0.85 });
    } catch (err) {
      console.error('TTS Error:', err);
    }
  };

  const handleSelect = (option) => {
    setSelected(option);
    const isCorrect = option === currentWord.correctAnswer;
    if (isCorrect) setScore(prev => prev + 1);

    setTimeout(() => {
      if (currentIndex + 1 < words.length) {
        setCurrentIndex(prev => prev + 1);
      } else {
        finishLesson();
      }
    }, 800);
  };

    const finishLesson = async () => {
      try {
        const uid = auth.currentUser.uid;
        const progressRef = doc(db, 'userProgress', uid);
    
        // Pobierz aktualne dane
        const snap = await getDoc(progressRef);
        let newStreak = 1;
    
        if (snap.exists()) {
          const data = snap.data();
          const lastTimestamp = data?.UpdatedAt?.toDate();
    
          if (lastTimestamp) {
            const hoursDiff = dayjs().diff(dayjs(lastTimestamp), 'hour');
    
            if (hoursDiff < 24) {
              // Użytkownik był aktywny w ciągu ostatnich 24h → streak++
              newStreak = (data.Streaks || 0) + 1;
            } else {
              // Przerwa większa niż 24h → streak reset
              newStreak = 1;
            }
          }
        }
    
        // Zaktualizuj punkty i progres
        await updateDoc(doc(db, 'users', uid), {
          points: increment(score),
        });
    
        await updateDoc(progressRef, {
          'Stats.Listening': increment(1),
          UpdatedAt: serverTimestamp(),
          lastLesson: 'Słuchanie',
          Streaks: newStreak,
        });
    
        // Przekierowanie
      router.replace({
        pathname: '/lesson/summaryScreen',
        params: {
          score,
          total: words.length,
          returnPath: '/lesson/vocabulary/flashcards',
          type: 'flashcards',
        },
      });
    } catch (error) {
      console.error('Błąd aktualizacji:', error);
      Alert.alert('Błąd', 'Nie udało się zapisać punktów.');
    }
  };

  if (loading || !currentWord) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6A5ACD" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.wrapper}>
      <View style={styles.progressWrap}>
        <Animated.View style={[styles.progressBar, {
          width: progress.interpolate({
            inputRange: [0, 1],
            outputRange: ['0%', '100%'],
          }),
        }]} />
      </View>

      <Text style={styles.progressText}>
        Pytanie {currentIndex + 1}/{words.length} • Punkty: {score}
      </Text>

      <View style={styles.wordBox}>
        <Text style={styles.wordText}>{currentWord.word}</Text>

        <Pressable onPress={() => speak(currentWord.word)} style={styles.speakButton}>
          <Text style={{ fontSize: 20 }}>🔊 Odsłuchaj</Text>
        </Pressable>
      </View>

      {currentWord.options.map((option, i) => {
        let bg = '#f0f0f0';
        if (selected) {
          if (option === currentWord.correctAnswer) bg = '#c9f7c5';
          else if (option === selected) bg = '#f9c0c0';
        }

        return (
          <TouchableOpacity
            key={i}
            onPress={() => handleSelect(option)}
            disabled={!!selected}
            style={[styles.option, { backgroundColor: bg }]}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#FFF9F5',
    padding: 24,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF9F5',
  },
  progressWrap: {
    height: 10,
    backgroundColor: '#eee',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#6A5ACD',
  },
  progressText: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 18,
    color: '#333',
  },
  wordBox: {
    backgroundColor: '#FFE7D6',
    padding: 20,
    borderRadius: 18,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  wordText: {
    fontSize: 26,
    fontWeight: '600',
    color: '#2E2E2E',
    marginBottom: 8,
  },
  speakButton: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  option: {
    padding: 18,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 18,
    color: '#333',
  },
});

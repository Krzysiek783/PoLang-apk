import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Dimensions, ActivityIndicator, Alert
} from 'react-native';
import { Audio } from 'expo-av';
import { auth, db } from '../../../src/config/firebase';
import { doc, updateDoc, increment, serverTimestamp, getDoc } from 'firebase/firestore';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { API_BASE_URL } from '@env';
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import dayjs from 'dayjs';

const { width } = Dimensions.get('window');
const BASE_URL = API_BASE_URL;

export default function ListenScreen() {
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const soundRef = useRef(null);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const token = await auth.currentUser.getIdToken();
        const res = await fetch(`${BASE_URL}/api/recordings/random`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setLesson(data);
      } catch (e) {
        Alert.alert('Błąd', 'Nie udało się załadować lekcji.');
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, []);

  const toggleAudio = async () => {
    if (sound) {
      isPlaying ? await sound.pauseAsync() : await sound.playAsync();
      setIsPlaying(!isPlaying);
    } else if (lesson?.audioUrl) {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: lesson.audioUrl },
        {},
        status => {
          if (status.isLoaded) {
            setDuration(status.durationMillis);
            setPosition(status.positionMillis);
          }
        }
      );

      newSound.setOnPlaybackStatusUpdate(status => {
        if (status.isLoaded) {
          setDuration(status.durationMillis);
          setPosition(status.positionMillis);
        }
      });

      soundRef.current = newSound;
      setSound(newSound);
      setIsPlaying(true);
      await newSound.playAsync();
    }
  };

  useEffect(() => {
    return () => {
      if (soundRef.current) soundRef.current.unloadAsync();
    };
  }, []);

  const formatTime = (ms) => {
    const total = Math.floor(ms / 1000);
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleSelect = async (option) => {
    setSelected(option);
    const currentQ = lesson.questions[currentIndex];

    if (option === currentQ.correctAnswer) {
      setScore((prev) => prev + 1);
      await Audio.Sound.createAsync(require('../../../assets/sounds/success.mp3')).then(s => s.sound.playAsync());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      await Audio.Sound.createAsync(require('../../../assets/sounds/fail.mp3')).then(s => s.sound.playAsync());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    setTimeout(() => {
      if (currentIndex + 1 < lesson.questions.length) {
        setCurrentIndex((i) => i + 1);
        setSelected(null);
      } else {
        finishLesson();
      }
    }, 1200);
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
        total: lesson.questions.length,
        returnPath: '/lesson/listening/listenScreen',
        type: 'listening',
      },
    });
  } catch (e) {
    console.error(e);
    Alert.alert('Błąd', 'Nie udało się zapisać punktów.');
  }
};

  if (loading || !lesson) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#F67280" />
        <Text style={{ marginTop: 10 }}>Ładowanie lekcji...</Text>
      </View>
    );
  }

  const currentQ = lesson.questions[currentIndex];

  return (
    <LinearGradient colors={['#FFF9F5', '#FFE7D6']} style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{lesson.title}</Text>

        <TouchableOpacity style={styles.audioButton} onPress={toggleAudio}>
          <Text style={styles.audioText}>
            {isPlaying ? '⏸️ Pauza' : '▶️ Odtwórz nagranie'}
          </Text>
        </TouchableOpacity>

        <View style={styles.progressWrapper}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(position / duration) * 100}%` }]} />
          </View>
          <Text style={styles.time}>
            {formatTime(position)} / {formatTime(duration)}
          </Text>
        </View>

        <View style={styles.buttonRow}>
          <Animated.View entering={ZoomIn}>
            <TouchableOpacity style={styles.toggleBtn} onPress={() => setShowTranscript(p => !p)}>
              <Text style={styles.toggleText}>
                📜 {showTranscript ? 'Ukryj transkrypcję' : 'Pokaż transkrypcję'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
          <Animated.View entering={ZoomIn.delay(100)}>
            <TouchableOpacity style={styles.toggleBtn} onPress={() => setShowTranslation(p => !p)}>
              <Text style={styles.toggleText}>
                🌍 {showTranslation ? 'Ukryj tłumaczenie' : 'Pokaż tłumaczenie'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {showTranscript && (
          <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.box}>
            {lesson.transcript.map((line, i) => (
              <Text key={i} style={styles.textLine}>{line}</Text>
            ))}
          </Animated.View>
        )}

        {showTranslation && (
          <Animated.View entering={FadeIn.delay(100)} exiting={FadeOut} style={styles.box}>
            {lesson.translation.map((line, i) => (
              <Text key={i} style={styles.translationLine}>{line}</Text>
            ))}
          </Animated.View>
        )}

        <Text style={styles.question}>❓ {currentQ.question}</Text>
        {currentQ.options.map((opt, i) => {
          let bg = '#f0f0f0';
          if (selected) {
            if (opt === currentQ.correctAnswer) bg = '#B9FBC0';
            else if (opt === selected) bg = '#FBC4AB';
          }

          return (
            <TouchableOpacity
              key={i}
              onPress={() => handleSelect(opt)}
              disabled={!!selected}
              style={[styles.answerBtn, { backgroundColor: bg }]}
            >
              <Text style={styles.answerText}>{opt}</Text>
            </TouchableOpacity>
          );
        })}

        <Text style={styles.progressInfo}>
          📈 Pytanie {currentIndex + 1}/{lesson.questions.length} | 🎯 Wynik: {score}
        </Text>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  container: { padding: 24, paddingBottom: 60 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF9F5',
  },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#2E2E2E' },
  audioButton: {
    backgroundColor: '#D6D6FF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  audioText: { fontSize: 18, color: '#2E2E2E', fontWeight: '600' },
  progressWrapper: { marginBottom: 20 },
  progressBar: { height: 6, backgroundColor: '#ddd', borderRadius: 3 },
  progressFill: { height: 6, backgroundColor: '#6A5ACD', borderRadius: 3 },
  time: { fontSize: 12, marginTop: 4, textAlign: 'right', color: '#555' },
  buttonRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  toggleBtn: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  toggleText: { fontSize: 14, fontWeight: '500', color: '#444' },
  box: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  textLine: { fontSize: 16, marginBottom: 6 },
  translationLine: { fontSize: 16, marginBottom: 6, color: '#666' },
  question: { fontSize: 18, marginBottom: 14, color: '#222' },
  answerBtn: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  answerText: { fontSize: 16, color: '#2E2E2E' },
  progressInfo: {
    marginTop: 20,
    textAlign: 'center',
    color: '#333',
    fontWeight: '500',
    fontSize: 14,
  },
});

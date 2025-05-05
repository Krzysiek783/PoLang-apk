import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ActivityIndicator, Alert, Dimensions, StyleSheet
} from 'react-native';
import { API_BASE_URL } from '@env';
import { router } from 'expo-router';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db, auth } from '../../src/config/firebase';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function TestScreen() {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [optionKey, setOptionKey] = useState(0);
  const soundRef = useRef(null);

  const correctSoundRef = useRef(null);
  const wrongSoundRef = useRef(null);

  const currentQ = questions[currentIndex];

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const token = await auth.currentUser.getIdToken();
        const res = await fetch(`${API_BASE_URL}/api/test/start`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setQuestions(data.questions);
        setTimeLeft(data.duration);
      } catch (e) {
        Alert.alert('Błąd', 'Nie udało się pobrać testu');
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, []);

  useEffect(() => {
    if (questions.length === 0 || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          finishTest(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [questions.length, timeLeft]);

  useEffect(() => {
    const loadFeedbackSounds = async () => {
      try {
        const { sound: correctSound } = await Audio.Sound.createAsync(
          require('../../assets/sounds/success.mp3')
        );
        correctSoundRef.current = correctSound;

        const { sound: wrongSound } = await Audio.Sound.createAsync(
          require('../../assets/sounds/fail.mp3')
        );
        wrongSoundRef.current = wrongSound;
      } catch (e) {
        console.warn('⚠️ Failed to load feedback sounds', e);
      }
    };

    loadFeedbackSounds();

    return () => {
      correctSoundRef.current?.unloadAsync();
      wrongSoundRef.current?.unloadAsync();
      stopAudio();
    };
  }, []);

  const handleSelect = (option) => {
    setSelected(option);
    const isCorrect = option === currentQ.correctAnswer;
    playFeedbackSound(isCorrect);

    if (isCorrect) setScore((s) => s + 1);

    setTimeout(() => {
      if (currentIndex + 1 < questions.length) {
        stopAudio();
        setCurrentIndex((i) => i + 1);
        setSelected(null);
        setOptionKey(prev => prev + 1);
      } else {
        finishTest(false);
      }
    }, 1000);
  };

  const playFeedbackSound = async (isCorrect) => {
    try {
      const sound = isCorrect ? correctSoundRef.current : wrongSoundRef.current;
      if (sound) {
        await sound.replayAsync();
      }
    } catch (e) {
      console.warn('⚠️ Failed to play feedback sound', e);
    }
  };

  const finishTest = async (isTimeout) => {
    const finalScore = isTimeout ? 0 : score * 2;
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        points: increment(finalScore),
      });

      router.replace({
        pathname: '/Quiz/ResultScreen',
        params: {
          score: finalScore,
          total: questions.length,
          timeLeft,
          returnPath: '/Quiz/TestScreen',
          type: 'test',
        },
      });
    } catch (e) {
      Alert.alert('Błąd', 'Nie udało się zapisać punktów.');
    }
  };

  const formatTime = (sec) => {
    const min = Math.floor(sec / 60);
    const s = sec % 60;
    return `${min}:${s < 10 ? '0' : ''}${s}`;
  };

  const toggleAudio = async () => {
    if (isLoadingAudio) return;
    setIsLoadingAudio(true);

    try {
      if (soundRef.current) {
        const status = await soundRef.current.getStatusAsync();
        if (status.isPlaying) {
          await soundRef.current.pauseAsync();
          setIsPlaying(false);
          return;
        } else {
          await soundRef.current.playAsync();
          setIsPlaying(true);
          return;
        }
      }

      if (currentQ.audioUrl) {
        const { sound } = await Audio.Sound.createAsync(
          { uri: currentQ.audioUrl },
          { shouldPlay: true }
        );
        soundRef.current = sound;
        setIsPlaying(true);

        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            setPosition(status.positionMillis);
            setDuration(status.durationMillis);
            if (status.didJustFinish) setIsPlaying(false);
          }
        });
      }
    } catch (err) {
      console.error('Audio error:', err);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const stopAudio = async () => {
    if (soundRef.current) {
      try {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded) {
          await soundRef.current.stopAsync();
          await soundRef.current.unloadAsync();
        }
      } catch (e) {
        console.warn('⚠️ Audio stop error:', e);
      } finally {
        soundRef.current = null;
        setIsPlaying(false);
        setPosition(0);
        setDuration(1);
      }
    }
  };

  if (loading || !currentQ) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6A5ACD" />
      </View>
    );
  }

  return (
    <LinearGradient colors={['#FFF9F5', '#FFE7D6']} style={styles.wrapper}>
      <Animated.View entering={FadeInUp} style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.timer}>⏳ {formatTime(timeLeft)}</Text>
          <Text style={styles.progress}>{currentIndex + 1}/{questions.length}</Text>
        </View>

        <View style={styles.progressBarWrapper}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${((currentIndex + 1) / questions.length) * 100}%` }]} />
          </View>
        </View>

        {/* Question Type */}
        <Animated.View entering={ZoomIn}>
          <Text style={styles.type}>
            {currentQ.type === 'flashcard' && '🧠 Fiszka – przetłumacz słowo'}
            {currentQ.type === 'listening' && '🎧 Słuchanie – odpowiedz na pytanie'}
            {currentQ.type === 'grammar' && '📘 Gramatyka – uzupełnij zdanie'}
          </Text>
        </Animated.View>

        {/* Content */}
        {currentQ.word && <Text style={styles.word}>{currentQ.word}</Text>}
        {currentQ.sentence && <Text style={styles.sentence}>{currentQ.sentence}</Text>}
        {currentQ.question && <Text style={styles.question}>❓ {currentQ.question}</Text>}

        {/* AUDIO */}
        {currentQ.audioUrl && (
          <TouchableOpacity onPress={toggleAudio} style={styles.audioBtn}>
            <Text style={styles.audioText}>
              {isPlaying ? '⏸️ Pauza' : '▶️ Odtwórz nagranie'}
            </Text>
            <View style={styles.audioProgress}>
              <View style={[styles.audioProgressBar, { width: `${(position / duration) * 100}%` }]} />
            </View>
          </TouchableOpacity>
        )}

        {/* OPTIONS */}
        <View key={optionKey}>
          {currentQ.options.map((option, index) => {
            let bg = '#f4f4f4';
            if (selected) {
              if (option === currentQ.correctAnswer) bg = '#C8FACC';
              else if (option === selected) bg = '#F9C0C0';
            }

            return (
              <Animated.View entering={FadeInUp.delay(index * 100)} key={index}>
                <TouchableOpacity
                  disabled={!!selected}
                  onPress={() => handleSelect(option)}
                  style={[styles.option, { backgroundColor: bg }]}
                >
                  <Text style={styles.optionText}>{option}</Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  container: { padding: 24, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF9F5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  timer: { fontSize: 16, fontWeight: 'bold', color: '#444' },
  progress: { fontSize: 16, color: '#666' },
  progressBarWrapper: { marginBottom: 20 },
  progressBar: { height: 6, backgroundColor: '#ddd', borderRadius: 3 },
  progressFill: { height: 6, backgroundColor: '#6A5ACD', borderRadius: 3 },
  type: {
    fontSize: 16,
    fontWeight: '600',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
    color: '#2E2E2E',
    textAlign: 'center',
  },
  word: { fontSize: 28, textAlign: 'center', marginBottom: 10, color: '#2E2E2E', fontWeight: '600' },
  sentence: { fontSize: 22, textAlign: 'center', marginBottom: 10, color: '#333' },
  question: { fontSize: 18, textAlign: 'center', marginBottom: 20, color: '#222' },
  audioBtn: {
    backgroundColor: '#eee',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  audioText: { fontSize: 18, color: '#444', fontWeight: '600', marginBottom: 8 },
  audioProgress: { height: 5, width: '100%', backgroundColor: '#ccc', borderRadius: 3 },
  audioProgressBar: { height: 5, backgroundColor: '#6A5ACD', borderRadius: 3 },
  option: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  optionText: { fontSize: 17, color: '#333', fontWeight: '500' },
});

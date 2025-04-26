import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Alert, StyleSheet, Animated
} from 'react-native';
import axios from 'axios';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { auth, db } from '../../../src/config/firebase';
import { Audio } from 'expo-av';
import { router } from 'expo-router';
import { API_BASE_URL } from '@env';

export default function FillBlankScreen() {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(0);
  const progress = useRef(new Animated.Value(0)).current;

  const BASE_URL = API_BASE_URL;

  useEffect(() => { fetchQuestions(); }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/grammar/fill/A1?count=10`);
      setQuestions(res.data);
      setCurrent(0);
      setSelected('');
      setFeedback(null);
      setScore(0);
    } catch (err) {
      Alert.alert('❌ Błąd', 'Nie udało się pobrać zadań.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Animated.timing(progress, {
      toValue: (current + 1) / questions.length,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [current]);

  const playSound = async (type) => {
    const sound = new Audio.Sound();
    try {
      await sound.loadAsync(
        type === 'success'
          ? require('../../../assets/sounds/success.mp3')
          : require('../../../assets/sounds/fail.mp3')
      );
      await sound.playAsync();
    } catch (e) {
      console.log('Sound error:', e);
    }
  };

  const checkAnswer = () => {
    const correct = questions[current].correctAnswer;
    if (selected === correct) {
      setScore((prev) => prev + 1);
      setFeedback('✅ Dobrze!');
      playSound('success');
    } else {
      setFeedback(`❌ Błąd! Poprawna: ${correct}`);
      playSound('fail');
    }
  };

  const next = () => {
    if (current + 1 < questions.length) {
      setCurrent((prev) => prev + 1);
      setSelected('');
      setFeedback(null);
    } else {
      finishLesson();
    }
  };

  const finishLesson = async () => {
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, { points: increment(score) });

      router.replace({
        pathname: '/lesson/summaryScreen',
        params: {
          score,
          total: questions.length,
          returnPath: '/lesson/grammar/fillScreen',
          type: 'fill-blank',
        },
      });
    } catch (e) {
      Alert.alert('❌ Błąd', 'Nie udało się zapisać punktów.');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6A5ACD" />
        <Text style={{ marginTop: 10, color: '#777' }}>Ładowanie zadań...</Text>
      </View>
    );
  }

  if (!questions.length) {
    return (
      <View style={styles.center}>
        <Text style={{ color: '#cc0000', textAlign: 'center' }}>
          Brak zadań. Spróbuj ponownie później.
        </Text>
      </View>
    );
  }

  const task = questions[current];

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
        Pytanie {current + 1}/{questions.length} • Punkty: {score}
      </Text>

      <View style={styles.questionBox}>
        <Text style={styles.questionText}>
          {task.sentence.replace('___', '______')}
        </Text>
      </View>

      {task.options.map((option, i) => {
        let bg = '#f4f4f4';
        if (feedback) {
          if (option === task.correctAnswer) bg = '#c9f7c5';
          else if (option === selected) bg = '#f9c0c0';
        } else if (option === selected) bg = '#dbeafe';

        return (
          <TouchableOpacity
            key={i}
            onPress={() => setSelected(option)}
            disabled={!!feedback}
            style={[styles.option, { backgroundColor: bg }]}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        );
      })}

      {feedback && <Text style={styles.feedback}>{feedback}</Text>}

      <TouchableOpacity
        onPress={feedback ? next : checkAnswer}
        disabled={!selected && !feedback}
        style={[
          styles.button,
          { backgroundColor: feedback || selected ? '#6A5ACD' : '#ccc' },
        ]}
      >
        <Text style={styles.buttonText}>
          {feedback
            ? current + 1 < questions.length
              ? '➡️ Następne'
              : '🏁 Zakończ lekcję'
            : 'Sprawdź odpowiedź'}
        </Text>
      </TouchableOpacity>
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
    width: '100%',
    backgroundColor: '#eee',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#6A5ACD',
  },
  progressText: {
    fontSize: 16,
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  questionBox: {
    backgroundColor: '#FFE7D6',
    padding: 20,
    borderRadius: 16,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  questionText: {
    fontSize: 20,
    textAlign: 'center',
    color: '#333',
  },
  option: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  optionText: {
    fontSize: 16,
    textAlign: 'center',
  },
  feedback: {
    marginTop: 15,
    textAlign: 'center',
    fontSize: 16,
    color: '#444',
  },
  button: {
    marginTop: 30,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 17,
  },
});

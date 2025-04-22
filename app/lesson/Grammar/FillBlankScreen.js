import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  Animated,
} from 'react-native';
import axios from 'axios';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { auth, db } from '../../../src/config/firebase';
import { router } from 'expo-router';

import { API_BASE_URL } from '@env';
const BASE_URL = API_BASE_URL;

export default function FillBlankScreen() {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(0);
  const progress = useRef(new Animated.Value(0)).current;

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
      console.error(err);
      Alert.alert('❌ Błąd', 'Nie udało się pobrać zadań.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    Animated.timing(progress, {
      toValue: (current + 1) / questions.length,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [current]);

  const checkAnswer = () => {
    const correct = questions[current].correctAnswer;
    if (selected === correct) {
      setScore((prev) => prev + 1);
      setFeedback('✅ Dobrze!');
    } else {
      setFeedback(`❌ Błąd! Poprawna odpowiedź: ${correct}`);
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
      await updateDoc(userRef, {
        points: increment(score),
      });

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
      console.error('Błąd przy zapisie punktów:', e);
      Alert.alert('❌ Błąd', 'Nie udało się zapisać punktów.');
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10, fontSize: 16, color: '#666' }}>Ładowanie zadań...</Text>
      </View>
    );
  }

  if (!questions.length) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Text style={{ fontSize: 16, color: 'red', textAlign: 'center' }}>
          Brak zadań. Spróbuj ponownie później.
        </Text>
      </View>
    );
  }

  const task = questions[current];

  return (
    <ScrollView style={{ flex: 1, padding: 24, backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 18, marginBottom: 10 }}>
        Pytanie {current + 1} / {questions.length} | Punkty: {score}
      </Text>

      <View
        style={{
          backgroundColor: '#eaf4ff',
          borderRadius: 16,
          padding: 20,
          marginBottom: 30,
          borderWidth: 1,
          borderColor: '#d0e5ff',
          shadowColor: '#000',
          shadowOpacity: 0.04,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 2 },
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: '500', textAlign: 'center', color: '#333' }}>
          {task.sentence.replace('___', '______')}
        </Text>
      </View>

      {task.options.map((option, index) => {
        let backgroundColor = '#f4f4f4';
        let textColor = '#000';

        if (feedback) {
          if (option === task.correctAnswer) {
            backgroundColor = '#c9f7c5'; // zielony
          } else if (option === selected) {
            backgroundColor = '#f9c0c0'; // czerwony
          }
        } else if (selected === option) {
          backgroundColor = '#bcdffb';
        }

        return (
          <TouchableOpacity
            key={index}
            onPress={() => setSelected(option)}
            disabled={!!feedback}
            style={{
              backgroundColor,
              padding: 18,
              borderRadius: 12,
              marginBottom: 15,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#ccc',
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: '500', color: textColor }}>{option}</Text>
          </TouchableOpacity>
        );
      })}

      {feedback && (
        <Text style={{ textAlign: 'center', fontSize: 16, marginTop: 16, color: '#444' }}>
          {feedback}
        </Text>
      )}

      <TouchableOpacity
        onPress={feedback ? next : checkAnswer}
        disabled={!selected && !feedback}
        style={{
          backgroundColor: feedback || selected ? '#2563eb' : '#ccc',
          marginTop: 30,
          padding: 16,
          borderRadius: 12,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#fff', fontSize: 18 }}>
          {feedback ? (current + 1 < questions.length ? '➡️ Następne' : '🏁 Zakończ lekcję') : 'Sprawdź odpowiedź'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, Animated } from 'react-native';
import { API_BASE_URL } from '@env';
import { router } from 'expo-router';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db, auth } from '../../src/config/firebase';
import { Audio } from 'expo-av';

const BASE_URL = API_BASE_URL;

export default function TestScreen() {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [feedbackColor, setFeedbackColor] = useState(new Animated.Value(0));
  const [sound, setSound] = useState(null);

  const currentQ = questions[currentIndex];

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const token = await auth.currentUser.getIdToken();
        const res = await fetch(`${BASE_URL}/api/test/start`, {
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


  const formatTime = (t) => {
    const min = Math.floor(t / 60);
    const sec = t % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const handleSelect = (option) => {
    setSelected(option);

    const isCorrect = option === currentQ.correctAnswer;
    if (isCorrect) {
      setScore((s) => s + 1);
      animateFeedback('#b6e2b3');
    } else {
      animateFeedback('#f7a4a4');
    }

    setTimeout(() => {
      setFeedbackColor(new Animated.Value(0));
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex((i) => i + 1);
        setSelected(null);
      } else {
        finishTest(false);
      }
    }, 800);
  };

  const animateFeedback = (color) => {
    Animated.timing(feedbackColor, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      feedbackColor.setValue(0);
    });
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

  const playAudio = async (url) => {
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }
      const { sound: newSound } = await Audio.Sound.createAsync({ uri: url });
      setSound(newSound);
      await newSound.playAsync();
    } catch (e) {
      console.error('Błąd audio:', e);
    }
  };

  if (loading || !currentQ) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const questionTypeLabel = {
    flashcard: '🧠 Fiszka – przetłumacz słowo',
    listening: '🎧 Słuchanie – odpowiedz na pytanie',
    grammar: '📘 Gramatyka – uzupełnij zdanie',
  };

  return (
    <Animated.View style={{ flex: 1, padding: 24, backgroundColor: feedbackColor.interpolate({
      inputRange: [0, 1],
      outputRange: ['#fff', selected === currentQ?.correctAnswer ? '#b6e2b3' : '#f7a4a4']
    }) }}>
      {/* Główny nagłówek i pasek czasu */}
      <View style={{ marginBottom: 24 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
          <Text style={{ fontSize: 16 }}>⏳ Czas: {formatTime(timeLeft)}</Text>
          <Text style={{ fontSize: 16 }}>
            {currentIndex + 1} / {questions.length}
          </Text>
        </View>
        <View style={{ height: 6, backgroundColor: '#ddd', borderRadius: 4 }}>
          <View
            style={{
              height: 6,
              width: `${((currentIndex + 1) / questions.length) * 100}%`,
              backgroundColor: '#4CAF50',
              borderRadius: 4,
            }}
          />
        </View>
      </View>

      <Text style={{
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
        padding: 6,
        backgroundColor: '#eee',
        borderRadius: 8,
        alignSelf: 'flex-start'
      }}>
        {questionTypeLabel[currentQ.type]}
      </Text>

      {currentQ.word && <Text style={{ fontSize: 28, textAlign: 'center', marginBottom: 30 }}>{currentQ.word}</Text>}
      {currentQ.sentence && <Text style={{ fontSize: 22, textAlign: 'center', marginBottom: 30 }}>{currentQ.sentence}</Text>}
      {currentQ.question && <Text style={{ fontSize: 20, marginBottom: 20 }}>{currentQ.question}</Text>}

      {currentQ.audioUrl && (
        <TouchableOpacity onPress={() => playAudio(currentQ.audioUrl)}>
          <Text style={{ fontSize: 20, marginBottom: 20 }}>🔊 Odtwórz nagranie</Text>
        </TouchableOpacity>
      )}

      {currentQ.options.map((option, index) => {
        let bg = '#f0f0f0';
        <Text style={{ fontSize: 16, color: 'red', marginTop: 20 }}>
    Brak odpowiedzi – coś poszło nie tak 😓
  </Text>
        if (selected) {
          if (option === currentQ.correctAnswer) bg = '#b6e2b3';
          else if (option === selected) bg = '#f7a4a4';
        }

        return (
          <TouchableOpacity
            key={index}
            disabled={!!selected}
            onPress={() => handleSelect(option)}
            style={{
              backgroundColor: bg,
              padding: 16,
              borderRadius: 8,
              marginBottom: 10,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 18 }}>{option}</Text>
          </TouchableOpacity>
        );
      })}
    </Animated.View>
  );
}

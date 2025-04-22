import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { Audio } from 'expo-av';
import { auth, db } from '../../../src/config/firebase';
import { router } from 'expo-router';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { API_BASE_URL } from '@env';

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

  const toggleTranscript = () => setShowTranscript(prev => !prev);
  const toggleTranslation = () => setShowTranslation(prev => !prev);

  useEffect(() => {
    console.log('▶️ Pokaż transkrypcję:', showTranscript);
    console.log('🌍 Pokaż tłumaczenie:', showTranslation);
  }, [showTranscript, showTranslation]);

  const currentQ = lesson?.questions?.[currentIndex];

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
        console.error('❌ Błąd pobierania lekcji:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, []);

  const toggleAudio = async () => {
    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }
    } else if (lesson?.audioUrl) {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: lesson.audioUrl },
        {},
        (status) => {
          if (status.isLoaded) {
            setDuration(status.durationMillis);
            setPosition(status.positionMillis);
          }
        }
      );

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setPosition(status.positionMillis);
          setDuration(status.durationMillis);
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
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
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
          total: lesson.questions.length,
          returnPath: '/lesson/listening/listenScreen',
          type: 'listening',
        },
      });
    } catch (e) {
      console.error('Błąd przy zapisie punktów:', e);
      Alert.alert('Błąd', 'Nie udało się zapisać punktów.');
    }
  };

  const handleSelect = (option) => {
    setSelected(option);
    if (option === currentQ.correctAnswer) setScore((s) => s + 1);
    setTimeout(() => {
      if (currentIndex + 1 < lesson.questions.length) {
        setCurrentIndex((i) => i + 1);
        setSelected(null);
      } else {
        finishLesson();
      }
    }, 1000);
  };

  if (loading || !lesson) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>{lesson.title}</Text>

      <TouchableOpacity
        onPress={toggleAudio}
        style={{ backgroundColor: '#ccc', padding: 14, borderRadius: 12, marginBottom: 10 }}>
        <Text style={{ fontSize: 18 }}>{isPlaying ? '⏸️ Pauza' : '▶️ Odtwórz nagranie'}</Text>
      </TouchableOpacity>

      {duration > 0 && (
        <View style={{ marginBottom: 20 }}>
          <View style={{ height: 4, backgroundColor: '#ddd', borderRadius: 2 }}>
            <View
              style={{
                height: 4,
                width: `${(position / duration) * 100}%`,
                backgroundColor: '#007AFF',
              }}
            />
          </View>
          <Text style={{ fontSize: 12, textAlign: 'right', marginTop: 4 }}>
            {formatTime(position)} / {formatTime(duration)}
          </Text>
        </View>
      )}

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
  <TouchableOpacity
    onPress={() => {
      console.log("Kliknięto transkrypcję");
      toggleTranscript();
    }}
    style={{
      backgroundColor: '#eee',
      padding: 10,
      borderRadius: 8,
      flex: 1,
      marginRight: 5,
      alignItems: 'center',
    }}
  >
    <Text style={{ color: '#007AFF', fontSize: 16 }}>
      📜 {showTranscript ? 'Ukryj transkrypcję' : 'Pokaż transkrypcję'}
    </Text>
  </TouchableOpacity>

  <TouchableOpacity
    onPress={() => {
      console.log("Kliknięto tłumaczenie");
      toggleTranslation();
    }}
    style={{
      backgroundColor: '#eee',
      padding: 10,
      borderRadius: 8,
      flex: 1,
      marginLeft: 5,
      alignItems: 'center',
    }}
  >
    <Text style={{ color: '#007AFF', fontSize: 16 }}>
      🌐 {showTranslation ? 'Ukryj tłumaczenie' : 'Pokaż tłumaczenie'}
    </Text>
  </TouchableOpacity>
</View>


      {showTranscript && lesson.transcript && (
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>📜 Transkrypcja</Text>
          {lesson.transcript.map((line, index) => (
            <Text key={index} style={{ fontSize: 16, marginBottom: 4 }}>{line}</Text>
          ))}
        </View>
      )}

      {showTranslation && lesson.translation && (
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>🌐 Tłumaczenie</Text>
          {lesson.translation.map((line, index) => (
            <Text key={index} style={{ fontSize: 16, color: '#666', marginBottom: 4 }}>{line}</Text>
          ))}
        </View>
      )}

      <Text style={{ fontSize: 16, marginBottom: 10 }}>❓ {currentQ.question}</Text>
      {currentQ.options.map((option, i) => {
        let bg = '#f0f0f0';
        if (selected) {
          if (option === currentQ.correctAnswer) bg = '#b6e2b3';
          else if (option === selected) bg = '#f7a4a4';
        }
        return (
          <TouchableOpacity
            key={i}
            disabled={!!selected}
            onPress={() => handleSelect(option)}
            style={{ backgroundColor: bg, padding: 14, borderRadius: 8, marginBottom: 10 }}>
            <Text>{option}</Text>
          </TouchableOpacity>
        );
      })}

      <Text style={{ marginTop: 20 }}>Pytanie {currentIndex + 1} / {lesson.questions.length} | 🎯 Wynik: {score}</Text>
    </ScrollView>
  );
}

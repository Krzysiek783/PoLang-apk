import { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Dimensions, StyleSheet, Modal
} from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const lessonData = [
  {
    icon: '🧠',
    title: 'Fiszki',
    desc: 'Naucz się słówek z kategorii dopasowanych do Twojego poziomu.',
    longDesc: 'Fiszki pomagają w szybkim zapamiętywaniu nowych słów poprzez wizualne i interaktywne powtarzanie. Idealne dla wzrokowców!',
    onPress: () => router.push('../../lesson/vocabulary/flashcards'),
  },
  {
    icon: '🎧',
    title: 'Słuchanie',
    desc: 'Ćwicz rozumienie ze słuchu przez realistyczne dialogi.',
    longDesc: 'Ćwiczenia ze słuchu pomagają oswoić się z akcentami, rytmem i naturalną mową. Doskonałe dla nauki praktycznej.',
    onPress: () => router.push('../../lesson/listening/listenScreen'),
  },
  {
    icon: '📘',
    title: 'Gramatyka',
    desc: 'Poznaj i utrwal zasady gramatyczne przez praktyczne ćwiczenia.',
    longDesc: 'Gramatyka z przykładami i ćwiczeniami pozwala opanować konstrukcje językowe bez nudy!',
    onPress: () => router.push('../../lesson/Grammar/FillBlankScreen'),
  },
];

export default function LessonScreen() {
  const [selectedLesson, setSelectedLesson] = useState(null);

  return (
    <View style={styles.wrapper}>
      <View style={styles.backgroundShape} />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>📚 Wybierz rodzaj lekcji</Text>

        <View style={styles.grid}>
          {lessonData.map((lesson, idx) => (
            <Animated.View entering={FadeInUp.delay(idx * 100)} key={idx}>
              <TouchableOpacity style={styles.tile} onPress={lesson.onPress}>
                <Text style={styles.icon}>{lesson.icon}</Text>
                <Text style={styles.tileTitle}>{lesson.title}</Text>
                <Text style={styles.tileDesc}>{lesson.desc}</Text>

                <TouchableOpacity
                  style={styles.infoBtn}
                  onPress={() => setSelectedLesson(lesson)}
                >
                  <Text style={styles.infoIcon}>ℹ️</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </ScrollView>

      {/* MODAL */}
      <Modal
        visible={!!selectedLesson}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedLesson(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{selectedLesson?.icon} {selectedLesson?.title}</Text>
            <Text style={styles.modalText}>{selectedLesson?.longDesc}</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedLesson(null)}>
              <Text style={styles.closeText}>Zamknij</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#FFEFE8' },
  backgroundShape: {
    position: 'absolute',
    width,
    height: 280,
    backgroundColor: '#FFD5A5',
    transform: [{ skewY: '-10deg' }],
    borderBottomRightRadius: 60,
  },
  container: { padding: 24, paddingBottom: 40 },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#2E2E2E',
  },
  grid: { flexDirection: 'column', gap: 20 },
  tile: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    position: 'relative',
  },
  icon: {
    fontSize: 32,
    marginBottom: 14,
    textAlign: 'center',
  },
  tileTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
    textAlign: 'center',
  },
  tileDesc: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    lineHeight: 22,
  },
  infoBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  infoIcon: {
    fontSize: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    padding: 26,
    borderRadius: 16,
    width: '85%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  closeBtn: {
    backgroundColor: '#F67280',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 12,
  },
  closeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

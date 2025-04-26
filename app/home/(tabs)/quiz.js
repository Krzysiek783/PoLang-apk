import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Modal,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function QuizScreen() {
  const [level, setLevel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    const fetchLevel = async () => {
      try {
        const auth = getAuth();
        const uid = auth.currentUser.uid;
        const db = getFirestore();
        const userDoc = await getDoc(doc(db, 'users', uid));
        const data = userDoc.exists() ? userDoc.data() : {};
        setLevel(data.level || 'A1');
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
    return (
      <View style={[styles.center, { backgroundColor: '#FFEFE8' }]}>
        <ActivityIndicator size="large" color="#F67280" />
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.backgroundShape} />

      {/* Modal z zasadami */}
      <Modal visible={showInfo} animationType="fade" transparent onRequestClose={() => setShowInfo(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>ℹ️ Zasady quizu</Text>
            <Text style={styles.modalText}>
              • Odpowiedz na 10 pytań dopasowanych do Twojego poziomu ({level}).{'\n\n'}
              • Każde pytanie ma jedną poprawną odpowiedź.{'\n\n'}
              • Po zakończeniu zobaczysz swój wynik oraz sugestie, co warto powtórzyć.
            </Text>
            <Pressable onPress={() => setShowInfo(false)} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>Zamknij</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <View style={styles.container}>
        <Animated.Text entering={FadeInUp} style={styles.emoji}>🧪</Animated.Text>

        <View style={styles.titleRow}>
          <Animated.Text entering={FadeInUp.delay(100)} style={styles.title}>Quiz językowy</Animated.Text>
          <TouchableOpacity onPress={() => setShowInfo(true)}>
            <Text style={styles.infoIcon}>ℹ️</Text>
          </TouchableOpacity>
        </View>

        <Animated.Text entering={FadeInUp.delay(200)} style={styles.description}>
          Sprawdź swoje umiejętności i dowiedz się, nad czym warto popracować.
        </Animated.Text>

        <Animated.View entering={ZoomIn.delay(300)}>
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/Quiz/TestScreen', params: { level } })}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Rozpocznij test</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#FFEFE8' },
  backgroundShape: {
    position: 'absolute',
    width,
    height: 300,
    backgroundColor: '#FFD5A5',
    transform: [{ skewY: '-10deg' }],
    borderBottomRightRadius: 60,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2E2E2E',
  },
  infoIcon: {
    fontSize: 22,
    color: '#6A5ACD',
  },
  description: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 30,
    maxWidth: 280,
  },
  button: {
    backgroundColor: '#6A5ACD',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 14,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 350,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  modalText: {
    fontSize: 14,
    color: '#444',
    marginBottom: 16,
    lineHeight: 20,
  },
  modalButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#6A5ACD',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

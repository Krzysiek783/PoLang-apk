import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect } from 'react';
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function SummaryScreen() {
  const { score, total, returnPath, type } = useLocalSearchParams();
  const percentage = Math.round((score / total) * 100);

  const getEmoji = () => {
    if (score === 0) return '😅';
    if (percentage >= 80) return '🏆';
    if (percentage >= 50) return '🎉';
    return '👍';
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.backgroundShape} />

      <Animated.View entering={ZoomIn} style={styles.container}>
        <Text style={styles.emoji}>{getEmoji()} Gratulacje!</Text>

        <Animated.Text entering={FadeInUp} style={styles.points}>
          Zdobyłeś {score} / {total} punktów
        </Animated.Text>

        <Text style={styles.percentage}>Skuteczność: {percentage}%</Text>

        <TouchableOpacity
          onPress={() => router.replace('/home/(tabs)/lesson')}
          style={styles.primaryBtn}
        >
          <Text style={styles.btnText}>🏠 Powrót do lekcji</Text>
        </TouchableOpacity>

        {returnPath && (
          <TouchableOpacity
            onPress={() => router.replace(returnPath)}
            style={styles.secondaryBtn}
          >
            <Text style={styles.btnText}>
              🔁 {type === 'flashcards' ? 'Zagraj jeszcze raz' : 'Powtórz lekcję'}
            </Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#FFF9F5',
  },
  backgroundShape: {
    position: 'absolute',
    width,
    height: 280,
    backgroundColor: '#FFE7D6',
    transform: [{ skewY: '-10deg' }],
    borderBottomRightRadius: 60,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    paddingTop: 80,
  },
  emoji: {
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2E2E2E',
  },
  points: {
    fontSize: 24,
    marginBottom: 10,
    color: '#333',
  },
  percentage: {
    fontSize: 18,
    color: '#555',
    marginBottom: 40,
  },
  primaryBtn: {
    backgroundColor: '#6A5ACD',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 14,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  secondaryBtn: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 14,
  },
  btnText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
});

import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useRef } from 'react';
import Animated, { FadeInUp, ZoomIn, BounceIn } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function SummaryScreen() {
  const { score, total, returnPath, type } = useLocalSearchParams();
  const percentage = Math.round((score / total) * 100);

  const getEmoji = () => {
    if (type === 'test') {
      if (score === 0) return '⏱️';
      if (percentage >= 80) return '🏆';
      if (percentage >= 50) return '🎉';
      return '👍';
    }
    return '🎓';
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.backgroundShape} />

      <Animated.View entering={ZoomIn} style={styles.container}>
        <Text style={styles.emoji}>{getEmoji()}</Text>

        <Animated.Text entering={FadeInUp} style={styles.title}>
          Wynik końcowy
        </Animated.Text>

        <Text style={styles.points}>
          Zdobyłeś {score} / {total * (type === 'test' ? 2 : 1)} punktów
        </Text>

        <Text style={styles.percentage}>
          Skuteczność: {percentage}%
        </Text>

        <Animated.View entering={BounceIn.delay(300)} style={{ width: '100%' }}>
          <TouchableOpacity
            onPress={() => router.replace('/home/(tabs)/lesson')}
            style={styles.primaryBtn}
          >
            <Text style={styles.btnText}>🏠 Powrót do lekcji</Text>
          </TouchableOpacity>
        </Animated.View>

        {returnPath && (
          <TouchableOpacity
            onPress={() => router.replace(returnPath)}
            style={styles.secondaryBtn}
          >
            <Text style={styles.btnText}>
              🔁 {type === 'flashcards'
                ? 'Zagraj jeszcze raz'
                : type === 'test'
                ? 'Spróbuj ponownie'
                : 'Powtórz lekcję'}
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
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emoji: {
    fontSize: 50,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  points: {
    fontSize: 22,
    marginBottom: 8,
    color: '#444',
  },
  percentage: {
    fontSize: 18,
    color: '#666',
    marginBottom: 30,
  },
  primaryBtn: {
    backgroundColor: '#6A5ACD',
    paddingVertical: 14,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  secondaryBtn: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  btnText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
});

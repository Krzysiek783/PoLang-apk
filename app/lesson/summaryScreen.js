import { View, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect } from 'react';
import { Animated } from 'react-native';

export default function SummaryScreen() {
const { score, total, returnPath, type } = useLocalSearchParams();

  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const percentage = Math.round((score / total) * 100);

  return (
    <Animated.View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
      opacity: fadeAnim,
    }}>
      <Text style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 20 }}>
        🎉 Gratulacje!
      </Text>
      <Text style={{ fontSize: 24, marginBottom: 10 }}>
        Zdobyłeś {score} / {total} punktów
      </Text>
      <Text style={{ fontSize: 20, color: '#555', marginBottom: 40 }}>
        Skuteczność: {percentage}%
      </Text>

      <TouchableOpacity
        onPress={() => router.replace('../home/(tabs)/lesson')}
        style={{
          backgroundColor: '#4CAF50',
          paddingVertical: 14,
          paddingHorizontal: 30,
          borderRadius: 12,
          marginBottom: 20,
        }}
      >
        <Text style={{ fontSize: 18, color: '#fff' }}>🏠 Powrót do lekcji</Text>
      </TouchableOpacity>

      {returnPath && (
  <TouchableOpacity
    onPress={() => router.replace(returnPath)}
    style={{
      backgroundColor: '#2196F3',
      paddingVertical: 14,
      paddingHorizontal: 30,
      borderRadius: 12,
    }}
  >
    <Text style={{ fontSize: 18, color: '#fff' }}>
      🔁 {type === 'flashcards' ? 'Zagraj jeszcze raz' : 'Powtórz lekcję'}
    </Text>
  </TouchableOpacity>
)}
    </Animated.View>
  );
}

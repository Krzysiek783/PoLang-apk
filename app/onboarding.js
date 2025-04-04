import { View, Text, StyleSheet, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function OnboardingScreen() {
  const router = useRouter();

  const handleStart = () => {
    router.replace('./home/homeScreen'); // ⬅️ zmień na ścieżkę główną aplikacji
  };

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🎉</Text>
      <Text style={styles.title}>Witamy w PoLang!</Text>
      <Text style={styles.description}>
        Cieszymy się, że jesteś z nami. Nasza aplikacja pomoże Ci w codziennej nauce angielskiego —
        krok po kroku 💪
      </Text>

      <Text style={styles.bullet}>✅ Krótkie lekcje każdego dnia</Text>
      <Text style={styles.bullet}>✅ Fiszki, quizy i wyzwania</Text>
      <Text style={styles.bullet}>✅ Punkty i nagrody za aktywność</Text>

      <Button title="Zaczynamy!" onPress={handleStart} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
    backgroundColor: '#fff',
    gap: 20,
  },
  emoji: {
    fontSize: 40,
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#444',
  },
  bullet: {
    fontSize: 16,
    paddingLeft: 10,
    color: '#222',
  },
});

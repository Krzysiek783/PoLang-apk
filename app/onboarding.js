import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const router = useRouter();

  const handleStart = () => {
    router.replace('./home/(tabs)/index');
  };

  return (
    <LinearGradient
      colors={['#FFE7D6', '#FFD5A5']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <View style={styles.container}>
        <Text style={styles.emoji}>🎉</Text>
        <Text style={styles.title}>Witamy w PoLang!</Text>
        <Text style={styles.description}>
          Super, że dołączyłeś! 🚀
          PoLang to Twoja codzienna porcja angielskiego — prosto, lekko i skutecznie.
        </Text>

        <View style={styles.features}>
          <Text style={styles.bullet}>🎯 Krótkie, skuteczne lekcje</Text>
          <Text style={styles.bullet}>🧠 Fiszki, quizy, dialogi</Text>
          <Text style={styles.bullet}>🔥 System punktów i streaków</Text>
        </View>

        <Image
          source={require('../assets/illustrations/learning-bro.png')} // podmień na swój obrazek jeśli chcesz
          style={styles.illustration}
          resizeMode="contain"
        />

        <TouchableOpacity style={styles.button} onPress={handleStart}>
          <Text style={styles.buttonText}>Zaczynamy!</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 50,
    marginBottom: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#2E2E2E',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    paddingHorizontal: 10,
    lineHeight: 22,
  },
  features: {
    marginTop: 20,
    gap: 10,
  },
  bullet: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
  },
  illustration: {
    width: width * 0.8,
    height: 200,
    marginVertical: 20,
  },
  button: {
    backgroundColor: '#F67280',
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

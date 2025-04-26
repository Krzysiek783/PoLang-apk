import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import ProgressDots from '../../../src/components/ProgressDots';

export default function Step3Age() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [age, setAge] = useState(18);
  const animatedAge = useSharedValue(18);

  const [fontsLoaded] = useFonts({
    Poppins: require('../../../assets/fonts/Poppins-Regular.ttf'),
    PoppinsBold: require('../../../assets/fonts/Poppins-Bold.ttf'),
  });

  if (!fontsLoaded) return null;

  const changeAge = (delta) => {
    let newAge = age + delta;
    if (newAge >= 7 && newAge <= 100) {
      setAge(newAge);
      animatedAge.value = withTiming(newAge, { duration: 200 });
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 }],
    opacity: 1,
  }));

  const handleNext = () => {
    router.push({
      pathname: './step4-gender',
      params: {
        ...params,
        age,
      },
    });
  };

  return (
    <LinearGradient
      colors={['#FDE3A7', '#F8B195', '#F67280']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.3, y: 1 }}
      style={styles.gradient}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <ProgressDots current={3} />
          <Text style={styles.title}>🎂 Podaj swój wiek</Text>

          <View style={styles.displayBox}>
            <TouchableOpacity style={styles.control} onPress={() => changeAge(-1)}>
              <Text style={styles.controlText}>−</Text>
            </TouchableOpacity>

            <Animated.Text style={[styles.ageDisplay, animatedStyle]}>
              {age}
            </Animated.Text>

            <TouchableOpacity style={styles.control} onPress={() => changeAge(1)}>
              <Text style={styles.controlText}>+</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>Dalej</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: {
    paddingTop: 60,
    paddingBottom: 80,
    paddingHorizontal: 30,
    alignItems: 'center',
    gap: 40,
  },
  title: {
    fontSize: 24,
    fontFamily: 'PoppinsBold',
    color: '#222',
    textAlign: 'center',
  },
  displayBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  control: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  controlText: {
    fontSize: 40,
    color: '#fff',
    fontWeight: 'bold',
  },
  ageDisplay: {
    fontSize: 48,
    fontFamily: 'PoppinsBold',
    color: '#fff',
    marginHorizontal: 30,
  },
  button: {
    backgroundColor: '#17D5FF',
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'PoppinsBold',
  },
});

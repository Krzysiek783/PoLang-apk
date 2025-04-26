import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign } from '@expo/vector-icons';
import ProgressDots from '../../../src/components/ProgressDots';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useFonts } from 'expo-font';

const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export default function Step5Level() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [level, setLevel] = useState(null);

  const [fontsLoaded] = useFonts({
    Poppins: require('../../../assets/fonts/Poppins-Regular.ttf'),
    PoppinsBold: require('../../../assets/fonts/Poppins-Bold.ttf'),
  });

  if (!fontsLoaded) return null;

  const handleNext = () => {
    if (!level) return Alert.alert('Błąd', 'Wybierz poziom językowy.');

    router.push({
      pathname: './step6-notifications',
      params: {
        ...params,
        level,
      },
    });
  };

  return (
    <LinearGradient
      colors={['#FDE3A7', '#F8B195', '#F67280']}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.3, y: 1 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <ProgressDots current={6} />

          <Text style={styles.title}>📊 Wybierz swój poziom językowy</Text>

          {levels.map((lvl, index) => {
            const isSelected = level === lvl;
            return (
              <Animated.View
                key={index}
                entering={FadeInUp.delay(index * 100)}
              >
                <TouchableOpacity
                  style={[styles.option, isSelected && styles.selected]}
                  onPress={() => setLevel(lvl)}
                >
                  <Text
                    style={[styles.optionText, isSelected && styles.optionTextSelected]}
                  >
                    {lvl}
                  </Text>
                  {isSelected && (
                    <AntDesign name="checkcircle" size={20} color="#38A169" />
                  )}
                </TouchableOpacity>
              </Animated.View>
            );
          })}

          <TouchableOpacity
            style={[styles.button, !level && { opacity: 0.5 }]}
            onPress={handleNext}
            disabled={!level}
          >
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
    paddingTop: 50,
    paddingBottom: 80,
    paddingHorizontal: 30,
    gap: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'PoppinsBold',
    textAlign: 'center',
    color: '#222',
    marginBottom: 10,
  },
  option: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selected: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderColor: '#38A169',
    borderWidth: 2,
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'Poppins',
    color: '#222',
  },
  optionTextSelected: {
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#17D5FF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'PoppinsBold',
  },
});

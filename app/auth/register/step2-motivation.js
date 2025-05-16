import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';
import { AntDesign } from '@expo/vector-icons';
import ProgressDots from '../../../src/components/ProgressDots';

const reasons = [
  "Chcę podróżować",
  "Praca zawodowa",
  "Studia / szkoła",
  "Lubię języki",
  "Dla zabawy",
  "Chcę się przeprowadzić",
];

export default function Step2Motivation() {
  const router = useRouter();
  const { nick, email, password } = useLocalSearchParams();

  console.log('Nick:', nick);
  console.log('Email:', email);
  console.log('Password:', password);
  const [selected, setSelected] = useState([]);

  const [fontsLoaded] = useFonts({
    Poppins: require('../../../assets/fonts/Poppins-Regular.ttf'),
    PoppinsBold: require('../../../assets/fonts/Poppins-Bold.ttf'),
  });

  if (!fontsLoaded) return null;

  const toggleReason = (reason) => {
    if (selected.includes(reason)) {
      setSelected(selected.filter(r => r !== reason));
    } else {
      setSelected([...selected, reason]);
    }
  };

  const handleNext = () => {
    if (selected.length === 0) {
      return Alert.alert('Uwaga', 'Wybierz przynajmniej jeden powód.');
    }

    router.push({
      pathname: './step3-age',
      params: {
      nick,
      email,
      password,
      motivations: JSON.stringify(selected),
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
          <ProgressDots current={2} />

          <Animated.Text entering={FadeInUp.duration(400)} style={styles.title}>
            🧠 Dlaczego chcesz się uczyć?
          </Animated.Text>

          {reasons.map((reason, index) => {
            const isSelected = selected.includes(reason);
            return (
              <Animated.View
                key={index}
                entering={FadeInUp.duration(400).delay(100 + index * 80)}
              >
                <TouchableOpacity
                  style={[styles.option, isSelected && styles.optionSelected]}
                  onPress={() => toggleReason(reason)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                    ]}
                  >
                    {reason}
                  </Text>
                  {isSelected && <AntDesign name="checkcircle" size={20} color="#38A169" />}
                </TouchableOpacity>
              </Animated.View>
            );
          })}

          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>Dalej</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    padding: 30,
    gap: 18,
    paddingBottom: 80,
  },
  title: {
    fontSize: 24,
    fontFamily: 'PoppinsBold',
    color: '#222',
    textAlign: 'center',
    marginBottom: 20,
  },
  option: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionSelected: {
    borderColor: '#38A169',
    borderWidth: 2,
  },
  optionText: {
    fontSize: 16,
    color: '#222',
    fontFamily: 'Poppins',
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

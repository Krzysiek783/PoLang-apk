import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';
import ProgressDots from '../../../src/components/ProgressDots';

const genderOptions = [
  {
    label: 'Mężczyzna',
    value: 'male',
    color: '#17D5FF',
    icon: '♂',
  },
  {
    label: 'Kobieta',
    value: 'female',
    color: '#FF62C4',
    icon: '♀',
  },
];

export default function Step4Gender() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selected, setSelected] = useState(null);

  const [fontsLoaded] = useFonts({
    Poppins: require('../../../assets/fonts/Poppins-Regular.ttf'),
    PoppinsBold: require('../../../assets/fonts/Poppins-Bold.ttf'),
  });

  if (!fontsLoaded) return null;

  const handleNext = () => {
    if (!selected) return;
    router.push({
      pathname: './step5-level',
      params: {
        ...params,
        gender: selected,
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
          <ProgressDots current={4} />

          <Text style={styles.title}>🚻 Wybierz swoją płeć</Text>

          <View style={styles.columns}>
            {genderOptions.map((option) => {
              const isActive = selected === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={styles.genderBlock}
                  onPress={() => setSelected(option.value)}
                >
                  <View
                    style={[
                      styles.circle,
                      { backgroundColor: option.color },
                      isActive && styles.selectedCircle,
                    ]}
                  >
                    <Text style={styles.icon}>{option.icon}</Text>
                  </View>
                  <Text
                    style={[
                      styles.label,
                      isActive && styles.labelSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={[
              styles.neutralBox,
              selected === 'none' && styles.selectedNeutral,
            ]}
            onPress={() => setSelected('none')}
          >
            <Text style={styles.neutralText}>Nie chcę podawać</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNext}
            disabled={!selected}
            style={[styles.button, !selected && { opacity: 0.5 }]}
          >
            <Text style={styles.buttonText}>Kontynuuj</Text>
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
    alignItems: 'center',
    gap: 30,
  },
  title: {
    fontSize: 24,
    fontFamily: 'PoppinsBold',
    color: '#222',
    textAlign: 'center',
  },
  columns: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 20,
  },
  genderBlock: {
    alignItems: 'center',
    gap: 12,
  },
  circle: {
    width: 130,
    height: 130,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCircle: {
    borderWidth: 4,
    borderColor: '#222',
  },
  icon: {
    fontSize: 64,
    color: '#fff',
  },
  label: {
    fontSize: 16,
    fontFamily: 'Poppins',
    color: '#444',
  },
  labelSelected: {
    fontWeight: 'bold',
    color: '#222',
  },
  neutralBox: {
    marginTop: 10,
    backgroundColor: '#BDBDBD',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
  },
  selectedNeutral: {
    borderWidth: 2,
    borderColor: '#333',
  },
  neutralText: {
    color: '#fff',
    fontFamily: 'Poppins',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#17D5FF',
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 12,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'PoppinsBold',
  },
});

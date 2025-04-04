import { useState } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

const options = ['Kobieta', 'Mężczyzna', 'Inna', 'Wolę nie mówić'];

export default function Step4Gender() {
  const router = useRouter();
  const params = useLocalSearchParams(); // odbieramy dane z poprzednich kroków

  const [selected, setSelected] = useState(null);

  const handleNext = () => {
    if (!selected) {
      return Alert.alert("Błąd", "Wybierz swoją płeć.");
    }

    router.push({
      pathname: './step5-level',
      params: {
        ...params,
        gender: selected,
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚧️ Jaką masz płeć?</Text>

      {options.map((opt, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.option, selected === opt && styles.selected]}
          onPress={() => setSelected(opt)}
        >
          <Text style={styles.optionText}>{opt}</Text>
        </TouchableOpacity>
      ))}

      <Button title="Dalej" onPress={handleNext} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  option: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
  },
  selected: {
    backgroundColor: '#e6f0ff',
    borderColor: '#339af0',
  },
  optionText: {
    fontSize: 16,
  },
});

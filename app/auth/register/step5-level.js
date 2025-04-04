import { useState } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export default function Step5Level() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [level, setLevel] = useState(null);

  const handleNext = () => {
    if (!level) return Alert.alert("Błąd", "Wybierz poziom językowy.");

    // przechodzimy do ostatniego kroku: powiadomienia
    router.push({
      pathname: './step6-notifications',
      params: {
        ...params,
        level,
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 Wybierz swój poziom językowy</Text>

      {levels.map((lvl, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.option, level === lvl && styles.selected]}
          onPress={() => setLevel(lvl)}
        >
          <Text style={styles.optionText}>{lvl}</Text>
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
    gap: 15,
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
    backgroundColor: '#d0f0c0',
    borderColor: '#4CAF50',
  },
  optionText: {
    fontSize: 16,
  },
});

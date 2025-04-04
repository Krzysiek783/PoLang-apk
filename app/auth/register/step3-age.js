import { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function Step3Age() {
  const router = useRouter();
  const params = useLocalSearchParams(); // odbieramy wcześniejsze dane

  const [age, setAge] = useState('');

  const handleNext = () => {
    const parsedAge = parseInt(age);

    if (isNaN(parsedAge) || parsedAge < 6 || parsedAge > 120) {
      return Alert.alert("Błąd", "Podaj prawidłowy wiek (między 6 a 120 lat).");
    }

    // przekazujemy wszystkie dane dalej
    router.push({
      pathname: './step4-gender',
      params: {
        ...params,
        age: parsedAge,
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎂 Ile masz lat?</Text>

      <TextInput
        placeholder="Wiek"
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
        style={styles.input}
      />

      <Button title="Dalej" onPress={handleNext} />
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
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
});

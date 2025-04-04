import { useState } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

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
  const params = useLocalSearchParams(); // odbieramy nick, email, password

  const [selected, setSelected] = useState([]);

  const toggleReason = (reason) => {
    if (selected.includes(reason)) {
      setSelected(selected.filter(r => r !== reason));
    } else {
      setSelected([...selected, reason]);
    }
  };

  const handleNext = () => {
    if (selected.length === 0) {
      return alert("Wybierz przynajmniej jeden powód.");
    }

    // przejście do kolejnego kroku, przekazujemy wszystkie dane dalej
    router.push({
      pathname: './step3-age',
      params: {
        ...params,
        motivations: JSON.stringify(selected), // przekazujemy jako string!
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧠 Dlaczego chcesz się uczyć?</Text>

      {reasons.map((reason, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.option, selected.includes(reason) && styles.selected]}
          onPress={() => toggleReason(reason)}
        >
          <Text style={styles.optionText}>{reason}</Text>
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
    gap: 10,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  option: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
  },
  selected: {
    backgroundColor: '#d0ebff',
    borderColor: '#339af0',
  },
  optionText: {
    fontSize: 16,
  },
});

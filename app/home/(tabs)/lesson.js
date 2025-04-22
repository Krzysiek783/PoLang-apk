import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';


export default function LessonScreen() {
  const navigation = useNavigation();


  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        📚 Wybierz rodzaj lekcji
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>

      <TouchableOpacity 
        onPress={() => router.push('../../lesson/vocabulary/flashcards')}
          style={{
            width: '48%',
            backgroundColor: '#f0f0f0',
            padding: 20,
            borderRadius: 16,
            marginBottom: 15,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 20 }}>🧠</Text>
          <Text style={{ fontWeight: 'bold', marginTop: 10 }}>Fiszki</Text>
          <Text>Ucz się słówek</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('../../lesson/listening/listenScreen')}
          style={{
            width: '48%',
            backgroundColor: '#f0f0f0',
            padding: 20,
            borderRadius: 16,
            marginBottom: 15,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 20 }}>🎧</Text>
          <Text style={{ fontWeight: 'bold', marginTop: 10 }}>Słuchanie</Text>
          <Text>Dialogi + pytania</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('../../lesson/Grammar/FillBlankScreen')}
          style={{
            width: '48%',
            backgroundColor: '#f0f0f0',
            padding: 20,
            borderRadius: 16,
            marginBottom: 15,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 20 }}>📘</Text>
          <Text style={{ fontWeight: 'bold', marginTop: 10 }}>Gramatyka</Text>
          <Text>Ćwiczenia i teoria</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

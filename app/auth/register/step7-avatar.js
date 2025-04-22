import { useState } from 'react';
import { View, Text, Button, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

// 🔹 Predefiniowane avatary – linki z Firebase Storage
const predefinedAvatars = [
  "https://firebasestorage.googleapis.com/v0/b/polang-app.firebasestorage.app/o/avatars%2Favatar1.png?alt=media",
  // "https://firebasestorage.googleapis.com/v0/b/polang-app.firebasestorage.app/o/avatars%2Favatar2.png?alt=media",
  // "https://firebasestorage.googleapis.com/v0/b/polang-app.firebasestorage.app/o/avatars%2Favatar1.png?alt=media",
  // "https://firebasestorage.googleapis.com/v0/b/polang-app.firebasestorage.app/o/avatars%2Favatar1.png?alt=media",
  // "https://firebasestorage.googleapis.com/v0/b/polang-app.firebasestorage.app/o/avatars%2Favatar1.png?alt=media",
  // "https://firebasestorage.googleapis.com/v0/b/polang-app.firebasestorage.app/o/avatars%2Favatar1.png?alt=media",
];

export default function Step7Avatar() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [selectedUri, setSelectedUri] = useState(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      return Alert.alert("Brak dostępu", "Musisz zezwolić na dostęp do zdjęć.");
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      // 📌 WAŻNE: teraz tylko zapisujemy URI
      setSelectedUri(result.assets[0].uri);
    }
  };

  const handleNext = () => {
    if (!selectedUri) {
      return Alert.alert("Wybierz avatar", "Musisz wybrać jeden z avatarów lub dodać własny.");
    }

    router.push({
      pathname: './confirm',
      params: {
        ...params,
        avatarUri: selectedUri, // ← lokalne URI albo gotowy URL z Firebase
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🖼️ Wybierz swój avatar</Text>

      <View style={styles.avatarsRow}>
        {predefinedAvatars.map((img, idx) => (
          <TouchableOpacity key={idx} onPress={() => setSelectedUri(img)}>
            <Image
              source={{ uri: img }}
              style={[
                styles.avatar,
                selectedUri === img && styles.selected,
              ]}
            />
          </TouchableOpacity>
        ))}
      </View>

      <Button title="📷 Wybierz z galerii" onPress={pickImage} />

      {selectedUri && (
        <Image source={{ uri: selectedUri }} style={styles.preview} />
      )}

      <Button title="Zakończ rejestrację" onPress={handleNext} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    gap: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  avatarsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 15,
    marginBottom: 10,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selected: {
    borderColor: '#007bff',
  },
  preview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginTop: 10,
  },
});







//https://firebasestorage.googleapis.com/v0/b/polang-app.firebasestorage.app/o/avatars%2Favatar1.png?alt=media
//https://firebasestorage.googleapis.com/v0/b/polang-app.firebasestorage.app/o/avatars/avatar1.png?alt=media
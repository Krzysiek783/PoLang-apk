import { useState } from 'react';
import { View, Text, Button, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

const predefinedAvatars = [
  require('../../../assets/avatars/avatar1.png'),
  require('../../../assets/avatars/avatar2.png'),
  require('../../../assets/avatars/avatar3.png'),
  require('../../../assets/avatars/avatar4.png'),
  require('../../../assets/avatars/avatar5.png'),
  require('../../../assets/avatars/avatar6.png'),
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
        avatarUri: selectedUri,
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🖼️ Wybierz swój avatar</Text>

      <View style={styles.avatarsRow}>
        {predefinedAvatars.map((img, idx) => (
          <TouchableOpacity key={idx} onPress={() => setSelectedUri(Image.resolveAssetSource(img).uri)}>
            <Image
              source={img}
              style={[
                styles.avatar,
                selectedUri === Image.resolveAssetSource(img).uri && styles.selected,
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
